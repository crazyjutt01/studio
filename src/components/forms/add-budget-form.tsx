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
import {
  useUser,
  useFirestore,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
} from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import type { Budget } from '@/lib/data';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '../ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useEffect } from 'react';
import { useGamification } from '@/hooks/use-gamification';

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Budget name must be at least 2 characters.' }),
  amount: z.coerce.number().positive({ message: 'Amount must be positive.' }),
  startDate: z.date({ required_error: 'A start date is required.' }),
  endDate: z.date({ required_error: 'An end date is required.' }),
  category: z.enum(['Food', 'Travel', 'Shopping', 'Bills', 'Overall', 'Others']),
});

type AddBudgetFormValues = z.infer<typeof formSchema>;

interface AddBudgetFormProps {
  onSuccess?: () => void;
  budget?: Budget | null;
}

export function AddBudgetForm({ onSuccess, budget }: AddBudgetFormProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const isEditMode = !!budget;
  const { awardXP } = useGamification();

  const form = useForm<AddBudgetFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      amount: '' as any,
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      category: 'Overall',
    },
  });

  useEffect(() => {
    if (isEditMode && budget) {
      form.reset({
        name: budget.name,
        amount: budget.amount,
        startDate: new Date(budget.startDate),
        endDate: new Date(budget.endDate),
        category: budget.category,
      });
    } else {
        form.reset({
            name: '',
            amount: '' as any,
            startDate: new Date(),
            endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
            category: 'Overall'
        });
    }
  }, [budget, isEditMode, form]);

  const { isSubmitting } = form.formState;

  async function onSubmit(values: AddBudgetFormValues) {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to add a budget.',
      });
      return;
    }

    try {
      const budgetData: Omit<Budget, 'id'> = {
        ...values,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        userId: user.uid,
      };

      if (isEditMode && budget) {
        const budgetRef = doc(
          firestore,
          `users/${user.uid}/budgets/${budget.id}`
        );
        updateDocumentNonBlocking(budgetRef, budgetData);
        toast({
          title: 'Budget Updated!',
          description: `Your budget "${values.name}" has been successfully updated.`,
        });
      } else {
        const budgetsCol = collection(firestore, `users/${user.uid}/budgets`);
        addDocumentNonBlocking(budgetsCol, budgetData);
        awardXP('add_budget');
      }

      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error adding/updating document: ', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description:
          'There was a problem saving your budget. Please try again.',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Monthly Groceries" {...field} />
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
                  <Input type="number" placeholder="500" {...field} />
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Overall">Overall</SelectItem>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Travel">Travel</SelectItem>
                    <SelectItem value="Shopping">Shopping</SelectItem>
                    <SelectItem value="Bills">Bills</SelectItem>
                    <SelectItem value="Others">Others</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
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
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
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
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditMode ? 'Save Changes' : 'Add Budget'}
        </Button>      
      </form>
    </Form>
  );
}
