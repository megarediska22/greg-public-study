import { createContext, useContext } from 'react';
import type { AdaptiveHost } from '../../lib/adaptiveHost';
import type { AdaptivePersistStatus } from '../../lib/adaptive/storage';

export const AdaptiveContext = createContext<{
  host: AdaptiveHost;
  write: (operation: () => Promise<AdaptivePersistStatus>) => Promise<boolean>;
  busy: boolean;
} | null>(null);

export const useAdaptive = () => useContext(AdaptiveContext);
