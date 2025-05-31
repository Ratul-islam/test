/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { useGender } from "@/app/contexts/GenderContext";
import * as THREE from "three";
import { useDecalMeshes } from "@/app/contexts/DecalMeshesContext";
//import { fetchUserSession } from "/app/services/userService";
import {
  fetchSpecialisations,
  fetchArtists
} from "@/app/services/artistService";
import axios from "axios";

interface Artist {
  id: string;
  name: string;
}

const TattooViewerStep4: React.FC = () => {
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [specialisations, setSpecialisations] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalDecalArea, setTotalDecalArea] = useState<number | null>(null);

  const previousDecalKeysRef = useRef<string[]>([]);

  const params = useParams();
  const modelSurfaceAreas = [70008, 70008];
  const { genderIndex } = useGender();
  const {
    decalMeshRef,
    depositPaid,
    setDepositPaid,
    setEstimatedPrice,
    priceEstimate,
    individualPrices,
    updateTotalPrice,
    selectedArtist,
    // selectedArtistName,
    artists,
    setSelectedArtist,
    setSelectedArtistName,
    setArtists
  } = useDecalMeshes();


  // Load specialisations on mount or adminId change
  useEffect(() => {
    const loadSpecialisations = async () => {
      const [res, err] = await fetchSpecialisations({
        searchParams: { adminId: params?.id || '' }
      });

      if (!err && res?.specializations) {
        setSpecialisations(res.specializations);
      } else {
        setSpecialisations([]);
        console.error("Failed to load specializations:", err || "Missing data in response");
      }
    };

    loadSpecialisations();
  }, [params?.id]);

  // Calculate total decal area
  const calculateTotalDecalArea = useCallback((): number => {
    let totalArea = 0;
    for (const key in decalMeshRef.current) {
      const mesh = decalMeshRef.current[key];
      if (mesh?.geometry) {
        const geo = mesh.geometry as THREE.BufferGeometry;
        if (geo.attributes.position) {
          totalArea += geo.attributes.position.count;
        }
      }
    }
    return totalArea;
  }, [decalMeshRef]);


  // Calculate price via API
  const calculatePrice = useCallback(async () => {
    if (!selectedArtist) return;

    setLoading(true);
    try {
      const totalArea = calculateTotalDecalArea();
      setTotalDecalArea(totalArea);

      const response = await axios.post("/api/price-estimation", {
        artistId: selectedArtist,
        decalArea: totalArea,
      });

      const { estimatedPrice } = response.data;
      const formattedPrice = parseFloat(estimatedPrice.toFixed(2));
      setEstimatedPrice(formattedPrice);

      // Calculate 25% deposit
      const depositAmount = formattedPrice * 0.25;
      setDepositPaid(parseFloat(depositAmount.toFixed(2)));
    } catch (error) {
      console.error("Error fetching price estimate:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedArtist, calculateTotalDecalArea, setEstimatedPrice, setDepositPaid]);

  // Monitor decal mesh changes
  useEffect(() => {
    const checkForDecalChanges = () => {
      const currentKeys = Object.keys(decalMeshRef.current).sort();
      const prevKeys = previousDecalKeysRef.current;
      const changed = JSON.stringify(currentKeys) !== JSON.stringify(prevKeys);

      if (currentKeys.length > 0 && (changed || !priceEstimate)) {
        previousDecalKeysRef.current = currentKeys;
        if (selectedArtist) {
          calculatePrice();
        }
      }

      setTotalDecalArea(calculateTotalDecalArea());
    };

    checkForDecalChanges();
    const interval = setInterval(checkForDecalChanges, 1000);
    return () => clearInterval(interval);
  }, [decalMeshRef, selectedArtist, priceEstimate, calculatePrice, calculateTotalDecalArea]);

  // Update total price when individual prices change
  useEffect(() => {
    updateTotalPrice();
  }, [individualPrices, updateTotalPrice]);

  // Update deposit when priceEstimate changes
  useEffect(() => {
    if (priceEstimate != null) {
      const depositAmount = priceEstimate * 0.25;
      setDepositPaid(parseFloat(depositAmount.toFixed(2)));
    }
  }, [priceEstimate, setDepositPaid]);

  // Handle style selection
  const handleSpecChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedStyle(value);
    setSelectedArtist("");
    setSelectedArtistName("");

    const [res, error] = await fetchArtists({
      searchParams: { specialization: value }
    });

    if (!error && res?.artists) {
      setArtists(res.artists as Artist[]);
    }
  };

  // Handle artist selection
  const handleArtistChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const typedArtists = artists as Artist[];
    const selectedObj = typedArtists.find(a => a.id === value);

    setSelectedArtist(value);
    setSelectedArtistName(selectedObj?.name || "");

    if (value) {
      calculatePrice();
    }
  };

  // // Get region display name
  // /* eslint-disable no-unused-vars */
  // const getRegionDisplayName = (bodyPart: string) => {
  //   const regionMap: { [key: string]: string } = {
  //     'Chest_ML': 'Chest',
  //     // ... other mappings
  //   };
  //   for (const [key, value] of Object.entries(regionMap)) {
  //     if (bodyPart.includes(key)) {
  //       return value;
  //     }
  //   }
  //   return bodyPart;
  // };
  // /* eslint-enable no-unused-vars */

  return (
    <div>
      <div className="mb-[20px] xl:mb-[40px]">
        <h2 className="text-[24px] xl:text-[36px] font-bold mb-[10px]">
          Get estimated price
        </h2>
        <p className="text-[16px] xl:text-[18px] text-gray-600">
          Choose your tattoo artist and the style you prefer
        </p>
      </div>

      <div>
        {/* Tattoo Style Dropdown */}
        <div className="relative mb-4">
          <label htmlFor="tattooStyle" className="text-[16px] xl:text-[18px] text-gray-600 mb-[5px] block">
            Select Tattoo Style
          </label>
          <select
            id="tattooStyle"
            value={selectedStyle}
            onChange={handleSpecChange}
            className="w-full border border-gray-400 rounded-lg px-[10px] py-[10px] text-[16px] xl:text-[18px] focus:outline-none"
          >
            <option value="" disabled>
              Select Tattoo Style
            </option>
            {specialisations.map((style, idx) => (
              <option key={idx} value={style}>
                {style}
              </option>
            ))}
          </select>
        </div>

        {/* Tattoo Artist Dropdown */}
        <div className="relative">
          <label htmlFor="tattooArtist" className="text-[16px] xl:text-[18px] text-gray-600 mb-[5px] block">
            Select Tattoo Artist
          </label>
          <select
            id="tattooArtist"
            value={selectedArtist}
            onChange={handleArtistChange}
            className="w-full border border-gray-400 rounded-lg px-[10px] py-[10px] text-[16px] xl:text-[18px] focus:outline-none"
          >
            <option value="" disabled>
              Select Tattoo Artist
            </option>
            {(artists as Artist[]).map((artist, idx) => (
              <option key={idx} value={artist.id}>
                {artist.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/*  Button */}
      <div className="mt-[30px] xl:mt-[50px]">
        <button
          onClick={calculatePrice}
          className="px-[30px] py-[10px] xl:px-[40px] xl:py-[15px] bg-black text-white rounded-full text-[16px] xl:text-[18px] hover:bg-gray-800 transition-colors duration-300"
          disabled={loading || !selectedArtist}
        >
          {loading ? "Calculating..." : "Calculate Price"}
        </button>
      </div>

      {/* Estimated Price Display */}
      <div className="mt-[30px] xl:mt-[50px]">
        <p className="text-[18px] xl:text-[20px] font-medium text-gray-800 mb-[10px]">
          Your estimated Price is:
        </p>
        <p className="text-[32px] xl:text-[40px] font-bold text-black">
          {loading
            ? "Calculating..."
            : priceEstimate != null
              ? `${priceEstimate} €`
              : "--"}
        </p>
        <p className="text-sm text-gray-500">
          (debug) totalDecalArea: {loading ? "..." : (totalDecalArea ?? "--")}, modelSurface: {modelSurfaceAreas[genderIndex].toFixed(3)}
        </p>
      </div>

      {/* Deposit Display */}
      <div className="xl:mt-[50px]">
        <p className="text-[18px] xl:text-[20px] font-medium text-gray-800 mb-[10px]">
          Your Total Deposit Amount to be paid (25%):
        </p>
        <p className="text-[32px] xl:text-[40px] font-bold text-black">
          {loading
            ? "Calculating..."
            : depositPaid != null
              ? `${depositPaid} €`
              : "--"}
        </p>
      </div>
    </div>
  );
};

export default TattooViewerStep4;
