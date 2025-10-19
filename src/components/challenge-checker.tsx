'use client';
import { useChallengeChecker } from '@/hooks/use-challenge-checker';

/**
 * An invisible component that runs the global challenge checker hook.
 * This should be placed in the root layout to ensure it runs on every page.
 */
export function ChallengeChecker() {
  useChallengeChecker();
  return null; // This component renders nothing.
}
