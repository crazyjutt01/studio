'use client';
import { useEffect } from 'react';
import Confetti from 'react-confetti';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useWindowSize } from 'react-use';
import { Button } from './ui/button';
import { PartyPopper } from 'lucide-react';

interface LevelUpProps {
  newLevel: number;
  onClose: () => void;
}

export function LevelUp({ newLevel, onClose }: LevelUpProps) {
  const { width, height } = useWindowSize();

  useEffect(() => {
    const timer = setTimeout(onClose, 8000); // Auto close after 8 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <>
      <Confetti width={width} height={height} recycle={false} numberOfPieces={400} />
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="flex flex-col items-center gap-2 text-2xl justify-center">
                <PartyPopper className="h-12 w-12 text-yellow-500" />
                Level Up!
            </DialogTitle>
            <DialogDescription className="text-lg">
                Congratulations! You've reached Level {newLevel}! 🎉
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">You've unlocked new potential! Keep up the great work on your financial journey. ✨</p>
          </div>
          <Button onClick={onClose} className="mt-4">Continue</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
