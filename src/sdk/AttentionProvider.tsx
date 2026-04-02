import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { AttentionSDK } from './AttentionSDK';
import type { AttentionProviderProps, AttentionConfig, AttentionUser, SafetyEvent, OnEventCallback } from './types';
import type { Incident, Chain, ChainMessage, ChainAlert } from '../types';

interface AttentionContextValue {
  isReady: boolean;
  user: AttentionUser | null;
  safetyScore: { score: number; level: string; factors: Record<string, number> } | null;
  nearbyIncidents: Incident[];
  chains: Chain[];
  lastEvent: SafetyEvent | null;
  triggerSOS: (message?: string) => Promise<string>;
  cancelSOS: () => Promise<void>;
  reportIncident: typeof AttentionSDK.reportIncident;
  updateLocation: typeof AttentionSDK.updateLocation;
  createChain: typeof AttentionSDK.createChain;
  joinChain: typeof AttentionSDK.joinChain;
  sendChainMessage: typeof AttentionSDK.sendChainMessage;
  on: typeof AttentionSDK.on;
}

const AttentionContext = createContext<AttentionContextValue | null>(null);

/**
 * Wrap your app (or any subtree) with <AttentionProvider> to inject the
 * full Attention safety layer. All descendant components can then call
 * useAttention() to access SOS, incidents, chains, and geofences.
 *
 * <AttentionProvider config={{ apiKey: 'YOUR_KEY' }} user={currentUser}>
 *   <YourApp />
 * </AttentionProvider>
 */
export function AttentionProvider({ config, user, children, onReady, onError }: AttentionProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<AttentionUser | null>(null);
  const [safetyScore, setSafetyScore] = useState<AttentionContextValue['safetyScore']>(null);
  const [nearbyIncidents, setNearbyIncidents] = useState<Incident[]>([]);
  const [chains, setChains] = useState<Chain[]>([]);
  const [lastEvent, setLastEvent] = useState<SafetyEvent | null>(null);
  const eventCallbackRef = useRef<OnEventCallback | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await AttentionSDK.init(config);

        eventCallbackRef.current = (event: SafetyEvent) => {
          if (!mounted) return;
          setLastEvent(event);

          if (event.type === 'incident_nearby') {
            setNearbyIncidents(event.data.incidents || []);
          }
        };
        AttentionSDK.on(eventCallbackRef.current);

        if (mounted) {
          setIsReady(true);
          onReady?.();
        }
      } catch (err) {
        if (mounted) onError?.(err as Error);
      }
    })();

    return () => {
      mounted = false;
      if (eventCallbackRef.current) AttentionSDK.off(eventCallbackRef.current);
      AttentionSDK.destroy();
    };
  }, []);

  useEffect(() => {
    if (!isReady || !user) return;
    (async () => {
      await AttentionSDK.setUser(user);
      setCurrentUser(user);

      const score = await AttentionSDK.getSafetyScore();
      setSafetyScore(score);

      const userChains = await AttentionSDK.getUserChains();
      setChains(userChains);
    })();
  }, [isReady, user?.uid]);

  const triggerSOS = useCallback(async (message?: string) => {
    return AttentionSDK.triggerSOS({ message });
  }, []);

  const cancelSOS = useCallback(async () => {
    return AttentionSDK.cancelSOS();
  }, []);

  const value: AttentionContextValue = {
    isReady,
    user: currentUser,
    safetyScore,
    nearbyIncidents,
    chains,
    lastEvent,
    triggerSOS,
    cancelSOS,
    reportIncident: AttentionSDK.reportIncident.bind(AttentionSDK),
    updateLocation: AttentionSDK.updateLocation.bind(AttentionSDK),
    createChain: AttentionSDK.createChain.bind(AttentionSDK),
    joinChain: AttentionSDK.joinChain.bind(AttentionSDK),
    sendChainMessage: AttentionSDK.sendChainMessage.bind(AttentionSDK),
    on: AttentionSDK.on.bind(AttentionSDK),
  };

  return (
    <AttentionContext.Provider value={value}>
      {children}
    </AttentionContext.Provider>
  );
}

export function useAttention(): AttentionContextValue {
  const ctx = useContext(AttentionContext);
  if (!ctx) {
    throw new Error('useAttention() must be used within an <AttentionProvider>');
  }
  return ctx;
}
