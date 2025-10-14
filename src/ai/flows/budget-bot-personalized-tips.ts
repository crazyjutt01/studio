'use server';

/**
 * @fileOverview Provides a personalized, AI-generated monthly budget based on the user's comprehensive financial data.
 *
 * - `getPersonalizedBudget` -  A function that takes user financial data and returns a suggested budget and summary.
 * - `PersonalizedBudgetInput` - The input type for the `getPersonalizedBudget` function.
 * - `PersonalizedBudgetOutput` - The return type for the `getPersonalizedBudget` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedBudgetInputSchema = z.object({
  income: z.number().describe('Monthly income of the user.'),
  assets: z.number().describe('Total assets of the user.'),
  transactions: z.string().describe('JSON string of recent transactions.'),
  savingGoals: z.string().describe('JSON string of user-specified saving goals.'),
});
export type PersonalizedBudgetInput = z.infer<typeof PersonalizedBudgetInputSchema>;

const PersonalizedBudgetOutputSchema = z.object({
  summary: z.string().describe('A brief, encouraging summary of the budget recommendation.'),
  recommendations: z.array(
    z.object({
        category: z.string().describe('The spending category (e.g., Food, Travel).'),
        amount: z.number().describe('The suggested budget amount for this category.'),
    })
  ).describe('An array of budget recommendations for different spending categories.'),
});
export type PersonalizedBudgetOutput = z.infer<typeof PersonalizedBudgetOutputSchema>;

export async function getPersonalizedBudget(input: PersonalizedBudgetInput): Promise<PersonalizedBudgetOutput> {
  return budgetBotPersonalizedBudgetFlow(input);
}

const prompt = ai.definePrompt({
  name: 'budgetBotPersonalizedBudgetPrompt',
  input: {schema: PersonalizedBudgetInputSchema},
  output: {schema: PersonalizedBudgetOutputSchema},
  prompt: `You are BudgetBot, a friendly and insightful AI financial advisor. Your goal is to help users create a realistic and effective monthly budget.

Analyze the user's complete financial situation based on the data below:
- Monthly Income: {{{income}}}
- Total Assets: {{{assets}}}
- Recent Transactions: {{{transactions}}}
- Savings Goals: {{{savingGoals}}}

Based on this data, generate a recommended monthly budget for the user. The budget should be broken down into the following categories: Food, Travel, Shopping, and Bills.

Your response should include:
1.  A 'summary': A short, encouraging paragraph explaining your recommendations. Mention how this budget helps them achieve their savings goals while being realistic about their spending habits.
2.  A 'recommendations' array: A list of objects, each containing a 'category' and a suggested 'amount' for that category.

Ensure the total of your recommended budget amounts does not exceed the user's monthly income. Be mindful of their past spending habits from their transactions to make the budget realistic.
`,
});

const budgetBotPersonalizedBudgetFlow = ai.defineFlow(
  {
    name: 'budgetBotPersonalizedBudgetFlow',
    inputSchema: PersonalizedBudgetInputSchema,
    outputSchema: PersonalizedBudgetOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
