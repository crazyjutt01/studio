'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserData, BadgeInfo } from '@/lib/data';
import { badges } from '@/lib/data';
import { Skeleton } from '../ui/skeleton';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';


export function AchievementsCard() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, `users/${user.uid}`);
  }, [user, firestore]);

  const { data: userData, isLoading } = useDoc<UserData>(userDocRef);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Badges & Achievements</CardTitle>
        <CardDescription>
          Here are the badges you've earned on your financial journey.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                ))}
            </div>
        ) : (
        <TooltipProvider>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {badges.map((badge: BadgeInfo) => {
              const hasBadge = userData?.badges?.includes(badge.id);
              const Icon = badge.icon;
              return (
                <Tooltip key={badge.id}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 rounded-lg border p-4 text-center transition-all",
                        hasBadge ? "border-primary bg-primary/10" : "bg-muted opacity-50"
                      )}
                    >
                      <Icon className={cn("h-8 w-8", hasBadge ? "text-primary" : "text-muted-foreground")} />
                      <p className={cn("text-xs font-semibold", hasBadge ? "text-primary" : "text-muted-foreground")}>{badge.name}</p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{badge.description}</p>
                    {!hasBadge && <p className="text-xs text-muted-foreground">Requires {badge.xpThreshold} XP</p>}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
}
