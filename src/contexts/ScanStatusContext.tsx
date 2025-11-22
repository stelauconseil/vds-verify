import { createContext, useContext, useState, ReactNode } from "react";
import type { VdsResult } from "@/types/vds";

type ScanStatus = "valid" | "invalid" | "unsigned" | null;

interface ScanStatusContextType {
  status: ScanStatus;
  setStatus: (status: ScanStatus) => void;
  result: VdsResult | null;
  setResult: (result: VdsResult | null) => void;
}

const ScanStatusContext = createContext<ScanStatusContextType | undefined>(
  undefined
);

export function ScanStatusProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ScanStatus>(null);
  const [result, setResult] = useState<VdsResult | null>(null);

  return (
    <ScanStatusContext.Provider
      value={{ status, setStatus, result, setResult }}
    >
      {children}
    </ScanStatusContext.Provider>
  );
}

export function useScanStatus() {
  const context = useContext(ScanStatusContext);
  if (context === undefined) {
    throw new Error("useScanStatus must be used within a ScanStatusProvider");
  }
  return context;
}
