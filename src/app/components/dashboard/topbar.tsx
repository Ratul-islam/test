"use client";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { fetchLeads } from "@/app/services/leadService";
import { fetchUserSession } from "@/app/services/userService";
import { CircleHelp } from "lucide-react";
import Modal from "./modal";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";

// Define types for leads and user data
interface Lead {
  id: string;
  clientName: string;
  createdAt: string;
  [key: string]: unknown; // For other properties that might exist
}

interface UserData {
  name: string;
  email: string;
  phone: string;
  depositPercentage: number;
  image: string;
  [key: string]: unknown; // For any additional properties
}

const TopBar = () => {
  const path = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [leadsData, setLeadsData] = useState<Lead[]>([]);
  const [user, setUser] = useState<UserData>({
    name: "",
    email: "",
    phone: "",
    depositPercentage: 0,
    image: ""
  });
  const [modalOpen, setModalOpen] = useState(false);
  const { data: session } = useSession();

  // Initialize with empty values
  const [contactData, setContactData] = useState({
    name: "",
    email: "",
    reason: "general_inquiry",
    query: ""
  });
  
  // Update contactData when session loads OR when modal opens
  useEffect(() => {
    if (session?.user) {
      setContactData(prev => ({
        ...prev,
        name: session.user.name || "",
        email: session.user.email || ""
      }));
    }
  }, [session, modalOpen]);  // Added modalOpen as dependency
  
  async function getAdmins() {
    const [res, err] = await fetchUserSession({});

    if (err || !res) {
      console.warn("No user session found, using default values.");
      setUser({
        name: "",
        email: "",
        phone: "",
        depositPercentage: 0,
        image: ""
      });
      return;
    }

    const { name, email, phone, depositPercentage, image } = res;
    setUser({ name, email, phone, depositPercentage, image });
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to submit contact query");
      }

      toast.success("Your message has been sent successfully!");
      setModalOpen(false);
      
      // Only reset the query field, not name and email
      setContactData(prev => ({ 
        ...prev,
        reason: "general_inquiry", 
        query: "" 
      }));
    } catch (error) {
      console.error("Error submitting contact query:", error);
      toast.error("An error occurred while sending your message");
    }
  };

  // Function to handle opening the modal
  const handleOpenModal = () => {
    // Ensure contact data has name and email from session before opening modal
    if (session?.user) {
      setContactData(prev => ({
        ...prev,
        name: session.user.name || "",
        email: session.user.email || ""
      }));
    }
    setModalOpen(true);
  };

  async function allLeads() {
    const [res, err] = await fetchLeads({
      searchParams: { page: 1, limit: 5 }
    });
  
    if (err || !res || !Array.isArray(res.records)) {
      console.warn("Failed to fetch leads or no records found.");
      setLeadsData([]);
      return;
    }
  
    const latestFive = res.records
      .sort((a: Lead, b: Lead) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    
    setLeadsData(latestFive);
  }

  useEffect(() => {
    allLeads();
    getAdmins();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        event.target instanceof Node &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <section className='h-[96px] py-[24px] px-[20px] mobile:px-2 font-second w-full flex items-center justify-between bg-white border-[1px] border-[#ececed] relative'>
      <h1 className='text-[25px] mobile:text-[18px] tracking-[-0.04em] mt-1 font-extrabold capitalize'>
        {path.replace("/", "")}
      </h1>
      <div className='h-[43px] flex items-center gap-x-[16px] mobile:gap-x-1 relative'>
        <button onClick={handleOpenModal}>
          <CircleHelp size={24} />
        </button>

        <div
          className='relative rounded-[12px] h-[42px] w-[36px] flex items-center justify-center cursor-pointer'
          onClick={() => setIsOpen(!isOpen)}
        >
          <Image
            width={24}
            height={25}
            src='/dashboard/notification.svg'
            alt='notification'
          />

          {isOpen && (
            <div
              ref={notificationRef}
              className='absolute top-12 right-0 w-72 bg-white shadow-lg border border-gray-200 rounded-lg p-3 z-50'
            >
              <h3 className='text-[16px] font-bold text-gray-700'>
                Notifications
              </h3>
              <ul className='mt-2 h-[300px] overflow-x-auto'>
                {leadsData.map((item: Lead) => (
                  <li
                    key={item.id}
                    className='text-gray-600 text-sm p-2 border-b last:border-none hover:bg-gray-100'
                  >
                    {item.clientName} booked! Check the Leads section in the
                    admin panel for details.{" "}
                    {format(new Date(item.createdAt), "dd MMM, yyyy")}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <Link href='/settings'>
          <div className='flex items-center gap-x-[11px] mobile:gap-x-1 mr-1 mt-1 mobile:mr-0 rounded-[39px]'>
            <Image
              src={user?.image || "/dashboard/default.png"}
              height={40}
              width={40}
              alt='avatar'
              className='rounded-full'
            />
            <span className='block text-[20px] font-extrabold'>
              {user.name}
            </span>
          </div>
        </Link>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="relative">
          <button 
            onClick={() => setModalOpen(false)}
            className="absolute top-0 right-0 text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-lg font-bold mb-4">Contact Support</h2>
          <p>Please fill out the form below and we will get back to you soon:</p>
          <form className="mt-4" onSubmit={handleContactSubmit}>
              <input
            type="text"
            placeholder="Your Name"
            className="border border-gray-300 rounded p-2 w-full mb-2 bg-gray-100"
            value={contactData.name}
            readOnly
            required
          />
          <input
            type="email"
            placeholder="Your Email"
            className="border border-gray-300 rounded p-2 w-full mb-2 bg-gray-100"
            value={contactData.email}
            readOnly
            required
          />
            <select
              className="border border-gray-300 rounded p-2 w-full mb-2"
              value={contactData.reason}
              onChange={(e) => setContactData({ ...contactData, reason: e.target.value })}
              required
            >
              <option value="general_inquiry">General Inquiry</option>
              <option value="technical_support">Technical Support</option>
              <option value="billing_issues">Billing Issues</option>
              <option value="feature_request">Feature Request</option>
            </select>
            <textarea
              placeholder="Your Message"
              className="border border-gray-300 rounded p-2 w-full mb-2"
              rows={4}
              value={contactData.query}
              onChange={(e) => setContactData({ ...contactData, query: e.target.value })}
              required
            />
            <button 
              type="submit" 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>
      </Modal>
    </section>
  );
};

export default TopBar;