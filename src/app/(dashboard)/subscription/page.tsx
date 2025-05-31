/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import Image from "next/image";
import { useState, useEffect, ChangeEvent } from "react";
import { enableScroll } from "@/app/utils/scrollbar";
import Modal from "@/app/components/modal";
import Switcher4 from "@/app/components/switcher";
import { useSession } from "next-auth/react";
import { differenceInDays, parseISO } from "date-fns";
import { loadStripe } from "@stripe/stripe-js";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const Subscription = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showSalesModal, setShowSalesModal] = useState<boolean>(false);
  const [checked, setIsChecked] = useState<boolean>(false);
  const [selected, setSelected] = useState<string>("visa");
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>();
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<{
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: string;
  }>({
    brand: "",
    last4: "",
    exp_month: 0,
    exp_year: ""
  });

  const [contactSales, setContactSales] = useState({
    reason: "",
    query: "",
    reason_for_cancel: "",
    reason_for_cancel_other: ""
  });
  const [modelError, setModelError] = useState("");

  const { data: session, update }: any = useSession();

  // console.log(session);
  useEffect(() => {
    const today = new Date();
    if (session) {
      const expiry = parseISO(session.user.subscriptionExpiry);
      const diff = differenceInDays(expiry, today);
      setDaysLeft(diff);
      setIsChecked(session.user?.autoRenew ? true : false);
      setSubscriptionStatus(session.user?.subscriptionStatus);
      getCustomerCardDetails(session.user.id);
      if (diff < 1) {
        setSubscriptionStatus("EXPIRED");
        handleSubscriptionExpiry(session.user.id);
      }
      setLoading(false);
    }
  }, [session]);

  const getCustomerCardDetails = async (adminId: string) => {
    const response = await fetch("/api/admin/customer_card_details", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ adminId, subscriptionStatus: "EXPIRED" })
    });
    const { details } = await response.json();
    setPaymentDetails(details);
  };

  const handleSubscriptionExpiry = async (adminId: string) => {
    try {
      await fetch("/api/admin/update_subscription_status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ adminId, subscriptionStatus: "EXPIRED" })
      });
    } catch (error) {
      console.error("Error updating subscription status:", error);
    }
  };

  const handleCheckout = async () => {
    try {
      console.log("Payment initialized");
      setLoading(true);
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          depositPaid: 50,
          name: "Monthly Subscription",
          email: session.user.email,
          currency: "usd",
          paymentType: "subscriptionPayment",
          success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription`,
          adminId: session.user.id,
          checked
        })
      });
      
      // Add error handling here
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Checkout failed");
      }
      
      const { sessionId } = await response.json();
      console.log(sessionId);
  
      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      setLoading(false);
      await stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error("Checkout error:", error);
      setLoading(false);
      toast.error("Payment setup failed. Please try again.");
    }
  };
  const handleAutoRenew = async (e: ChangeEvent<HTMLInputElement>) => {
    const isTogglingOn = e.target.checked;
    if (
      window.confirm(
        `Are you sure you want to ${isTogglingOn ? "enable" : "disable"} auto-renewal?`
      )
    ) {
      setIsChecked(isTogglingOn);
      await fetch("/api/admin/update_renew", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: session.user.id,
          checked: isTogglingOn
        })
      });
    }
  };

  const handleContactSales = async () => {
    setModelError("");
    const { reason, query, reason_for_cancel, reason_for_cancel_other } = contactSales;
    
    // Client-side validation
    if (!reason) {
      return setModelError("Reason is required");
    }
  
    if (reason === "cancel_subscription") {
      if (!reason_for_cancel) {
        return setModelError("Cancellation reason is required");
      }
      if (reason_for_cancel === "other" && !reason_for_cancel_other) {
        return setModelError("Please specify cancellation reason");
      }
    } else if (!query) {
      return setModelError("Query is required");
    }
  
    try {
      // Prepare the cancellation reason text
      const cancellationReason = reason === "cancel_subscription" 
        ? reason_for_cancel === "other" 
          ? reason_for_cancel_other 
          : reason_for_cancel
        : "";
  
      // Submit to queries API for all cases (including cancellations)
      const queryPayload = {
        reason,
        name: session.user.name,
        email: session.user.email,
        subscriptionStatus: session.user.subscriptionStatus,
        query: reason === "cancel_subscription" 
          ? `Cancellation Request: ${cancellationReason}` 
          : query,
        ...(reason === "cancel_subscription" && { reason_for_cancel: cancellationReason })
      };
  
      const queryResponse = await fetch("/api/queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(queryPayload)
      });
  
      if (!queryResponse.ok) {
        const errorResult = await queryResponse.json();
        throw new Error(errorResult.message || "Failed to submit inquiry");
      }
  
      // For cancellation requests, also update subscription status
      if (reason === "cancel_subscription") {
        const cancelResponse = await fetch("/api/subscription/request-cancellation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: session.user.id,
            reason: cancellationReason
          })
        });
  
        if (!cancelResponse.ok) {
          const errorResult = await cancelResponse.json();
          throw new Error(errorResult.message || "Failed to submit cancellation request");
        }
      }
  
      // Close modal and show success message
      setShowSalesModal(false);
      toast.success(
        reason === "cancel_subscription" 
          ? "Cancellation request submitted for admin review" 
          : "Your inquiry has been submitted"
      );
      
      // Update session to reflect changes
      await update();
  
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : "An error occurred while submitting your request"
      );
    }
  };

  return (
    <>
      {loading ? (
        <div className='text-center py-4 flex items-center justify-center laptop:h-full'>
          <Loader2
            className='animate-spin text-primary w-8 h-8'
            strokeWidth={3}
          />
        </div>
      ) : (
        <>
          <section className='h-screen p-4 pt-3 tablet:p-1 flex gap-3 laptop:flex-col laptop:h-full laptop:pb-20'>
            <div className='h-[406px] w-full max-w-[827px] border border-[#ececed] bg-white p-6 mobile:p-3 rounded-[16px]'>
              <span className='text-[26px] mobile:text-[22px] font-semibold leading-[154%] tracking-wider'>
                Manage Subscription
              </span>
              <div className='mt-4 flex flex-col justify-between p-6 mobile:py-7 mobile:px-2 h-[230px] w-full max-w-[779px] border border-[#ececed] rounded-[13px] bg-gradient-to-t from-[#fff]/80 to-[#dbf3ff]/80'>
                <div>
                  <div className='flex items-center justify-between gap-x-2'>
                    <div
                      className={`rounded-[8px] px-4 py-[10px] h-[32px] flex items-center gap-x-[10px] ${subscriptionStatus === "EXPIRED" ? "bg-[#eecbcb]" : "bg-[#affad0]"}`}
                    >
                      <div
                        className={`w-2 h-2 rounded-[50%] ${subscriptionStatus === "EXPIRED" ? "bg-[#ff4d4d]" : "bg-[#02b151]"}`}
                      ></div>
                      <span
                        className={`text-[15px] leading-[150%] ${subscriptionStatus === "EXPIRED" ? "text-[#ff4d4d]" : "text-[#02b151]"} font-bold`}
                      >
                        {subscriptionStatus}
                      </span>
                    </div>

                    {/* <div className='flex items-center gap-x-5 mt-1 mr-2 mobile:gap-x-1 mobile:flex-col-reverse relative'>
                      <span className='font-semibold tracking-[0.06em] text-[25px] tablet:text-[18px] mobile:absolute mobile:right-0 mobile:truncate mobile:top-8'>
                        Auto Renewal
                      </span>
                      <Switcher1 onChange={handleAutoRenew} checked={checked} />
                    </div> */}
                  </div>
                  <div className='mt-2 flex gap-x-3 mobile:gap-x-1'>
                    <Image
                      src='/dashboard/time.svg'
                      width={23}
                      height={23}
                      alt='time'
                    />
                    <span className='text-[17px] tablet:text-[14px] mobile:text-[12px] font-semibold tracking-wide'>
                      {daysLeft} Days Left{" "}
                    </span>
                  </div>
                </div>

                <div className='flex justify-between items-end relative'>
                  {/* <button
                    onClick={() => {
                      disableScroll();
                      setShowModal(true);
                    }}
                    className='w-[123px] h-[38px] rounded-[9px] py-2 px-3 border border-[#bebeff] mobile:w-20 mobile:text-[13px]'
                  >
                    See More
                  </button> */}
                  <p className='font-bold text-[14px] tablet:text-[14px] leading-[70%] flex gap-x-5 mr-[140px] tablet:mr-[100px] justify-end'>
                    {session.user.trial ? "Trial Period" : ""}
                  </p>
                  <p className='font-bold text-[51px] tablet:text-[28px] leading-[70%] flex gap-x-5 mr-[140px] tablet:mr-[100px] justify-end'>
                    $50
                  </p>
                  <span className='text-[25px] tablet:text-[18px] leading-[150%] absolute right-1 bottom-[-10px] tracking-wider'>
                    /per month
                  </span>
                </div>
              </div>

              <div className='flex items-center justify-between'>
                <button
                  disabled={loading}
                  onClick={handleCheckout}
                  className='w-[124px] rounded-[12px] h-[47px] mt-5 bg-black text-white'
                >
                  <span className='text-[15px] font-semibold'>Pay Now</span>
                </button>
                <button
                  className='px-6 h-[48px] border border-[#ff5c5c] rounded-[8px] float-right mt-5 pt-1'
                  disabled={subscriptionStatus === "EXPIRED" && session.user.trial}
                  onClick={() => setShowSalesModal(true)}
                >
                  <span
                    className={`${subscriptionStatus === "EXPIRED" && session.user.trial ? "text-[#d4d4d4]" : "font-bold text-[#ff3939]"} tracking-wider`}
                  >
                    {" "}
                    Speaks To Sales
                  </span>
                </button>
              </div>
            </div>

            {paymentDetails.last4 ? (
              <div className='h-[406px] w-full max-w-[827px] border border-[#ececed] bg-white p-6 mobile:p-3 rounded-[16px]'>
                <span className='text-[26px] mobile:text-[22px] font-semibold leading-[154%] tracking-wider'>
                  Payment Details
                </span>
                <div className='mt-4 flex flex-col justify-between p-6 mobile:px-1 mobile:py-4 h-[230px] w-full max-w-[779px] border border-[#ececed] rounded-[13px] bg-white shadow-md'>
                  <div className='flex gap-x-[22px] mobile:gap-x-2 ml-1'>
                    <Image
                      src={
                        paymentDetails.brand === "visa"
                          ? "/dashboard/visa.svg"
                          : "/dashboard/master-card.png"
                      }
                      height={72}
                      width={84}
                      alt='card'
                    />
                    <div>
                      <span className='font-medium font-poppins text-[29px] mobile:text-[18px] block mt-1'>
                        **** **** {paymentDetails.last4}
                      </span>
                      <div className='flex items-center gap-x-3 mobile:gap-x-1 mobile:mt-1'>
                        <Image
                          src='/dashboard/time.svg'
                          width={22}
                          height={22}
                          alt='time'
                        />
                        <span className='text-[17px] text-[#9b9b9b] tracking-wide'>
                          {paymentDetails.exp_month}/{paymentDetails.exp_year}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <button className='w-[128px] h-[48px] border bg-black border-black rounded-[8px] float-right mt-5 pt-1'>
                  <span className='font-bold text-white tracking-wider'>
                    Cancel
                  </span>
                </button>
              </div>
            ) : (
              <></>
            )}
            <Modal
              showModal={showSalesModal}
              setShowModal={setShowSalesModal}
              before='translate-x-full'
              after='translate-x-0'
              bg='bg-black/50'
              duration='duration-300'
              floatRight={true}
            >
              <form className='flex flex-col gap-y-5 justify-between h-[calc(100dvh-27px)] w-[618px] bg-white rounded-[16px] m-[17px] p-6 overflow-y-auto tablet:m-0 tablet:w-screen tablet:h-screen'>
                <div>
                  <div className='flex items-center gap-x-3 justify-between'>
                    <div className='p-1 hover:bg-black/40 duration-200 flex items-center justify-center rounded-[50%] cursor-pointer'>
                      <Image
                        src='/dashboard/close-modal.svg'
                        width={32}
                        height={32}
                        alt='close'
                        title='close modal'
                        onClick={() => {
                          setShowModal(false);
                          enableScroll();
                        }}
                      />
                    </div>
                  </div>

                  <div className='mt-7 flex flex-col gap-y-6'>
                    {/* -----Reason for contacting sales------ */}
                    <div className='flex flex-col gap-y-2 w-full'>
                      <label className='text-[18px] font-semibold tracking-wider'>
                        Reason for contacting sales.
                      </label>
                      <select
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                          setContactSales({
                            ...contactSales,
                            reason: e.currentTarget.value
                          });
                        }}
                        name='reason_for_contacting_sales'
                        className='rounded-[8px] px-[10.5px] text-[12px] tracking-wider w-full bg-[#f8f8f8] h-[41px]'
                        id=''
                        value={contactSales.reason}
                      >
                        <option value={""}>Select</option>
                        <option value={"pricing_inquiry"}>
                          Pricing inquiry
                        </option>

                        <option value={"billing_issues"}>Billing issues</option>

                        <option value={"feature_request"}>
                          Feature request
                        </option>

                        <option value={"technical_support"}>
                          Technical support
                        </option>

                        <option value={"contract_renewal"}>
                          Contract renewal
                        </option>

                        <option value={"general_inquiry"}>
                          General inquiry
                        </option>

                        <option value={"cancel_subscription"}>
                          Cancel subscription
                        </option>
                      </select>
                    </div>

                    {/* ------- Enquery -------- */}
                    {contactSales.reason !== "cancel_subscription" &&
                      contactSales.reason !== "" && (
                        <div className='flex flex-col gap-y-2 w-full'>
                          <label className='text-[18px] font-semibold tracking-wider'>
                            Query
                          </label>
                          <textarea
                            name='query'
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                              setContactSales({
                                ...contactSales,
                                query: e.currentTarget.value
                              });
                            }}
                            value={contactSales.query}
                            className='rounded-[8px] px-[10.5px] text-[12px] tracking-wider w-full bg-[#f8f8f8] h-[150px]'
                            placeholder='Write your query here...'
                          ></textarea>
                        </div>
                      )}
                    {/* ------- Reason for canceling the subscription- -------- */}
                    {contactSales.reason === "cancel_subscription" && (
                      <div className='flex flex-col gap-y-2 w-full'>
                        <label className='text-[18px] font-semibold tracking-wider'>
                          Reason for cancellation
                        </label>
                        <select
                          onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                            setContactSales({
                              ...contactSales,
                              reason_for_cancel: e.currentTarget.value
                            });
                          }}
                          name='reason_for_contacting_sales'
                          className='rounded-[8px] px-[10.5px] text-[12px] tracking-wider w-full bg-[#f8f8f8] h-[41px]'
                          id=''
                          value={contactSales.reason_for_cancel}
                        >
                          <option value={""}>Select</option>
                          <option value={"Too expensive"}>Too expensive</option>
                          <option value={"Not using the service"}>
                            Not using the service
                          </option>
                          <option value={"Found a better alternative"}>
                            Found a better alternative
                          </option>
                          <option value={"Dissatisfied with features"}>
                            Dissatisfied with features
                          </option>
                          <option value={"other"}>Other</option>
                        </select>
                      </div>
                    )}
                    {/* ------- Reason for canceling the subscription for other reason -------- */}
                    {contactSales.reason === "cancel_subscription" &&
                      contactSales.reason_for_cancel === "other" && (
                        <div className='flex flex-col gap-y-2 w-full'>
                          <label className='text-[18px] font-semibold tracking-wider'>
                            Tell us the reason
                          </label>
                          <textarea
                            name='query'
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                              setContactSales({
                                ...contactSales,
                                reason_for_cancel_other: e.currentTarget.value
                              });
                            }}
                            value={contactSales.reason_for_cancel_other}
                            className='rounded-[8px] px-[10.5px] text-[12px] tracking-wider w-full bg-[#f8f8f8] h-[150px]'
                            placeholder='Write the reason here...'
                          ></textarea>
                        </div>
                      )}
                  </div>
                </div>

                <p className='text-red-600'>{modelError}</p>

                <div className='flex float-right gap-x-[15.6px] ml-auto'>
                  <button
                    type='button'
                    onClick={handleContactSales}
                    className='w-[124px] rounded-[12px] h-[47px] flex items-center justify-center bg-black text-white'
                  >
                    <span className='text-[15px] font-semibold'>Submit</span>
                  </button>
                </div>
              </form>
            </Modal>

            <Modal
              before='translate-x-full'
              after='translate-x-0'
              bg='bg-black/50'
              showModal={showModal}
              setShowModal={setShowModal}
              floatRight={true}
              duration='duration-300'
            >
              <form className='flex flex-col gap-y-5 justify-between h-[calc(100dvh-27px)] w-[618px] bg-white rounded-[16px] m-[17px] p-6 overflow-y-auto tablet:m-0 tablet:w-screen tablet:h-screen'>
                <div>
                  <div className='flex items-center gap-x-3 justify-between'>
                    <span className='text-[32px] tracking-wider'>
                      Payment Details
                    </span>
                    <div className='p-1 hover:bg-black/40 duration-200 flex items-center justify-center rounded-[50%] cursor-pointer'>
                      <Image
                        src='/dashboard/close-modal.svg'
                        width={32}
                        height={32}
                        alt='close'
                        title='close modal'
                        onClick={() => {
                          setShowModal(false);
                          enableScroll();
                        }}
                      />
                    </div>
                  </div>
                  <span className='mt-10 tracking-[0.06em] block text-[18px] font-semibold mb-2'>
                    Choose payment Method
                  </span>

                  <div className='grid grid-cols-4 items-center gap-4 justify-between mobile:grid-cols-2'>
                    {["visa", "master-card", "paypal", "apple"].map(item => (
                      <div
                        key={item}
                        onClick={() => setSelected(item)}
                        className={`rounded-[8px] w-[130px] p-4 h-[50px] border-2 flex items-center justify-center cursor-pointer tablet:w-[100px] mobile:w-full
                ${selected === item ? "border-[#717171]" : "border-[#bcbcbc]"}`}
                      >
                        <Image
                          src={`/dashboard/${item}.png`}
                          alt={item}
                          width={40}
                          height={40}
                        />
                      </div>
                    ))}
                  </div>

                  <div className='mt-7 flex flex-col gap-y-6'>
                    <div className='flex flex-col gap-y-2 w-full'>
                      <label className='text-[18px] font-semibold tracking-wider'>
                        Cardholder Name
                      </label>
                      <input
                        className='rounded-[8px] px-[10.5px] text-[12px] tracking-wider w-full bg-[#f8f8f8] h-[41px]'
                        defaultValue='John Doe'
                      />
                    </div>
                    <div className='flex flex-col gap-y-2 w-full'>
                      <label className='text-[18px] font-semibold tracking-wider'>
                        Card Number
                      </label>
                      <input
                        className='rounded-[8px] px-[10.5px] text-[12px] tracking-wider w-full bg-[#f8f8f8] h-[41px]'
                        defaultValue='**** **** **** 6567'
                      />
                    </div>
                    <div className='flex flex-col gap-y-2 w-full'>
                      <label className='text-[18px] font-semibold tracking-wider'>
                        Expiration Date
                      </label>
                      <input
                        className='rounded-[8px] px-[10.5px] text-[12px] tracking-wider w-full bg-[#f8f8f8] h-[41px]'
                        defaultValue='11 - 02 - 27'
                      />
                    </div>
                    <div className='flex flex-col gap-y-2 w-full'>
                      <label className='text-[18px] font-semibold tracking-wider'>
                        CVV
                      </label>
                      <input
                        className='rounded-[8px] px-[10.5px] text-[12px] tracking-wider w-full bg-[#f8f8f8] h-[41px]'
                        defaultValue='838'
                      />
                    </div>
                    <div className='flex flex-col gap-y-2 w-full'>
                      <label className='text-[18px] font-semibold tracking-wider mb-3'>
                        Save Details For Future Payments
                      </label>
                      <Switcher4 onChange={handleAutoRenew} checked={checked} />
                    </div>
                  </div>
                </div>

                <div className='flex float-right gap-x-[15.6px] ml-auto'>
                  <button className='w-[124px] rounded-[12px] h-[47px] flex items-center justify-center border border-[#ececed'>
                    <span className='text-[15px] font-semibold'>Cancel</span>
                  </button>
                  <button className='w-[124px] rounded-[12px] h-[47px] flex items-center justify-center bg-black text-white'>
                    <span className='text-[15px] font-semibold'>Save</span>
                  </button>
                </div>
              </form>
            </Modal>
          </section>
        </>
      )}
    </>
  );
};

export default Subscription;
