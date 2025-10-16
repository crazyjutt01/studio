'use server';

/**
 * @fileOverview Generates a simple summary of the user's weekly spending.
 *
 * - advisorAIWeeklySummary - A function that generates the weekly spending summary.
 * - AdvisorAIWeeklySummaryInput - The input type for the advisorAIWeeklySummary function.
 * - AdvisorAIWeeklySummaryOutput - The return type for the advisorAIWeeklySummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdvisorAIWeeklySummaryInputSchema = z.object({
  userId: z.string().describe('The user ID.'),
  transactions: z
    .string()
    .describe('A JSON string of the user\'s recent transactions.'),
  budgets: z.string().describe('A JSON string of the user\'s budgets.'),
  savingGoals: z
    .string()
    .describe('A JSON string of the user\'s saving goals.'),
  question: z
    .string()
    .optional()
    .describe('A specific question from the user about their finances.'),
  region: z.string().optional().describe('The user\'s region (e.g., US, GB).'),
  currency: z.string().optional().describe('The user\'s currency (e.g., USD, GBP).'),
});
export type AdvisorAIWeeklySummaryInput = z.infer<
  typeof AdvisorAIWeeklySummaryInputSchema
>;

const AdvisorAIWeeklySummaryOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A summary of the user weekly spending or an answer to their question.'
    ),
});
export type AdvisorAIWeeklySummaryOutput = z.infer<
  typeof AdvisorAIWeeklySummaryOutputSchema
>;

export async function advisorAIWeeklySummary(
  input: AdvisorAIWeeklySummaryInput
): Promise<AdvisorAIWeeklySummaryOutput> {
  return advisorAIWeeklySummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'advisorAIWeeklySummaryPrompt',
  input: {schema: AdvisorAIWeeklySummaryInputSchema},
  output: {schema: AdvisorAIWeeklySummaryOutputSchema},
  prompt: `You are a personal finance advisor. Your name is AdvisorAI. You are helping a user from the '{{{region}}}' region and their currency is '{{{currency}}}'.
  
  You have access to the user's financial data.
  - Transactions: {{{transactions}}}
  - Budgets: {{{budgets}}}
  - Saving Goals: {{{savingGoals}}}
  
  If the user asks a specific question, answer it based on the data provided. Be thorough and provide actionable advice.
  If the user does not ask a question, generate a concise summary of their financial situation. Focus on key spending areas, budget adherence, and progress towards saving goals. Be friendly and encouraging.
  When mentioning monetary values, use the user's currency.

  User Question: {{{question}}}

  Response:
`,
});

const advisorAIWeeklySummaryFlow = ai.defineFlow(
  {
    name: 'advisorAIWeeklySummaryFlow',
    inputSchema: AdvisorAIWeeklySummaryInputSchema,
    outputSchema: AdvisorAIWeeklySummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
