// Create a new context file, e.g., TattooDesignsContext.tsx
"use client";

import { createContext, useContext, useState } from 'react';

interface TattooDesign {
  fileUrl: string;
}

interface TattooDesignsContextType {
  tattooDesigns: TattooDesign[];
  setTattooDesigns: React.Dispatch<React.SetStateAction<TattooDesign[]>>;
}
const TattooDesignsContext = createContext<TattooDesignsContextType>({
  tattooDesigns: [],
  setTattooDesigns: () => {},
});

export const useTattooDesigns = () => useContext(TattooDesignsContext);

export const TattooDesignsProvider = ({ children }: { children: React.ReactNode }) => {
  const [tattooDesigns, setTattooDesigns] = useState<TattooDesign[]>([]);
  
  return (
    <TattooDesignsContext.Provider value={{ tattooDesigns, setTattooDesigns }}>
      {children}
    </TattooDesignsContext.Provider>
  );
};