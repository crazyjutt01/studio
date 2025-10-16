'use client';
import { useState } from 'react';
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
import { BotMessageSquare, Loader2, Send } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, doc } from 'firebase/firestore';
import type { Transaction, Budget, SavingsGoal, UserData } from '@/lib/data';
import { advisorAIWeeklySummary } from '@/ai/flows/advisor-ai-weekly-summary';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export function AdvisorAICard({ isPage, isChat }: { isPage?: boolean, isChat?: boolean }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, `users/${user.uid}`);
    }, [user, firestore]);

  const transactionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/transactions`));
  }, [user, firestore]);

  const budgetsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/budgets`));
  }, [user, firestore]);

  const savingsGoalsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/savingGoals`));
  }, [user, firestore]);

  const { data: userData } = useDoc<UserData>(userDocRef);
  const { data: transactionsData } = useCollection<Transaction>(transactionsQuery);
  const { data: budgetsData } = useCollection<Budget>(budgetsQuery);
  const { data: savingsGoalsData } = useCollection<SavingsGoal>(savingsGoalsQuery);

  const handleSendMessage = async () => {
    if (!input.trim() || !user || !transactionsData || !budgetsData || !savingsGoalsData || !userData) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await advisorAIWeeklySummary({
        userId: user.uid,
        transactions: JSON.stringify(transactionsData),
        budgets: JSON.stringify(budgetsData),
        savingGoals: JSON.stringify(savingsGoalsData),
        question: input,
        region: userData.region || 'US',
        currency: userData.currency || 'USD',
      });
      const assistantMessage: Message = { role: 'assistant', content: result.summary };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to get AdvisorAI summary:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I had trouble getting a response. Please try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={cn("flex flex-col", isPage ? "h-[75vh]" : "", isChat ? "h-[60vh] border-0 shadow-none" : "")}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BotMessageSquare className="h-6 w-6 text-primary" />
          <CardTitle>AdvisorAI</CardTitle>
        </div>
        <CardDescription>Your personal AI financial advisor.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4">
        <ScrollArea className="flex-grow pr-4 -mr-4">
            <div className="space-y-4">
                {messages.length === 0 && !isLoading && (
                    <div className="text-center text-muted-foreground pt-8">
                        <p>Ask me anything about your finances!</p>
                    </div>
                )}
                {messages.map((message, index) => (
                <div
                    key={index}
                    className={cn(
                    'flex items-start gap-3',
                    message.role === 'user' ? 'justify-end' : ''
                    )}
                >
                    {message.role === 'assistant' && (
                    <div className="bg-primary rounded-full p-2 text-primary-foreground">
                        <BotMessageSquare className="h-5 w-5" />
                    </div>
                    )}
                    <div
                    className={cn(
                        'rounded-lg px-4 py-3 text-sm max-w-[80%]',
                        message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                    >
                    <p>{message.content}</p>
                    </div>
                </div>
                ))}
                {isLoading && (
                    <div className="flex items-center gap-3">
                        <div className="bg-primary rounded-full p-2 text-primary-foreground">
                            <BotMessageSquare className="h-5 w-5" />
                        </div>
                        <div className="rounded-lg px-4 py-3 text-sm bg-muted flex items-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2"/>
                            Thinking...
                        </div>
                    </div>
                )}
            </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <div className="relative w-full">
          <Input
            type="text"
            placeholder="Ask AdvisorAI a question..."
            className="pr-12"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
