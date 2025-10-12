import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { savingsGoals } from '@/lib/data';

export function SavingsGoalsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Savings Goals (GoalGuru)</CardTitle>
        <CardDescription>
          Track your progress towards your financial goals.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-6">
          {savingsGoals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            return (
              <li key={goal.id}>
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{goal.name}</span>
                  <span className="text-sm text-muted-foreground">
                    ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                  </span>
                </div>
                <Progress value={progress} aria-label={`${goal.name} progress`} />
                 <p className="text-xs text-muted-foreground mt-1">{goal.description}</p>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
