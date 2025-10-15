'use client';
import {
  Bell,
  Search,
  LogOut,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuFooter
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  SidebarTrigger,
} from '@/components/ui/sidebar';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useAuth, useCollection, useFirestore, useMemoFirebase, useUser, useDoc, updateDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { collection, doc, orderBy, query } from 'firebase/firestore';
import type { Alert, UserData } from '@/lib/data';
import { formatDistanceToNow } from 'date-fns';

export function Header() {
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, `users/${user.uid}`);
  }, [user, firestore]);

  const { data: userData } = useDoc<UserData>(userDocRef);

  const alertsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/alerts`));
  }, [user, firestore]);

  const { data: alerts } = useCollection<Alert>(alertsQuery);

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
      router.push('/');
    }
  }
  
  const handleMarkAsRead = (alertId: string) => {
    if (!user || !firestore) return;
    const alertRef = doc(firestore, `users/${user.uid}/alerts/${alertId}`);
    updateDocumentNonBlocking(alertRef, { isRead: true });
  }

  const handleTestNotification = () => {
    if (!user || !firestore) {
      toast({
        variant: "destructive",
        title: "Not Logged In",
        description: "You must be logged in to create a test notification."
      });
      return;
    }
    const alertsCol = collection(firestore, `users/${user.uid}/alerts`);
    const testAlert: Omit<Alert, 'id'> = {
      userId: user.uid,
      type: "Test Notification",
      message: "This is a test alert to check the system.",
      timestamp: new Date().toISOString(),
      isRead: false,
      trigger: "manual_test"
    };
    addDocumentNonBlocking(alertsCol, testAlert);
    toast({
      title: "Test Notification Sent",
      description: "A test alert has been added to your notifications."
    });
  }

  const unreadAlertsCount = alerts?.filter(a => !a.isRead).length ?? 0;
  const sortedAlerts = alerts ? [...alerts].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) : [];


  const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar-1');

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
        <div className="md:hidden">
            <SidebarTrigger />
        </div>
      <div className="w-full flex-1">
        <form>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search transactions, reports..."
              className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
            />
          </div>
        </form>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full relative">
                <Bell className="h-4 w-4" />
                <span className="sr-only">Toggle notifications</span>
                 {unreadAlertsCount > 0 && (
                    <span className="absolute top-0 right-0 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                 )}
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {sortedAlerts && sortedAlerts.length > 0 ? (
                sortedAlerts.slice(0, 5).map(alert => (
                    <DropdownMenuItem key={alert.id} onSelect={(e) => { e.preventDefault(); handleMarkAsRead(alert.id); }} className={`flex-col items-start gap-1 ${!alert.isRead ? 'bg-secondary/50' : ''}`}>
                        <p className="font-medium">{alert.type}</p>
                        <p className="text-xs text-muted-foreground whitespace-normal">{alert.message}</p>
                        <p className="text-xs text-muted-foreground/80">{formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}</p>
                    </DropdownMenuItem>
                ))
            ) : (
                <p className="p-4 text-sm text-center text-muted-foreground">No new notifications</p>
            )}
             <DropdownMenuSeparator />
            <DropdownMenuFooter>
                <Button variant="outline" size="sm" className="w-full" onClick={handleTestNotification}>
                    Test Notification
                </Button>
            </DropdownMenuFooter>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
             {userAvatar && <Image
              src={userAvatar.imageUrl}
              width={36}
              height={36}
              alt="User avatar"
              data-ai-hint={userAvatar.imageHint}
              className="rounded-full"
            />}
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{userData ? `${userData.firstName} ${userData.lastName}` : 'My Account'}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/settings')}>Settings</DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
