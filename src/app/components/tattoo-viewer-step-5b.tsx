import React, { useLayoutEffect, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { LuCalendar } from "react-icons/lu";
import { IoClose } from "react-icons/io5";
// import { FaRegClock } from "react-icons/fa6";
import DatePickerCal from "./DatePickerCal";
import { useGender } from "../contexts/GenderContext";
import { useSkin } from "../contexts/SkinContext";
import { useDecalMeshes } from "../contexts/DecalMeshesContext";
import { createLead } from "../services/leadService";
import { useTattooDesigns } from "../contexts/TattooDesignsContext";
import axios from "axios";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const TattooViewerStep5b = () => {
  const params = useParams();
  const [date, setDate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [bookedDates] = useState(["2025-05-10", "2025-05-11"]);
  const [availableDates] = useState([
    "2025-05-12",
    "2025-05-13"
  ]);
  const [clientName, setClientName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Add state for deposit percentage
  const [depositPercentage, setDepositPercentage] = useState<number>(0.25); // Default to 25% as fallback
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false);

  const { genderIndex } = useGender();
  const { skinIndex } = useSkin();
  const { tattooDesigns } = useTattooDesigns();
  const { 
    priceEstimate, 
    confirmed3DModel, 
    selectedArtistName,
    tattooCloseupMap,
    
  } = useDecalMeshes();

  // Fetch admin deposit percentage
  useEffect(() => {
    const fetchAdminData = async () => {
      if (!params?.id) return;
      
      setIsLoadingAdmin(true);
      try {
        const response = await axios.get(`/api/admin?adminId=${params.id}`);
        
        if (response.data && response.data.depositPercentage !== undefined) {
          // Convert percentage to decimal (e.g., 25 -> 0.25)
          const percentage = typeof response.data.depositPercentage === 'number' 
            ? response.data.depositPercentage / 100 
            : 0.25;
          setDepositPercentage(percentage);
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
        // Keep default 25% on error
      } finally {
        setIsLoadingAdmin(false);
      }
    };

    fetchAdminData();
  }, [params?.id]);

  useLayoutEffect(() => {
    setDate(availableDates[0]);
  }, [availableDates]);

  const handleSubmit = async (paymentType: 'full' | 'deposit') => {
  if (!date) {
    alert("Please select a booking date");
    return;
  }

  if (!clientName || !email) {
    setFormSubmitted(true);
    return;
  }

  if (!selectedArtistName) {
    alert("Please go back and select an artist");
    return;
  }

  setLoading(true);

  try {
    // Prepare images and designs
    const closeupUrls = tattooCloseupMap.map(item => item.imageUrl);
    const allImages = [confirmed3DModel, ...closeupUrls].filter(Boolean);
    const designUrls = tattooDesigns.map(d => d.fileUrl);

    // Calculate payment amount
    const paymentAmount = paymentType === 'full' 
      ? priceEstimate 
      : priceEstimate * depositPercentage;

    // Create lead data
    const lead = {
      clientName,
      artistName: selectedArtistName,
      email,
      phone,
      priceEstimate,
      adminId: params.id,
      depositPaid: paymentAmount,
      confirmed3DModel, 
      tattooCloseups: allImages,
      bookingDate: date,
      gender: genderIndex === 0 ? "MALE" : "FEMALE",
      Designs: designUrls,
      skinTone: skinIndex === 0 ? "white" : skinIndex === 1 ? "olive" : skinIndex === 2 ? "brown" : skinIndex === 3 ? "dark" : "unknown",
      tattooRequests: [
        {
          description: "Custom tattoo design",
          imageUrls: allImages,
        },
      ],
    };

    // Create lead record on server
    const [res, err] = await createLead({ body: lead });

    if (err || !res) {
      alert("Error creating lead. Please try again.");
      console.error("Lead creation error:", err);
      setLoading(false);
      return;
    }

    // Create Stripe checkout session
    const response = await fetch("/api/stripe_session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
  depositPaid: paymentAmount,
  email: lead.email,
  leadId: res.id,
  currency: 'gbp',
  name: paymentType === 'full' ? "Tattoo Appointment - Full Payment" : "Tattoo Appointment Deposit",
  success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment-success?adminId=${params.id}&leadId=${res.id}&session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/tattoo-viewer/${params.id}?alert=cancel`,
  metadata: {
    leadId: res.id,
    adminId: params.id,
    email: lead.email,
  },
}),
    });

    if (!response.ok) {
      throw new Error('Failed to create Stripe checkout session');
    }

    const { sessionId } = await response.json();

    // Redirect to Stripe Checkout
    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error("Stripe.js failed to load");
    }

    const { error } = await stripe.redirectToCheckout({ sessionId });

    if (error) {
      console.error("Stripe redirect error:", error);
      alert(error.message);
    }

  } catch (error) {
    console.error("Error processing payment:", error);
    alert("Payment processing error. Please try again.");
  } finally {
    setLoading(false);
  }
};


  // Calculate display deposit amount
 const displayDepositAmount = () => {
  if (isLoadingAdmin) return "...";
  return (depositPercentage * priceEstimate).toFixed(2);
};
  // Get deposit percentage for display
  const getDepositPercentageDisplay = () => {
    if (isLoadingAdmin) return "...";
    return `${Math.round(depositPercentage * 100)}%`;
  };

  return (
    <div className='w-full flex flex-col gap-5 relative'>
      <div className='w-full flex flex-col gap-1'>
        <h2 className='text-4xl tracking-widest leading-snug font-semibold'>
          Check availability.
        </h2>
        <p className='tracking-wide text-base w-full'>
          Choose your preferred date and time.
        </p>
      </div>

      {/* Date Modal */}
      <div
        onClick={() => {
          setShowModal(true);
        }}
        className='flex items-center justify-between px-4 py-3 border border-borderColor bg-white rounded-lg cursor-pointer'
      >
        <p className='text-sm tracking-wide'>{date}</p>
        <LuCalendar />
      </div>

      {/* Customer Info Form */}
      <div className="w-full mt-4">
        <h3 className="text-2xl tracking-wide font-semibold mb-3">Your Information</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="clientName" className="block mb-2 text-sm font-medium">
              Full Name
            </label>
            <input
              id="clientName"
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className={`w-full px-4 py-2 border rounded-md ${formSubmitted && !clientName ? "border-red-500" : "border-gray-300"}`}
              required
            />
            {formSubmitted && !clientName && (
              <p className="text-red-500 text-sm mt-1">Name is required</p>
            )}
          </div>
          
          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-2 border rounded-md ${formSubmitted && !email ? "border-red-500" : "border-gray-300"}`}
              required
            />
            {formSubmitted && !email && (
              <p className="text-red-500 text-sm mt-1">Email is required</p>
            )}
          </div>
          
          <div>
            <label htmlFor="phone" className="block mb-2 text-sm font-medium">
              Phone Number (Optional)
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Price Summary */}
      {priceEstimate > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-lg font-medium">Total Price:</p>
            <p className="text-2xl font-bold">{priceEstimate} €</p>
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-md font-medium">
              Minimum Deposit ({getDepositPercentageDisplay()}):
            </p>
            <p className="text-xl font-semibold">{displayDepositAmount()} €</p>
          </div>
        </div>
      )}

      {/* Payment Options */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4 tracking-wide">Choose Payment Option</h3>
        <div className="flex gap-4 flex-col sm:flex-row">
          {/* Pay in Full Button */}
          <button
            onClick={() => handleSubmit('full')}
            disabled={loading || !date || isLoadingAdmin}
            className="flex-1 px-6 py-4 bg-black text-white rounded-lg text-base hover:bg-gray-800 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed border-2 border-black"
          >
            <div className="text-center">
              <div className="font-semibold">Pay in Full</div>
              <div className="text-sm opacity-90">
                {loading ? "Processing..." : isLoadingAdmin ? "Loading..." : `${priceEstimate} €`}
              </div>
            </div>
          </button>

          {/* Pay Minimum Deposit Button */}
          <button
            onClick={() => handleSubmit('deposit')}
            disabled={loading || !date || isLoadingAdmin}
            className="flex-1 px-6 py-4 bg-white text-black rounded-lg text-base hover:bg-gray-50 transition-colors duration-300 disabled:bg-gray-100 disabled:cursor-not-allowed border-2 border-black"
          >
            <div className="text-center">
              <div className="font-semibold">Pay Minimum Deposit</div>
              <div className="text-sm opacity-70">
                {loading ? "Processing..." : isLoadingAdmin ? "Loading..." : `${displayDepositAmount()} € (${getDepositPercentageDisplay()})`}
              </div>
            </div>
          </button>
        </div>
        
        <p className="text-sm text-gray-600 mt-3 text-center">
          {depositPercentage < 1 ? 
            "Pay the minimum deposit now and pay the remaining balance on your appointment day." :
            "Choose your preferred payment option above."
          }
        </p>
      </div>

      {showModal && (
        <div className='w-full h-screen fixed top-0 left-0 z-40 flex items-start justify-center'>
          <div className='md:w-[40%] w-[80%] h-[85vh] z-50 mt-[5%] overflow-y-auto hide-scrollbar rounded-lg'>
            <div className='w-full flex flex-col items-center justify-center gap-4 p-5 rounded-lg bg-white'>
              <div className='w-full flex items-center justify-between'>
                <h3 className='text-base font-semibold tracking-wide'>
                  Booking Details
                </h3>
                <IoClose
                  className='w-5 h-5 cursor-pointer'
                  onClick={() => {
                    setShowModal(false);
                  }}
                />
              </div>
              {/* <div className='w-full px-4 py-5 shadow-lg shadow-borderColor rounded-lg flex flex-col gap-3 border-borderColor'>
                <h3 className='text-sm font-semibold tracking-wide'>
                  Booked Lead
                </h3>
                <div className='w-full flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <div className='w-8 h-8 rounded-full bg-black flex items-center justify-center text-sm font-semibold text-white'>
                      JD
                    </div>
                    <h3 className='text-sm font-semibold tracking-wide'>
                      John Doe
                    </h3>
                  </div>
                  <div className='flex items-center gap-2'>
                    <FaRegClock className='text-blue-400' />
                    <p className='text-sm text-borderColor tracking-wide'>
                      10 May, 2025
                    </p>
                  </div>
                </div>
              </div> */}
              <div className='w-full px-4 py-5 shadow-lg shadow-borderColor rounded-lg flex items-center justify-center border-borderColor relative'>
                <DatePickerCal
                  date={date}
                  setDate={setDate}
                  bookedDates={bookedDates}
                  availableDates={availableDates}
                />
              </div>
            </div>
          </div>

          <div className='w-full h-full absolute top-0 left-0 bg-black opacity-25 z-40'></div>
        </div>
      )}
    </div>
  );
};

export default TattooViewerStep5b;