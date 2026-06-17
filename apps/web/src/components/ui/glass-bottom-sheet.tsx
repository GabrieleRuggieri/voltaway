'use client';

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type SheetHeight = 'peek' | 'half' | 'full';

const heightClass: Record<SheetHeight, string> = {
  peek: 'h-[7.5rem] md:h-[8.125rem]',
  half: 'h-[min(52vh,26.25rem)]',
  full: 'h-[min(78vh,40rem)]',
};

export function GlassBottomSheet({
  height,
  onHeightChange,
  children,
}: {
  height: SheetHeight;
  onHeightChange?: (h: SheetHeight) => void;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-20 flex flex-col transition-[height] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
        'rounded-t-[1.75rem] border border-white/70 bg-white/80 shadow-[0_-12px_48px_rgba(15,23,42,0.12)] backdrop-blur-2xl',
        'pb-[env(safe-area-inset-bottom,0px)] md:bottom-4 md:left-1/2 md:max-w-[30rem] md:-translate-x-1/2 md:rounded-[1.75rem]',
        heightClass[height],
      )}
      role="dialog"
      aria-modal="false"
    >
      <button
        type="button"
        className="flex w-full shrink-0 cursor-pointer items-center justify-center border-none bg-transparent py-3"
        aria-label="Espandi elenco colonnine"
        onClick={() => {
          if (height === 'peek') onHeightChange?.('half');
          else if (height === 'half') onHeightChange?.('full');
          else onHeightChange?.('peek');
        }}
      >
        <span className="h-1 w-10 rounded-full bg-slate-300/90" />
      </button>
      <div className="flex-1 overflow-y-auto px-4 pb-5 [-webkit-overflow-scrolling:touch]">
        {children}
      </div>
    </div>
  );
}
