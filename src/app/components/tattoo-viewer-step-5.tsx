/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { useGender } from "../contexts/GenderContext";
import { useSkin } from "../contexts/SkinContext";
import { useDecalMeshes } from "../contexts/DecalMeshesContext";
import { createLead } from "../services/leadService";
import ImageModal from "../components/ImageModal";
import { disableScroll } from "@/app/utils/scrollbar";
import Image from "next/image";
import { useTattooDesigns } from "../contexts/TattooDesignsContext";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const TattooViewerStep5 = ({ setStep }: { setStep: (step: number) => void }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [clientName, setClientName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [showUserForm, setShowUserForm] = useState(true);
  const { genderIndex } = useGender();
  const { skinIndex } = useSkin();
  const { 
    priceEstimate, 
    confirmed3DModel, 
    tattooCloseups,
    selectedArtist,
    tattooCloseupMap,
    artists
  } = useDecalMeshes();
  const [loading, setLoading] = useState(false);
  const params = useParams();
  const { tattooDesigns } = useTattooDesigns();

  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  useEffect(() => {
    setStep(showUserForm ? 5 : 6);
  }, [showUserForm, setStep]);
  
  // Get the selected artist's name
  const selectedArtistName = selectedArtist 
    ? artists.find((a: any) => a.id === selectedArtist)?.name 
    : "";

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setShowImageModal(true);
    disableScroll();
  };

  const handleUserInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (clientName && email && selectedArtistName) {
      setShowUserForm(false);

    }
  };

  const onSubmit = async () => {
    if (!clientName || !email || !selectedArtistName) {
      setShowUserForm(true);

      return;

    }

    setLoading(true);
    
    const closeupUrls = tattooCloseupMap.map(item => item.imageUrl);
    const allImages = [confirmed3DModel, ...closeupUrls].filter(Boolean);    
    const designUrls = tattooDesigns.map(d => d.fileUrl);

    const lead = {
      clientName,
      artistName: selectedArtistName,
      email,
      phone,
      priceEstimate,
      adminId: params.id,
      depositPaid: 0.51,
      confirmed3DModel, 
      tattooCloseups: allImages, // Ensure this is always an array
      bookingDate: selectedDate,
      gender: genderIndex === 0 ? "MALE" : "FEMALE",
      Designs: designUrls , // Include all original designs if needed
      skinTone: skinIndex === 0 ? "white" : skinIndex === 1 ? "olive" : skinIndex === 2 ? "brown" : skinIndex === 3 ? "dark" : "unknown",
      tattooRequests: [
        {
          description: "Custom tattoo design",
          imageUrls: allImages,
        },
      ],
    };

    try {
      const [res, err] = await createLead({ body: lead });

      if(!err) {
        const response = await fetch("/api/stripe_session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            depositPaid: lead.depositPaid,
            email: lead.email,
            leadId: res.id,
            currency: 'gbp',
            name: "Tattoo Appointment Deposit",
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/tattoo-viewer/${params.id}?alert=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/tattoo-viewer/${params.id}?alert=cancel`,
          }),
        });

        const { sessionId } = await response.json();
        const stripe = await stripePromise;
        await stripe?.redirectToCheckout({ sessionId });
      }
    } catch (error) {
      console.error("Error processing payment:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-[20px] xl:mb-[40px]">
        <h2 className="text-[24px] xl:text-[36px] font-bold mb-[10px]">
          Book your appointment
        </h2>
        <p className="text-[16px] xl:text-[18px] text-gray-600">
        Let’s get you booked in
        </p>
      </div>
      
      {showUserForm ? (
        <form onSubmit={handleUserInfoSubmit} className="space-y-4 mb-6">
          <div>
            <label htmlFor="clientName" className="block mb-2 font-medium">
              Full Name
            </label>
            <input
              id="clientName"
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block mb-2 font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label htmlFor="phone" className="block mb-2 font-medium">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-black text-white rounded-md"
          >
            Continue
          </button>
        </form>
      ) : (
        <>
          {/* Display tattoo previews */}
          {(confirmed3DModel || tattooCloseups.length > 0) && (
            <div className="mb-6">
              <h3 className="text-[18px] font-semibold mb-2">Your tattoo design:</h3>
              
              {tattooCloseups.length > 0 && (
                <div>
                  <p className="text-[14px] text-gray-600 mb-2">Tattoo closeups</p>
                  <div className="flex flex-wrap gap-2">
                    {tattooCloseups.map((img, idx) => (
                      
                      <div 
                        key={idx} 
                        className="w-24 h-24 border rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => handleImageClick(idx)}
                      >
                        <Image 
                          src={img} 
                          alt={`Tattoo closeup ${idx+1}`} 
                          className="w-full h-full object-cover"
                          width={96}
                          height={96}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Date Picker */}
          <div className="relative w-full mt-[20px]">
            <label htmlFor="appointmentDate" className="block mb-2 font-medium">
              Appointment Date
            </label>
            <input
              id="appointmentDate"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>

          {/* Artist Info */}
          <div className="mt-4 p-3 bg-gray-100 rounded-md">
            <p className="font-medium">Artist: {selectedArtistName}</p>
          </div>

          {/* Pay Now Button */}
          <div className="mt-[30px] xl:mt-[50px]">
            <button
              onClick={onSubmit}
              disabled={loading || !selectedDate}
              className="px-[30px] py-[10px] bg-black text-white rounded-full text-[16px] hover:bg-gray-800 transition-colors duration-300 disabled:bg-gray-400"
            >
              {loading ? "Processing..." : "Pay Now"}
            </button>
          </div>
        </>
      )}
      
      <ImageModal 
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        images={tattooCloseups}
        currentIndex={currentImageIndex}
        setCurrentIndex={setCurrentImageIndex}
      />
    </div>
  );
};

export default TattooViewerStep5;