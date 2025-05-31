// DecalMeshesContext.tsx - FIXED VERSION
"use client";

import React, { createContext, useContext, ReactNode, useRef, useState, useCallback } from "react";
import * as THREE from "three";

interface TattooPrice {
  id: number;
  price: number;
  bodyPart: string;
  size: number;
}
interface Artist {
  id: string;
  name: string;
}
interface TattooCloseup {
  id: number;
  imageUrl: string;
}

interface DecalMeshesContextValue {
  decalMeshRef: React.MutableRefObject<{ [id: number]: THREE.Mesh }>;
  depositPaid: number;
  confirmed3DModel: string;
  tattooCloseups: string[];
  tattooCloseupMap: TattooCloseup[];
  setConfirmed3DModel: (fullModel: string) => void;
  setTattooCloseups: (closeups: string[]) => void;
  addTattooCloseup: (id: number, imageUrl: string) => void;
  removeTattooCloseup: (id: number) => void;
  setDepositPaid: (index: number) => void;
  priceEstimate: number;
  setEstimatedPrice: (index: number) => void;
  individualPrices: TattooPrice[];
  addIndividualPrice: (id: number, price: number, bodyPart: string, size: number) => void;
  removeIndividualPrice: (id: number) => void;
  updateTotalPrice: () => void;
  selectedArtist: string;
  selectedArtistName: string;
  artists: Artist[];
  setSelectedArtist: (id: string) => void;
  setSelectedArtistName: (name: string) => void;
  setArtists: (artists: Artist[]) => void;
}

const DecalMeshesContext = createContext<DecalMeshesContextValue | undefined>(undefined);

interface DecalMeshesProviderProps {
  children: ReactNode;
}

export const DecalMeshesProvider: React.FC<DecalMeshesProviderProps> = ({ children }) => {
  const decalMeshRef = useRef<{ [id: number]: THREE.Mesh }>({});
  const [depositPaid, setDepositPaid] = useState<number>(0);
  const [confirmed3DModel, setConfirmed3DModel] = useState<string>('');
  const [tattooCloseups, setTattooCloseups] = useState<string[]>([]);
  const [tattooCloseupMap, setTattooCloseupMap] = useState<TattooCloseup[]>([]);
  const [priceEstimate, setEstimatedPrice] = useState<number>(0);
  const [individualPrices, setIndividualPrices] = useState<TattooPrice[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<string>('');
  const [selectedArtistName, setSelectedArtistName] = useState<string>('');
  const [artists, setArtists] = useState<Artist[]>([]);
  
  // Add a tattoo closeup with its associated ID
  const addTattooCloseup = useCallback((id: number, imageUrl: string) => {
    setTattooCloseupMap(prev => {
      const existingIndex = prev.findIndex(item => item.id === id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { id, imageUrl };
        return updated;
      } else {
        return [...prev, { id, imageUrl }];
      }
    });
  }, []);
  
  // Remove a tattoo closeup by ID
  const removeTattooCloseup = useCallback((id: number) => {
    setTattooCloseupMap(prev => prev.filter(item => item.id !== id));
  }, []);
  
  // Update tattooCloseups array whenever tattooCloseupMap changes
  // THIS IS THE PROBLEMATIC EFFECT - FIXED NOW
  React.useEffect(() => {
    // Only update if there's an actual change to avoid infinite loops
    const sortedUrls = [...tattooCloseupMap]
      .sort((a, b) => a.id - b.id)
      .map(item => item.imageUrl);
    
    // Check if the arrays are different before updating
    if (JSON.stringify(sortedUrls) !== JSON.stringify(tattooCloseups)) {
      setTattooCloseups(sortedUrls);
    }
  }, [tattooCloseupMap, tattooCloseups]);
  
  // Add or update individual price
  const addIndividualPrice = useCallback((id: number, price: number, bodyPart: string, size: number) => {
    setIndividualPrices(prev => {
      const existingIndex = prev.findIndex(item => item.id === id);
      if (existingIndex >= 0) {
        const updatedPrices = [...prev];
        updatedPrices[existingIndex] = { id, price, bodyPart, size };
        return updatedPrices;
      } else {
        return [...prev, { id, price, bodyPart, size }];
      }
    });
  }, []);

  const removeIndividualPrice = useCallback((id: number) => {
    setIndividualPrices(prev => {
      const filtered = prev.filter(item => item.id !== id);
      return filtered;
    });
    
    // We need to be careful here to avoid cascading state updates
    // Rather than calling removeTattooCloseup which updates state
    // We'll just update the tattooCloseupMap directly
    setTattooCloseupMap(prev => prev.filter(item => item.id !== id));
  }, []);

  // Calculate and update total price when individualPrices changes
  React.useEffect(() => {
    const totalPrice = individualPrices.reduce((sum, item) => sum + item.price, 0);
    const formattedPrice = parseFloat(totalPrice.toFixed(2));
    
    // Only update if the price has actually changed
    if (formattedPrice !== priceEstimate) {
      setEstimatedPrice(formattedPrice);
    }
  }, [individualPrices, priceEstimate]);

  // Calculate and update total price - manual trigger
  const updateTotalPrice = useCallback(() => {
    const totalPrice = individualPrices.reduce((sum, item) => sum + item.price, 0);
    setEstimatedPrice(parseFloat(totalPrice.toFixed(2)));
  }, [individualPrices]);

  const contextValue = React.useMemo(() => ({
    decalMeshRef, 
    confirmed3DModel, 
    tattooCloseups,
    tattooCloseupMap,
    depositPaid, 
    setConfirmed3DModel,
    setTattooCloseups,
    addTattooCloseup,
    removeTattooCloseup,
    setDepositPaid, 
    priceEstimate, 
    setEstimatedPrice,
    individualPrices,
    addIndividualPrice,
    removeIndividualPrice,
    updateTotalPrice,
    selectedArtist,
    selectedArtistName,
    artists,
    setSelectedArtist,
    setSelectedArtistName,
    setArtists,
  }), [
    confirmed3DModel,
    tattooCloseups,
    tattooCloseupMap,
    depositPaid,
    priceEstimate,
    individualPrices,
    selectedArtist,
    selectedArtistName,
    artists,
    addTattooCloseup,
    removeTattooCloseup,
    addIndividualPrice,
    removeIndividualPrice,
    updateTotalPrice
  ]);

  return (
    <DecalMeshesContext.Provider value={contextValue}>
      {children}
    </DecalMeshesContext.Provider>
  );
};

export function useDecalMeshes(): DecalMeshesContextValue {
  const context = useContext(DecalMeshesContext);
  if (!context) {
    throw new Error("useDecalMeshes must be used within a DecalMeshesProvider");
  }
  return context;
}