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
  weeklySpendingData: z
    .string()
    .describe(
      'A JSON string containing the user weekly spending data, with spending categories and amounts.'
    ),
});
export type AdvisorAIWeeklySummaryInput = z.infer<
  typeof AdvisorAIWeeklySummaryInputSchema
>;

const AdvisorAIWeeklySummaryOutputSchema = z.object({
  summary: z.string().describe('A summary of the user weekly spending.'),
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
  prompt: `You are a personal finance advisor. Generate a concise summary of the user's weekly spending based on the data provided. Focus on key spending areas and any notable trends.

Weekly Spending Data: {{{weeklySpendingData}}}

Summary:
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
