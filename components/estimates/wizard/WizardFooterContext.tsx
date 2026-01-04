"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";

interface WizardFooterConfig {
  onContinue: () => void;
  continueText?: string;
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  icon?: "arrow" | "send";
  summaryContent?: ReactNode;
  onSaveDraft?: () => void;
  isSavingDraft?: boolean;
}

interface WizardFooterContextValue {
  config: WizardFooterConfig | null;
  setFooterConfig: (config: WizardFooterConfig | null) => void;
  // Step tracking for navigation direction detection
  lastVisitedStep: number | null;
  setLastVisitedStep: (step: number) => void;
  // Global save draft handler (set by wizard wrapper)
  hasSaveDraft: boolean;
  getGlobalSaveDraft: () => (() => Promise<void>) | null;
  setGlobalSaveDraft: (handler: (() => Promise<void>) | null) => void;
  isSavingDraft: boolean;
  setIsSavingDraft: (saving: boolean) => void;
}

const WizardFooterContext = createContext<WizardFooterContextValue | null>(
  null
);

export function WizardFooterProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<WizardFooterConfig | null>(null);
  const [lastVisitedStep, setLastVisitedStepState] = useState<number | null>(
    null
  );
  // Use ref for save draft handler to avoid re-render loops
  const globalSaveDraftRef = useRef<(() => Promise<void>) | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  // Track if save draft is available (for UI rendering)
  const [hasSaveDraft, setHasSaveDraft] = useState(false);

  const setFooterConfig = useCallback(
    (newConfig: WizardFooterConfig | null) => {
      setConfig(newConfig);
    },
    []
  );

  const setLastVisitedStep = useCallback((step: number) => {
    setLastVisitedStepState(step);
  }, []);

  const setGlobalSaveDraft = useCallback(
    (handler: (() => Promise<void>) | null) => {
      globalSaveDraftRef.current = handler;
      setHasSaveDraft(handler !== null);
    },
    []
  );

  // Getter function to access the ref's current value
  const getGlobalSaveDraft = useCallback(() => globalSaveDraftRef.current, []);

  return (
    <WizardFooterContext.Provider
      value={{
        config,
        setFooterConfig,
        lastVisitedStep,
        setLastVisitedStep,
        hasSaveDraft,
        getGlobalSaveDraft,
        setGlobalSaveDraft,
        isSavingDraft,
        setIsSavingDraft,
      }}
    >
      {children}
    </WizardFooterContext.Provider>
  );
}

export function useWizardFooter() {
  const context = useContext(WizardFooterContext);
  if (!context) {
    throw new Error("useWizardFooter must be used within WizardFooterProvider");
  }
  return context;
}

// Hook for steps to easily configure the footer
export function useConfigureFooter(config: WizardFooterConfig | null) {
  const { setFooterConfig } = useWizardFooter();

  // Use effect-like pattern to set config when component mounts/updates
  // We use a ref pattern to avoid infinite loops
  const configRef = useCallback(() => {
    setFooterConfig(config);
  }, [config, setFooterConfig]);

  return configRef;
}
