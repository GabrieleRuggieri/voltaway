'use client';

import type { ReactNode } from 'react';

export type SheetHeight = 'peek' | 'half' | 'full';

export function BottomSheet({
  height,
  onHeightChange,
  children,
}: {
  height: SheetHeight;
  onHeightChange?: (h: SheetHeight) => void;
  children: ReactNode;
}) {
  return (
    <div className={`bottom-sheet bottom-sheet--${height}`} role="dialog" aria-modal="false">
      <button
        type="button"
        className="bottom-sheet-handle"
        aria-label="Espandi elenco colonnine"
        onClick={() => {
          if (height === 'peek') onHeightChange?.('half');
          else if (height === 'half') onHeightChange?.('full');
          else onHeightChange?.('peek');
        }}
      />
      <div className="bottom-sheet-content">{children}</div>
    </div>
  );
}
