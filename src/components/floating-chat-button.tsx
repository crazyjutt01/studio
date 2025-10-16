'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { MessageSquare, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogClose } from './ui/dialog';
import { AdvisorAICard } from './dashboard/advisor-ai-card';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';

export function FloatingChatButton() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
        <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
            <SheetTrigger asChild>
                <Button
                    className="fixed bottom-4 right-4 h-16 w-16 rounded-full shadow-lg flex items-center justify-center"
                    size="icon"
                >
                    <MessageSquare className="h-8 w-8" />
                </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[90vh] flex flex-col p-0 border-t-2">
                 <SheetHeader>
                    <SheetTitle className="sr-only">AdvisorAI Chat</SheetTitle>
                 </SheetHeader>
                 <AdvisorAICard isPage={true} isChat={true} />
            </SheetContent>
      </Sheet>
    )
  }

  return (
    <>
      <Button
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg"
        size="icon"
        onClick={() => setIsChatOpen(true)}
      >
        <MessageSquare className="h-8 w-8" />
      </Button>
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="sm:max-w-[625px] p-0">
          <DialogTitle className="sr-only">AdvisorAI Chat</DialogTitle>
          <AdvisorAICard isChat={true} />
        </DialogContent>
      </Dialog>
    </>
  );
}
