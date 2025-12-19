import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";

export type SideType = "admin" | "user";

interface SideContextType {
  currentSide: SideType;
  switchSide: (side: SideType) => void;
}

const SideContext = createContext<SideContextType | undefined>(undefined);

export function SideProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage if available, otherwise default to "admin"
  const [currentSide, setCurrentSide] = useState<SideType>(() => {
    const saved = localStorage.getItem("bondvoyage-side");
    return (saved as SideType) || "admin";
  });

  const switchSide = useCallback((side: SideType) => {
    setCurrentSide(side);
    localStorage.setItem("bondvoyage-side", side);
  }, []);

  return (
    <SideContext.Provider value={{ currentSide, switchSide }}>
      {children}
    </SideContext.Provider>
  );
}

export function useSide() {
  const context = useContext(SideContext);
  if (context === undefined) {
    throw new Error("useSide must be used within a SideProvider");
  }
  return context;
}
