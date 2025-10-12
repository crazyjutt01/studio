'use server';

/**
 * @fileOverview Provides personalized financial tips based on user spending habits.
 *
 * - `getPersonalizedTips` -  A function that takes user spending data and returns personalized financial tips.
 * - `PersonalizedTipsInput` - The input type for the `getPersonalizedTips` function.
 * - `PersonalizedTipsOutput` - The return type for the `getPersonalizedTips` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedTipsInputSchema = z.object({
  income: z.number().describe('Monthly income of the user.'),
  expenses: z
    .array(
      z.object({
        category: z.string().describe('Category of the expense (e.g., food, travel).'),
        amount: z.number().describe('Amount spent in the category.'),
      })
    )
    .describe('List of expenses with category and amount.'),
  savingGoals: z.string().describe('User specified saving goals'),
});
export type PersonalizedTipsInput = z.infer<typeof PersonalizedTipsInputSchema>;

const PersonalizedTipsOutputSchema = z.object({
  tips: z.array(
    z.string().describe('A personalized financial tip for the user.')
  ).describe('Array of personalized financial tips'),
});
export type PersonalizedTipsOutput = z.infer<typeof PersonalizedTipsOutputSchema>;

export async function getPersonalizedTips(input: PersonalizedTipsInput): Promise<PersonalizedTipsOutput> {
  return budgetBotPersonalizedTipsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'budgetBotPersonalizedTipsPrompt',
  input: {schema: PersonalizedTipsInputSchema},
  output: {schema: PersonalizedTipsOutputSchema},
  prompt: `You are a personal finance advisor. Based on the user's income, expenses, and saving goals, provide personalized tips to improve their financial management.

Income: {{{income}}}
Expenses:
{{#each expenses}}
- Category: {{{category}}}, Amount: {{{amount}}}
{{/each}}
Saving Goals: {{{savingGoals}}}

Provide specific and actionable tips. Focus on areas where the user can reduce spending or increase savings.

Format the tips as an array of strings.
`,
});

const budgetBotPersonalizedTipsFlow = ai.defineFlow(
  {
    name: 'budgetBotPersonalizedTipsFlow',
    inputSchema: PersonalizedTipsInputSchema,
    outputSchema: PersonalizedTipsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
