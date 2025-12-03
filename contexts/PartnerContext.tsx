import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api, getToken } from '../lib/api';

interface Partner {
  id: number;
  email: string;
  name: string | null;
  emoji?: string;
}

interface PartnerContextType {
  coupleId: number | null;
  hasPartner: boolean;
  partner: Partner | null;
  myCode: string | null;
  loading: boolean;
  refreshPartner: (silent?: boolean) => Promise<void>;
  generateCode: () => Promise<string>;
  connectWithCode: (code: string) => Promise<void>;
  unmatchPartner: () => Promise<void>;
}

const PartnerContext = createContext<PartnerContextType | undefined>(undefined);

export const PartnerProvider = ({ children }: { children: ReactNode }) => {
  const [coupleId, setCoupleId] = useState<number | null>(null);
  const [hasPartner, setHasPartner] = useState(false);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [myCode, setMyCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshPartner = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const token = await getToken();
      if (!token) {
        // Not logged in
        setCoupleId(null);
        setHasPartner(false);
        setPartner(null);
        if (!silent) setLoading(false);
        return;
      }

      const response = await api.getPartner();

      if (response.success && response.data) {
        const newCoupleId = response.data.coupleId || null;
        const newHasPartner = response.data.hasPartner || false;
        const newPartner = response.data.partner || null;

        // Only update state if values actually changed
        if (coupleId !== newCoupleId) setCoupleId(newCoupleId);
        if (hasPartner !== newHasPartner) setHasPartner(newHasPartner);

        // Only update partner if it actually changed (compare by id and emoji)
        const partnerChanged = !partner || !newPartner ||
          partner.id !== newPartner.id ||
          partner.name !== newPartner.name ||
          partner.email !== newPartner.email ||
          partner.emoji !== newPartner.emoji;

        if (partnerChanged) {
          console.log('[PartnerContext] Partner changed, updating:', { old: partner, new: newPartner });
          setPartner(newPartner);
        }

        // If we found a partner, clear the code
        if (newHasPartner && myCode) {
          console.log('[PartnerContext] Partner found, clearing code');
          setMyCode(null);
        } else if (newHasPartner) {
          // Make absolutely sure code is null when we have a partner
          setMyCode(null);
        }
      } else {
        // No partner yet
        setCoupleId(null);
        setHasPartner(false);
        setPartner(null);
      }
    } catch (error) {
      console.error('Error refreshing partner:', error);
      // Don't throw - just set to no partner state
      setCoupleId(null);
      setHasPartner(false);
      setPartner(null);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [coupleId, hasPartner, partner, myCode]);

  const generateCode = async (): Promise<string> => {
    try {
      // Verify we have a token before attempting to generate code
      const token = await getToken();
      if (!token) {
        throw new Error('You must be logged in to generate a pairing code. Please log in and try again.');
      }

      console.log('[generateCode] Token verified, calling API...');
      const response = await api.generatePairingCode();
      if (response.success && response.data?.code) {
        setMyCode(response.data.code);
        console.log('[generateCode] Code generated successfully:', response.data.code);
        return response.data.code;
      }
      throw new Error(response.error || 'Failed to generate code');
    } catch (error: any) {
      console.error('[generateCode] Error:', error.message);
      throw error;
    }
  };

  const connectWithCode = async (code: string) => {
    try {
      const response = await api.connectWithPartner(code);
      if (response.success) {
        // Refresh partner info after successful connection
        await refreshPartner();
        setMyCode(null); // Clear the generated code
      } else {
        throw new Error(response.error || 'Failed to connect with partner');
      }
    } catch (error: any) {
      console.error('Error connecting with partner:', error);
      throw error;
    }
  };

  const unmatchPartner = async () => {
    try {
      const response = await api.unmatchPartner();
      if (response.success) {
        // Clear partner state
        setCoupleId(null);
        setHasPartner(false);
        setPartner(null);
      } else {
        throw new Error(response.error || 'Failed to unmatch');
      }
    } catch (error: any) {
      console.error('Error unmatching partner:', error);
      throw error;
    }
  };

  // Load partner info on mount
  useEffect(() => {
    console.log('[PartnerContext] Component mounted, loading partner info');
    refreshPartner();
  }, [refreshPartner]);

  // Poll for partner connection ONLY if we have a code and no partner yet
  // This is for waiting for the other person to connect using your code
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    console.log('[PartnerContext] Polling check - myCode:', myCode, 'hasPartner:', hasPartner);

    if (myCode && !hasPartner) {
      console.log('[PartnerContext] Starting polling for partner connection');
      // Poll every 3 seconds only when waiting for connection
      intervalId = setInterval(() => {
        console.log('[PartnerContext] Polling...');
        refreshPartner(true);
      }, 3000);
    } else {
      console.log('[PartnerContext] No polling needed');
    }

    return () => {
      if (intervalId) {
        console.log('[PartnerContext] Stopping polling');
        clearInterval(intervalId);
      }
    };
  }, [myCode, hasPartner, refreshPartner]);

  return (
    <PartnerContext.Provider
      value={{
        coupleId,
        hasPartner,
        partner,
        myCode,
        loading,
        refreshPartner,
        generateCode,
        connectWithCode,
        unmatchPartner,
      }}
    >
      {children}
    </PartnerContext.Provider>
  );
};

export const usePartner = () => {
  const context = useContext(PartnerContext);
  if (context === undefined) {
    throw new Error('usePartner must be used within a PartnerProvider');
  }
  return context;
};
