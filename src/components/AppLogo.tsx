
import { cn } from '@/lib/utils';
import React from 'react';

export function AppLogo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <h1 className="font-serif font-bold tracking-tight">
        BeGood
      </h1>
    </div>
  );
}
