/**
 * @file utils.ts
 * @module @voltaway/web
 *
 * Scopo: utility condivise per composizione classi CSS Tailwind.
 * Flusso: componenti UI → cn() → classi merge senza conflitti.
 * Dipendenze: clsx, tailwind-merge.
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Unisce classi condizionali e risolve conflitti Tailwind (es. p-2 vs p-4). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
