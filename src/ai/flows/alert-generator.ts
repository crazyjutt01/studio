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
  transactions: z.string().describe("A JSON string of the user's recent transactions."),
  budgets: z.string().describe("A JSON string of the user's budgets."),
});

export type GenerateAlertsInput = z.infer<typeof GenerateAlertsInputSchema>;

const AlertSchema = z.object({
  shouldCreate: z.boolean().describe('Whether an alert should be created.'),
  type: z.string().optional().describe('Type of the alert (e.g., "Budget Warning").'),
  message: z.string().optional().describe('The alert message.'),
  budgetName: z.string().optional().describe('The name of the budget the alert is for.'),
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
  prompt: `You are an intelligent financial assistant. Your task is to analyze a user's budgets and recent transactions to determine if any alerts should be created.

User's Budgets:
{{{budgets}}}

User's Transactions:
{{{transactions}}}

Analyze each budget. For each one, calculate the total spending within that budget's date range based on the transactions provided.

Generate an alert if the total spending for a budget exceeds 90% of its allocated amount.

For each potential alert, provide the following:
- shouldCreate: true if an alert is warranted.
- type: "Budget Warning"
- message: A friendly message like "You've used over 90% of your [Budget Name] budget."
- budgetName: The name of the budget.

If no budgets are nearing their limit, return an empty array or an array where all 'shouldCreate' fields are false.
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
      if (suggestion.shouldCreate && suggestion.type && suggestion.message && suggestion.budgetName) {
        // Check if a similar alert was sent recently to avoid spam
        const recentAlertsQuery = await alertsCol
            .where('type', '==', suggestion.type)
            .where('budgetName', '==', suggestion.budgetName)
            .where('timestamp', '>', Timestamp.fromMillis(Date.now() - 24 * 60 * 60 * 1000)) // 24 hours
            .limit(1)
            .get();

        if (recentAlertsQuery.empty) {
            await alertsCol.add({
              userId: input.userId,
              type: suggestion.type,
              message: suggestion.message,
              budgetName: suggestion.budgetName,
              timestamp: Timestamp.now(),
              isRead: false,
            });
        }
      }
    }
  }
);
