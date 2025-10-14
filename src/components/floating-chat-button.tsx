'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { AdvisorAICard } from './dashboard/advisor-ai-card';

export function FloatingChatButton() {
  const [isChatOpen, setIsChatOpen] = useState(false);

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
            <AdvisorAICard isChat={true}/>
        </DialogContent>
      </Dialog>
    </>
  );
}
