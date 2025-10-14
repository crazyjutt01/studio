'use server';

/**
 * @fileOverview A flow that analyzes user's budgets and transactions to generate alerts.
 *
 * - generateAlerts - A function that checks for overspending and creates alerts.
 * - GenerateAlertsInput - The input type for the generateAlerts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {getFirestore} from 'firebase-admin/firestore';
import {Timestamp} from 'firebase-admin/firestore';
import {initializeApp, getApps} from 'firebase-admin/app';

const GenerateAlertsInputSchema = z.object({
  userId: z.string().describe('The ID of the user to generate alerts for.'),
  transactions: z
    .string()
    .describe("A JSON string of the user's recent transactions."),
  budgets: z.string().describe("A JSON string of the user's budgets."),
  goals: z.string().describe("A JSON string of the user's saving goals."),
  monthlyIncome: z.number().describe("The user's monthly income."),
});

export type GenerateAlertsInput = z.infer<typeof GenerateAlertsInputSchema>;

const AlertSchema = z.object({
  shouldCreate: z.boolean().describe('Whether an alert should be created.'),
  type: z
    .string()
    .optional()
    .describe(
      'Type of the alert (e.g., "Budget Warning", "Spending Spike", "Goal Progress").'
    ),
  message: z.string().optional().describe('The alert message.'),
  trigger: z.string().optional().describe('The reason the alert was triggered.'),
  budgetName: z
    .string()
    .optional()
    .describe('The name of the budget the alert is for.'),
});

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  initializeApp();
}

const firestore = getFirestore();

export async function generateAlerts(input: GenerateAlertsInput): Promise<void> {
  await generateAlertsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAlertsPrompt',
  input: {schema: GenerateAlertsInputSchema},
  output: {schema: z.array(AlertSchema)},
  prompt: `You are an intelligent financial assistant, AlertGenie. Your task is to analyze a user's financial data to generate helpful, timely, and motivational alerts.

Analyze the user's data:
- Monthly Income: {{{monthlyIncome}}}
- Budgets: {{{budgets}}}
- Saving Goals: {{{goals}}}
- Transactions: {{{transactions}}}

Generate alerts based on the following rules. For each rule, only generate an alert if one has not been sent for the same reason in the past 7 days.

1.  **Total Spending vs. Income**:
    - Calculate the total spending for the current month from the transactions.
    - If total spending crosses 75% of the monthly income, create one alert with:
      - type: "Budget Warning"
      - message: "⚠️ You’ve already used 75% of your budget for this month. Stay alert!"
      - trigger: "Total spending exceeded 75% of monthly income."

2.  **Category Spending Spike**:
    - For the category of the MOST RECENT transaction, calculate the total spending in that category this week (last 7 days).
    - Calculate the average weekly spending for that same category over the last 4 weeks.
    - If this week's spending in that category is greater than the average, create one alert with:
      - type: "Spending Spike"
      - message: "🍔 You spent more on [Category Name] this week than usual. Want to set a limit?" (replace [Category Name] with the actual category).
      - trigger: "Spending in [Category Name] is higher than the weekly average."

3.  **Goal Progress Motivation**:
    - Calculate the total spending for the current month.
    - If the total spending is UNDER 50% of the monthly income, create one alert with:
      - type: "Goal Progress"
      - message: "🌱 Great progress! You’re managing your expenses wisely this month."
      - trigger: "Monthly spending is below 50% of income."

For each alert to be created, set "shouldCreate" to true and fill in the other fields. If no conditions are met, return an empty array.
`,
});

const generateAlertsFlow = ai.defineFlow(
  {
    name: 'generateAlertsFlow',
    inputSchema: GenerateAlertsInputSchema,
    outputSchema: z.void(),
  },
  async input => {
    const {output: alertSuggestions} = await prompt(input);

    if (!alertSuggestions || alertSuggestions.length === 0) {
      return;
    }

    const alertsCol = firestore.collection(`users/${input.userId}/alerts`);

    for (const suggestion of alertSuggestions) {
      if (
        suggestion.shouldCreate &&
        suggestion.type &&
        suggestion.message &&
        suggestion.trigger
      ) {
        // Check if a similar alert was sent recently to avoid spam
        const sevenDaysAgo = Timestamp.fromMillis(
          Date.now() - 7 * 24 * 60 * 60 * 1000
        );
        const recentAlertsQuery = await alertsCol
          .where('trigger', '==', suggestion.trigger)
          .where('timestamp', '>', sevenDaysAgo)
          .limit(1)
          .get();

        if (recentAlertsQuery.empty) {
          await alertsCol.add({
            userId: input.userId,
            type: suggestion.type,
            message: suggestion.message,
            trigger: suggestion.trigger,
            timestamp: Timestamp.now(),
            isRead: false,
          });
        }
      }
    }
  }
);
