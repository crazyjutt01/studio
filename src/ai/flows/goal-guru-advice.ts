'use server';

/**
 * @fileOverview Provides personalized advice to help users achieve savings goals faster.
 *
 * - `getGoalAdvice` - A function that takes user financial data and returns goal-oriented advice.
 * - `GoalAdviceInput` - The input type for the `getGoalAdvice` function.
 * - `GoalAdviceOutput` - The return type for the `getGoalAdvice` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GoalAdviceInputSchema = z.object({
  userId: z.string().describe('The user ID.'),
  income: z.number().describe('Monthly income of the user.'),
  expenses: z
    .array(
      z.object({
        category: z.string().describe('Category of the expense (e.g., food, travel).'),
        amount: z.number().describe('Amount spent in the category.'),
      })
    )
    .describe('List of expenses with category and amount.'),
  savingGoals: z.string().describe('A JSON string of the user\'s current saving goals.'),
});
export type GoalAdviceInput = z.infer<typeof GoalAdviceInputSchema>;

const GoalAdviceOutputSchema = z.object({
  tips: z.array(
    z.string().describe('A personalized tip to help the user achieve their savings goal faster.')
  ).describe('Array of personalized goal-hacking tips.'),
});
export type GoalAdviceOutput = z.infer<typeof GoalAdviceOutputSchema>;

export async function getGoalAdvice(input: GoalAdviceInput): Promise<GoalAdviceOutput> {
  return goalGuruAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'goalGuruAdvicePrompt',
  input: {schema: GoalAdviceInputSchema},
  output: {schema: GoalAdviceOutputSchema},
  prompt: `You are GoalGuru, an AI financial advisor focused on helping users achieve their savings goals faster.

Based on the user's income, expenses, and existing savings goals, provide actionable, goal-oriented advice.

Income: {{{income}}}
Expenses:
{{#each expenses}}
- Category: {{{category}}}, Amount: {{{amount}}}
{{/each}}
Saving Goals: {{{savingGoals}}}

Provide specific tips on how to cut spending or allocate funds more effectively to accelerate their progress towards their goals. Keep the tips concise and encouraging.

Format the tips as an array of strings.
`,
});

const goalGuruAdviceFlow = ai.defineFlow(
  {
    name: 'goalGuruAdviceFlow',
    inputSchema: GoalAdviceInputSchema,
    outputSchema: GoalAdviceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
