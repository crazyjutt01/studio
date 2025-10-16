'use client';
import { config } from 'dotenv';
config({ path: '.env.local' });

import './flows/spend-spy-expense-recording.ts';
import './flows/advisor-ai-weekly-summary.ts';
import './flows/budget-bot-personalized-tips.ts';
import './flows/crisis-guardian-support.ts';
import './flows/goal-guru-advice.ts';
import './flows/alert-generator.ts';
import './flows/daily-financial-summary.ts';
import './flows/challenge-creator.ts';
import './flows/get-challenge-tip.ts';
