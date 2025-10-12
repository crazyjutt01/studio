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
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Loader2, CalendarIcon } from 'lucide-react';
import type { SavingsGoal } from '@/lib/data';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '../ui/calendar';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Goal name must be at least 2 characters.' }),
  targetAmount: z.coerce.number().positive({ message: 'Target amount must be positive.' }),
  currentAmount: z.coerce.number().min(0, { message: 'Current amount cannot be negative.' }).default(0),
  deadline: z.date().optional(),
});

type AddGoalFormValues = z.infer<typeof formSchema>;

interface AddGoalFormProps {
  onSuccess?: () => void;
}

export function AddGoalForm({ onSuccess }: AddGoalFormProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<AddGoalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      targetAmount: undefined,
      currentAmount: 0,
      deadline: undefined,
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: AddGoalFormValues) {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to add a goal.',
      });
      return;
    }

    try {
      const goalsCol = collection(firestore, `users/${user.uid}/savingGoals`);
      const goalData: Omit<SavingsGoal, 'id'> = {
        ...values,
        deadline: values.deadline?.toISOString(),
        userId: user.uid,
      };
      await addDocumentNonBlocking(goalsCol, goalData);

      toast({
        title: 'Goal Added!',
        description: `Your goal "${values.name}" has been successfully added.`,
      });
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error adding document: ', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem saving your goal. Please try again.',
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
              <FormLabel>Goal Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Vacation Fund" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="targetAmount"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Target Amount</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="1000" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="currentAmount"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Current Amount</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
         <FormField
            control={form.control}
            name="deadline"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <FormLabel>Target Date (Optional)</FormLabel>
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
                        disabled={(date) => date < new Date()}
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
          Add Goal
        </Button>
      </form>
    </Form>
  );
}
