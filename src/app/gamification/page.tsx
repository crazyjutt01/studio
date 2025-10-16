'use client';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserData } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Shield, Coins, Flame } from 'lucide-react';
import { AchievementsCard } from '@/components/dashboard/achievements-card';

export default function GamificationPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, `users/${user.uid}`);
  }, [user, firestore]);

  const { data: userData, isLoading: isUserDataLoading } = useDoc<UserData>(userDocRef);

  const level = userData?.level ?? 1;
  const xp = userData?.xp ?? 0;
  const xpForNextLevel = level * 100;
  const progress = (xp / xpForNextLevel) * 100;
  const coins = userData?.coins ?? 0;
  const streak = userData?.streak ?? 0;

  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center gap-2">
            <Trophy className="w-8 h-8 text-primary" />
          <h1 className="text-lg font-semibold md:text-2xl">Your Progress</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle>Your Level</CardTitle>
                    <CardDescription>Keep it up to unlock new features!</CardDescription>
                </CardHeader>
                <CardContent>
                {isUserDataLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : (
                  <div className="space-y-4 text-center">
                    <div className="relative inline-block">
                        <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center">
                            <div className="w-28 h-28 rounded-full bg-background flex items-center justify-center text-4xl font-bold">
                                {level}
                            </div>
                        </div>
                        <Shield className="w-16 h-16 absolute -top-4 -left-4 text-yellow-400" fill="currentColor" />
                    </div>
                    <div>
                        <Progress value={progress} className="h-3" />
                        <p className="text-sm text-muted-foreground mt-2">{xp} / {xpForNextLevel} XP</p>
                    </div>
                    <div className="flex justify-center items-center gap-6 text-lg font-semibold pt-4">
                        <div className="flex items-center gap-2">
                            <Coins className="w-6 h-6 text-yellow-500" />
                            <span>{coins} Coins</span>
                        </div>
                         <div className="flex items-center gap-2">
                            <Flame className="w-6 h-6 text-orange-500" />
                            <span>{streak} Day Streak</span>
                        </div>
                    </div>
                  </div>
                )}
                </CardContent>
            </Card>
            <div className="lg:col-span-2">
                <AchievementsCard />
            </div>
        </div>
      </main>
    </>
  );
}

    