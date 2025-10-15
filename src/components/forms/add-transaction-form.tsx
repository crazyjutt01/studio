'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, addDocumentNonBlocking, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where, Timestamp, getDocs, limit } from 'firebase/firestore';
import { Loader2, CalendarIcon } from 'lucide-react';
import type { Transaction, UserData, Budget, SavingsGoal, Alert } from '@/lib/data';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '../ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { generateAlerts } from '@/ai/flows/alert-generator';

const formSchema = z.object({
  description: z.string().min(2, { message: 'Description must be at least 2 characters.' }),
  amount: z.coerce.number().positive({ message: 'Amount must be positive.' }),
  date: z.date({ required_error: 'A date is required.' }),
  category: z.enum(['Food', 'Travel', 'Shopping', 'Bills']),
});

type AddTransactionFormValues = z.infer<typeof formSchema>;

interface AddTransactionFormProps {
  onSuccess?: () => void;
}

export function AddTransactionForm({ onSuccess }: AddTransactionFormProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `users/${user.uid}`);
  }, [user, firestore]);

  const transactionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.uid}/transactions`);
  }, [user, firestore]);

  const budgetsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.uid}/budgets`);
  }, [user, firestore]);

  const savingsGoalsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.uid}/savingGoals`);
  }, [user, firestore]);

  const { data: userData } = useDoc<UserData>(userDocRef);
  const { data: transactionsData } = useCollection<Transaction>(transactionsQuery);
  const { data: budgetsData } = useCollection<Budget>(budgetsQuery);
  const { data: savingsGoalsData } = useCollection<SavingsGoal>(savingsGoalsQuery);

  const form = useForm<AddTransactionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      amount: '' as any,
      date: new Date(),
    },
  });

  const { isSubmitting } = form.formState;

  const triggerAlertCheck = async (newTransaction: Omit<Transaction, 'id'>) => {
    if (!user || !firestore || !userData || !userData.smartReminders || !transactionsData || !budgetsData || !savingsGoalsData) {
      return;
    }

    try {
      const updatedTransactions = [...transactionsData, { ...newTransaction, id: 'temp' }];

      const alertSuggestions = await generateAlerts({
        userId: user.uid,
        transactions: JSON.stringify(updatedTransactions),
        budgets: JSON.stringify(budgetsData),
        goals: JSON.stringify(savingsGoalsData),
        monthlyIncome: userData.monthlyIncome,
      });

      if (!alertSuggestions || alertSuggestions.length === 0) {
        return;
      }
      
      const alertsCol = collection(firestore, `users/${user.uid}/alerts`);

      for (const suggestion of alertSuggestions) {
        if (suggestion.shouldCreate && suggestion.trigger) {
           const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
           const recentAlertsQuery = query(
             alertsCol,
             where('trigger', '==', suggestion.trigger),
             where('timestamp', '>', sevenDaysAgo.toISOString()),
             limit(1)
           );
           
           const recentAlertsSnapshot = await getDocs(recentAlertsQuery);

           if(recentAlertsSnapshot.empty) {
                const alertData: Omit<Alert, 'id'> = {
                    userId: user.uid,
                    type: suggestion.type!,
                    message: suggestion.message!,
                    trigger: suggestion.trigger,
                    timestamp: new Date().toISOString(),
                    isRead: false,
                };
                addDocumentNonBlocking(alertsCol, alertData);
           }
        }
      }

    } catch (error) {
      console.error("Failed to trigger smart reminder check:", error);
       toast({
        variant: 'destructive',
        title: 'Smart Reminder Failed',
        description: 'Could not check for smart reminders due to an error.',
      });
    }
  };

  async function onSubmit(values: AddTransactionFormValues) {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to add a transaction.',
      });
      return;
    }

    try {
      const transactionsCol = collection(firestore, `users/${user.uid}/transactions`);
      const transactionData: Omit<Transaction, 'id'> = {
        ...values,
        date: values.date.toISOString(),
        userId: user.uid,
      };
      addDocumentNonBlocking(transactionsCol, transactionData);

      toast({
        title: 'Transaction Added!',
        description: `Transaction for ${values.description} has been successfully added.`,
      });
      
      // Trigger the AI check non-blockingly
      triggerAlertCheck(transactionData);

      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error adding document: ', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem saving your transaction. Please try again.',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Coffee" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="5.75" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="Food">Food</SelectItem>
                        <SelectItem value="Travel">Travel</SelectItem>
                        <SelectItem value="Shopping">Shopping</SelectItem>
                        <SelectItem value="Bills">Bills</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date of Transaction</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add Transaction
        </Button>
      </form>
    </Form>
  );
}
