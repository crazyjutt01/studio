'use server';

/**
 * @fileOverview A flow that analyzes user's financial data to suggest alerts.
 *
 * - generateAlerts - A function that checks for overspending and suggests alerts to be created.
 * - GenerateAlertsInput - The input type for the generateAlerts function.
 * - GenerateAlertsOutput - The return type for the generateAlerts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAlertsInputSchema = z.object({
  userId: z.string().describe('The user ID.'),
  transactions: z
    .string()
    .describe("A JSON string of the user's recent transactions."),
  budgets: z.string().describe("A JSON string of the user's budgets."),
  goals: z.string().describe("A JSON string of the user's saving goals."),
  monthlyIncome: z.number().describe("The user's monthly income."),
});
export type GenerateAlertsInput = z.infer<typeof GenerateAlertsInputSchema>;

const AlertSuggestionSchema = z.object({
  shouldCreate: z.boolean().describe('Whether an alert should be created.'),
  type: z
    .string()
    .optional()
    .describe(
      'Type of the alert (e.g., "Budget Warning", "Spending Spike", "Goal Progress").'
    ),
  message: z.string().optional().describe('The alert message.'),
  trigger: z
    .string()
    .optional()
    .describe('The reason the alert was triggered.'),
});
export type AlertSuggestion = z.infer<typeof AlertSuggestionSchema>;

const GenerateAlertsOutputSchema = z.array(AlertSuggestionSchema);
export type GenerateAlertsOutput = z.infer<typeof GenerateAlertsOutputSchema>;


export async function generateAlerts(
  input: GenerateAlertsInput
): Promise<GenerateAlertsOutput> {
  return generateAlertsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAlertsPrompt',
  input: {schema: GenerateAlertsInputSchema},
  output: {schema: GenerateAlertsOutputSchema},
  prompt: `You are an intelligent financial assistant, AlertGenie. Your task is to analyze a user's financial data to generate helpful, timely, and motivational alerts.

Analyze the user's data:
- Monthly Income: {{{monthlyIncome}}}
- Budgets: {{{budgets}}}
- Saving Goals: {{{goals}}}
- Transactions: {{{transactions}}}

Generate alerts based on the following rules. You will return a suggestion for each rule that is met.

1.  **Total Spending vs. Income**:
    - Calculate the total spending for the current month from the transactions.
    - If total spending crosses 75% of the monthly income, create one alert suggestion with:
      - shouldCreate: true
      - type: "Budget Warning"
      - message: "⚠️ You’ve already used 75% of your budget for this month. Stay alert!"
      - trigger: "Total spending exceeded 75% of monthly income."

2.  **Category Spending Spike**:
    - For the category of the MOST RECENT transaction, calculate the total spending in that category this week (last 7 days).
    - Calculate the average weekly spending for that same category over the last 4 weeks.
    - If this week's spending in that category is greater than the average, create one alert suggestion with:
      - shouldCreate: true
      - type: "Spending Spike"
      - message: "🍔 You spent more on [Category Name] this week than usual. Want to set a limit?" (replace [Category Name] with the actual category).
      - trigger: "Spending in [Category Name] is higher than the weekly average."

3.  **Goal Progress Motivation**:
    - Calculate the total spending for the current month.
    - If the total spending is UNDER 50% of the monthly income, create one alert suggestion with:
      - shouldCreate: true
      - type: "Goal Progress"
      - message: "🌱 Great progress! You’re managing your expenses wisely this month."
      - trigger: "Monthly spending is below 50% of income."

For each alert to be created, set "shouldCreate" to true and fill in the other fields. If no conditions are met for a rule, either omit it or set shouldCreate to false. Return an array of all suggestions where shouldCreate is true.
`,
});

const generateAlertsFlow = ai.defineFlow(
  {
    name: 'generateAlertsFlow',
    inputSchema: GenerateAlertsInputSchema,
    outputSchema: GenerateAlertsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output || [];
  }
);
