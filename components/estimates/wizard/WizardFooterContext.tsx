"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
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
}

interface WizardFooterContextValue {
  config: WizardFooterConfig | null;
  setFooterConfig: (config: WizardFooterConfig | null) => void;
}

const WizardFooterContext = createContext<WizardFooterContextValue | null>(
  null
);

export function WizardFooterProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<WizardFooterConfig | null>(null);

  const setFooterConfig = useCallback(
    (newConfig: WizardFooterConfig | null) => {
      setConfig(newConfig);
    },
    []
  );

  return (
    <WizardFooterContext.Provider value={{ config, setFooterConfig }}>
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
