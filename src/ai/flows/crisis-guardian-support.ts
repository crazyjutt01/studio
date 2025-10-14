'use server';

/**
 * @fileOverview A proactive AI agent that detects financial stress and provides empathetic recovery plans.
 *
 * - `getCrisisSupport` - A function that analyzes financial data and returns a supportive recovery plan.
 * - `CrisisSupportInput` - The input type for the `getCrisisSupport` function.
 * - `CrisisSupportOutput` - The return type for the `getCrisisSupport` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CrisisSupportInputSchema = z.object({
  transactions: z
    .string()
    .describe("A JSON string of the user's recent transactions."),
  budgets: z.string().describe("A JSON string of the user's budgets."),
  savingGoals: z
    .string()
    .describe("A JSON string of the user's saving goals."),
});
export type CrisisSupportInput = z.infer<typeof CrisisSupportInputSchema>;

const CrisisSupportOutputSchema = z.object({
  friendlyMessage: z.string().describe("A short, empathetic, and friendly message to the user, like a friend would say."),
  recoveryPlan: z
    .array(
      z.object({
        title: z.string().describe('The title of the suggested step in the recovery plan.'),
        details: z.string().describe('A detailed explanation of the recovery step.'),
      })
    )
    .describe('An array of actionable steps to help the user get back on track.'),
});
export type CrisisSupportOutput = z.infer<typeof CrisisSupportOutputSchema>;

export async function getCrisisSupport(
  input: CrisisSupportInput
): Promise<CrisisSupportOutput> {
  return crisisSupportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'crisisSupportPrompt',
  input: {schema: CrisisSupportInputSchema},
  output: {schema: CrisisSupportOutputSchema},
  prompt: `You are CrisisGuardian, a friendly and empathetic AI financial protector. Your motto is: “I step in when things go wrong.”

Your role is to analyze a user's financial data to spot signs of distress, like a sudden large expense, a drop in income, or consistent overspending.

When you detect a problem, you respond like a caring friend, not a machine. Start with an empathetic message acknowledging the situation. Then, provide a calm, step-by-step recovery plan to help them get back on track.

For example, if you see a large, unexpected car repair bill, you might say: “That was a big hit on your savings 😥. I’ve paused new spending goals for this week and planned a recovery plan for the next 10 days.”

Analyze the following user data:
- Transactions: {{{transactions}}}
- Budgets: {{{budgets}}}
- Saving Goals: {{{savingGoals}}}

First, determine if there is a financial stress event. A stress event is defined as any single transaction that is significantly larger than the user's average transaction amount, or a pattern of spending that exceeds budgets. If not, provide a reassuring message that things look okay and an empty recovery plan.

If there is a stress event, identify it.

Then, generate your response:
1.  **Friendly Message:** Write a short, empathetic message that acknowledges the specific situation. Use emojis where appropriate.
2.  **Recovery Plan:** Create a clear, step-by-step plan with 2-3 actionable steps. This could include suggestions like temporarily pausing a savings goal, adjusting a budget, or cutting back on specific spending categories for a short period.
`,
});

const crisisSupportFlow = ai.defineFlow(
  {
    name: 'crisisSupportFlow',
    inputSchema: CrisisSupportInputSchema,
    outputSchema: CrisisSupportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
