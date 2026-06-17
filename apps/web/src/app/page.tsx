/**
 * @file page.tsx
 * @module @voltaway/web
 *
 * Scopo: entry point home — renderizza la schermata mappa a schermo intero.
 * Flusso: route / → MapScreen → API colonnine/sessioni.
 * Dipendenze: @/components/map/MapScreen.
 */
import { MapScreen } from '@/components/map/MapScreen';

export default function HomePage() {
  return <MapScreen />;
}
