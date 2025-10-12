import { advisorAIWeeklySummary } from '@/ai/flows/advisor-ai-weekly-summary';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getWeeklySpendingForAI } from '@/lib/data';
import { BotMessageSquare, Send } from 'lucide-react';

async function AdvisorAISummary() {
    let summaryText = "Could not generate summary at this time.";
    try {
        const weeklyData = getWeeklySpendingForAI();
        const summary = await advisorAIWeeklySummary({ weeklySpendingData: weeklyData });
        summaryText = summary.summary;
    } catch (error) {
        console.error("Failed to get AdvisorAI summary:", error);
    }

    return (
        <div className="text-sm text-muted-foreground p-4 bg-secondary/50 rounded-lg border">
            <p>{summaryText}</p>
        </div>
    );
}

export function AdvisorAICard() {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
            <BotMessageSquare className="h-6 w-6 text-primary"/>
            <CardTitle>AdvisorAI</CardTitle>
        </div>
        <CardDescription>
          Your weekly summary and financial Q&A.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <h3 className="font-medium mb-2 text-sm">Weekly Spending Summary</h3>
        <AdvisorAISummary />
      </CardContent>
      <CardFooter>
         <div className="relative w-full">
            <Input
              type="text"
              placeholder="Ask AdvisorAI a question... (coming soon)"
              className="pr-12"
              disabled
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
              disabled
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
      </CardFooter>
    </Card>
  );
}
