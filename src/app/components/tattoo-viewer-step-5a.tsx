/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import * as THREE from "three";
import { useDecalMeshes } from "@/app/contexts/DecalMeshesContext";
import { fetchUserSession } from "@/app/services/userService";
import axios from "axios";

const TattooViewerStep5a = () => {
  const [loading, setLoading] = useState(false);
  const [totalDecalArea, setTotalDecalArea] = useState<number | null>(null);
  const params = useParams();
  const {
    decalMeshRef,
    setDepositPaid,
    setEstimatedPrice,
    priceEstimate,
    selectedArtist
  } = useDecalMeshes();
  const previousDecalKeysRef = useRef<string[]>([]);
  useEffect(() => {
    const checkForDecalChanges = () => {
      const currentDecalKeys = Object.keys(decalMeshRef.current).sort();
      const previousDecalKeys = previousDecalKeysRef.current;

      const keysChanged =
        JSON.stringify(currentDecalKeys) !== JSON.stringify(previousDecalKeys);

      if (currentDecalKeys.length > 0 && (keysChanged || !priceEstimate)) {
        previousDecalKeysRef.current = currentDecalKeys;

        if (selectedArtist) {
          calculatePrice();
        }
      }

      setTotalDecalArea(calculateTotalDecalArea());
    };

    checkForDecalChanges();

    const intervalId = setInterval(checkForDecalChanges, 1000);

    return () => clearInterval(intervalId);
  }, [decalMeshRef, selectedArtist, priceEstimate]);

  const calculateTotalDecalArea = () => {
    let totalArea = 0;
    for (const idStr in decalMeshRef.current) {
      const mesh = decalMeshRef.current[idStr];
      if (mesh && mesh.geometry) {
        const geo = mesh.geometry as THREE.BufferGeometry;
        if (geo.attributes.position) {
          totalArea += geo.attributes.position.count;
        }
      }
    }
    return totalArea;
  };

  async function calculatePrice() {
    if (!selectedArtist) {
      return;
    }
    setLoading(true);
    try {
      const totalArea = calculateTotalDecalArea();
      setTotalDecalArea(totalArea);

      const response = await axios.post("/api/price-estimation", {
        artistId: selectedArtist,
        decalArea: totalArea
      });

      const { estimatedPrice } = response.data;
      const formattedPrice = parseFloat(estimatedPrice.toFixed(2));
      setEstimatedPrice(formattedPrice);

      if (params?.id && typeof params.id === "string") {
        const [res, err] = await fetchUserSession({
          searchParams: { adminId: params?.id }
        });

        if (!err) {
          const depositAmount = (formattedPrice * res.depositPercentage) / 100;
          setDepositPaid(parseFloat(depositAmount.toFixed(2)));
        }
      }
    } catch (error) {
      console.error("Error fetching price estimate:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (selectedArtist) {
      calculatePrice();
    }
  }, []);

  return (
    <div className='w-full flex flex-col gap-5'>
      <div className='w-full flex flex-col gap-1'>
        <h2 className='text-4xl tracking-widest leading-snug font-semibold'>
          Please find your estimate.
        </h2>
        <p className='tracking-wide text-base w-full'>
          Remember, this can sometimes change once the design has been approved
          by the artist, we believe in taking the advice of the artist for the
          best results.
        </p>
      </div>

      {/* Estimated Price */}
      <div className='flex items-center justify-between flex-wrap'>
        <p className='text-[18px] xl:text-[20px] font-medium text-gray-800 mb-[10px]'>
          Your estimated Price is:
        </p>
        <p className='text-lg tracking-wide'>
          {loading
            ? "Calculating..."
            : priceEstimate
              ? `${priceEstimate} €`
              : "--"}
        </p>
      </div>
    </div>
  );
};

export default TattooViewerStep5a;
