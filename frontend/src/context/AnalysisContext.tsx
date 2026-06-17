'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { analyzeAccount } from '@/lib/api';

interface AnalysisContextType {
  data: any;
  loading: boolean;
  error: string;
  step: number; // 0 = start, 1 = reels fetched, 2 = plan generated
  handle: string;
  setHandle: (handle: string) => void;
  fetchReels: (handle: string) => Promise<void>;
  generatePlan: () => Promise<void>;
}

const AnalysisContext = createContext<AnalysisContextType>({
  data: null,
  loading: false,
  error: '',
  step: 0,
  handle: '',
  setHandle: () => {},
  fetchReels: async () => {},
  generatePlan: async () => {},
});

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(0);
  const [handle, setHandle] = useState('');

  const fetchReels = useCallback(async (instaHandle: string) => {
    setLoading(true);
    setError('');
    setHandle(instaHandle);

    try {
      // In demo mode, this returns the full JSON
      const result = await analyzeAccount('demo');
      if (result.status === 'success') {
        setData(result.data);
        setStep(1); // Reels fetched
      } else {
        setError('Failed to fetch reels.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during fetching.');
    } finally {
      setLoading(false);
    }
  }, []);

  const generatePlan = useCallback(async () => {
    setLoading(true);
    // Simulate AI generation time for the demo
    await new Promise(resolve => setTimeout(resolve, 2000));
    setStep(2); // Plan generated
    setLoading(false);
  }, []);

  return (
    <AnalysisContext.Provider value={{ data, loading, error, step, handle, setHandle, fetchReels, generatePlan }}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  return useContext(AnalysisContext);
}

