/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import ReactPaginate from "react-paginate";
import Image from "next/image";
import Modal from "@/app/components/modal";
import { disableScroll, enableScroll } from "@/app/utils/scrollbar";
import { fetchLeads } from "@/app/services/leadService";
import { format } from "date-fns";
import { toast } from "react-toastify";

const InquiriesPage: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [leadsData, setLeadsData] = useState<any>({
    records: [],
    pagination: {}
  });
  const [searchString, setSearchString] = useState<string>("");
  const [selected, setSelected] = useState<string>("Recent");
  const [selectedRow, setSelectedRow] = useState<any>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchAllLeads(orderBy = "desc") {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/queries?search=${encodeURIComponent(searchString)}&page=${currentPage}&perPage=${perPage}&sort=${orderBy}`
      );
      const data = await response.json();
  
      if (data.data) {
        const processedData = data.data.map((item: any) => ({
          ...item,
          query: item.reason === "cancel_subscription" 
            ? item.reason_for_cancel || "Subscription cancellation request"
            : item.query,
          subscriptionStatus: item.subscriptionStatus || "INACTIVE"
        }));
        
        setLeadsData({ 
          records: processedData,
          pagination: {
            total: data.pagination?.total || 0,
            currentPage: currentPage,
            perPage: perPage,
            totalPages: data.pagination?.totalPages || 1
          }
        });
      }
    } catch (error) {
      console.error("Failed to fetch leads:", error);
      toast.error("Failed to fetch leads");
    } finally {
      setIsLoading(false);
    }
  }

  const filteredData = leadsData.records.filter((item: any) => {
    if (!searchString) return true;
    const searchLower = searchString.toLowerCase();
    return (
      item.name?.toLowerCase().includes(searchLower) ||
      item.email?.toLowerCase().includes(searchLower)
    );
  });

  const onPageChange = (e: any) => {
    setCurrentPage(e.selected + 1);
  };

  const handleSort = (item: string) => {
    setCurrentPage(1);
    setSelected(item);
    fetchAllLeads(item === "Recent" ? "desc" : "asc");
  };

  useEffect(() => {
    fetchAllLeads(selected === "Recent" ? "desc" : "asc");
  }, [currentPage, perPage, searchString, selected]);

  const handleRowClick = (item: any) => {
    disableScroll();
    setShowModal(true);
    setSelectedRow(item);
  };

  type InquiryKey =
    | "pricing_inquiry"
    | "billing_issues"
    | "feature_request"
    | "technical_support"
    | "contract_renewal"
    | "general_inquiry"
    | "cancel_subscription";

  function getInquiryText(key: InquiryKey): string {
    const inquiryMap: Record<InquiryKey, string> = {
      pricing_inquiry: "Pricing inquiry",
      billing_issues: "Billing issues",
      feature_request: "Feature request",
      technical_support: "Technical support",
      contract_renewal: "Contract renewal",
      general_inquiry: "General inquiry",
      cancel_subscription: "Cancel subscription"
    };

    return inquiryMap[key];
  }

  const handleApproveCancellation = async () => {
    try {
      if (!selectedRow?.name || !selectedRow?.email) {
        toast.error("No user selected for cancellation");
        return;
      }
  
      const payload = {
        userName: selectedRow.name,
        userEmail: selectedRow.email,
        reason: selectedRow.reason_for_cancel || selectedRow.query || "No reason provided"
      };
  
      const response = await fetch("/api/subscription/approve-cancellation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });
  
      const responseData = await response.json();
  
      if (!response.ok) {
        throw new Error(responseData?.message || "Approval failed");
      }
  
      toast.success(responseData.message);
      setShowModal(false);
      fetchAllLeads();
    } catch (error) {
      console.error("Approval Error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred"
      );
    }
  };

  return (
    <section className='h-[100%] m-4 mobile:pb-20 mobile:m-1'>
      <h1 className='font-semibold text-[26px] leading-[150%] tracking-wide tablet:text-center'>
        Inquiries
      </h1>
      
      {/* Filter & search */}
      <div className='mt-3 flex justify-between laptop:flex-col laptop:gap-y-2 tablet:items-center'>
      <span className='text-[12px] font-semibold leading-[150%] tracking-wide'>
      </span>
        <div className='flex items-center justify-between gap-x-[14px] tablet:flex-col tablet:gap-y-2 tablet:w-full'>
          <div className='relative tablet:w-full'>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setCurrentPage(1);
                fetchAllLeads();
              }}
            >
              <input
                className='h-[43px] w-[280px] py-1 pr-4 pl-[54px] border border-[#dcdcdc] rounded-[8px] focus:outline-none laptop:w-[200px] mobile:w-full'
                                placeholder='Enter Client name or email'
                value={searchString}
                onChange={(e) => setSearchString(e.target.value)}
              />
              <button type='submit'>
                <Image
                  src='/dashboard/search.svg'
                  width={27}
                  height={27}
                  alt='search'
                  className='absolute top-2 left-5 cursor-pointer hover:filter hover:brightness-75'
                />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className='shadow-md rounded-[10px] overflow-x-auto mt-4 '>
        <table className='w-full font-semibold text-[16px]'>
          <thead className='h-[60px]'>
            <tr className='bg-white text-left'>
              <th className='w-[290px] h-[60px] px-7 tracking-wider border-b border-r font-extrabold'>
                Client Name
              </th>
              <th className='w-[304px] h-[60px] px-7 tracking-wider border-b border-r font-extrabold'>
                Client Email
              </th>
              <th className='w-[308px] h-[60px] px-7 tracking-wider border-b border-r font-extrabold'>
                Reason For Contacting
              </th>
              <th className='w-[286px] h-[60px] px-7 tracking-wider border-b border-r font-extrabold'>
                Inquiry
              </th>
            </tr>
          </thead>
          <tbody className='bg-white text-black/75'>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="text-center py-8">
                  Loading...
                </td>
              </tr>
            ) : filteredData.length > 0 ? (
              filteredData.map((item: any) => (
                <tr
                  className="cursor-pointer"
                  key={item.id}
                  onClick={() => handleRowClick(item)}
                >
                  <td className='px-7 w-[290px] min-w-[200px] font-inter border-r border-b border-gray-200 items-center gap-x-2 font-extrabold'>
                    <div className='flex items-center gap-x-5'>
                      <Image
                        src={"/dashboard/avatar1.png"}
                        height={36}
                        width={36}
                        alt='avatar'
                      />
                      {item.name}
                    </div>
                  </td>
                  <td className='max-w-[308px] min-w-[250px] h-[71px] px-7 border-r border-b border-gray-200 truncate text-ellipsis whitespace-nowrap tracking-wider'>
                    {item.email}
                  </td>
                  <td className='max-w-[308px] min-w-[250px] h-[71px] px-7 border-r border-b border-gray-200 truncate text-ellipsis whitespace-nowrap tracking-wider'>
                    {getInquiryText(item.reason)}
                  </td>
                  <td className='max-w-[308px] min-w-[250px] h-[71px] px-7 border-r border-b border-gray-200 truncate text-ellipsis whitespace-nowrap tracking-wider'>
                    {item.query}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-8">
                  No inquiries found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {leadsData.pagination?.totalPages > 1 && (
        <div className='flex items-center justify-between gap-x-3'>
          <div className='overflow-x-auto max-w-[80%]'>
            <ReactPaginate
              breakLabel='...'
              nextLabel={
                <Image
                  width={18}
                  height={18}
                  alt='next'
                  src='/dashboard/prev.svg'
                  className='rotate-180'
                />
              }
              previousLabel={
                <Image
                  width={18}
                  height={18}
                  alt='next'
                  src='/dashboard/prev.svg'
                />
              }
              previousClassName='bg-white h-10 w-10 rounded-[12px] mr-6'
              previousLinkClassName='flex items-center justify-center h-full'
              nextClassName='bg-white h-10 w-10 rounded-[12px] ml-6'
              nextLinkClassName='flex items-center justify-center h-full'
              pageClassName='w-10 h-10'
              pageLinkClassName='px-3 py-2 flex items-center justify-center'
              className='mt-4 h-[40px] flex items-center'
              activeClassName='bg-[#ececed] rounded-[12px] min-h-[40px] min-w-[40px]'
              onPageChange={onPageChange}
              forcePage={currentPage - 1}
              pageRangeDisplayed={5}
              marginPagesDisplayed={2}
              pageCount={leadsData.pagination?.totalPages || 1}
            />
          </div>

          <div className='mt-4 flex items-center gap-x-5 mobile:gap-x-1'>
            <span className='text-[14px] text-[#494656] font-semibold truncate tracking-wider mobile:text-[10px]'>
              Results per page:
            </span>
            <select
              value={perPage}
              onChange={(e) => {
                const newPerPage = Number(e.target.value);
                setPerPage(newPerPage);
                setCurrentPage(1);
              }}
              className='w-[62px] h-10 bg-transparent focus:outline-none'
            >
              {[5, 10, 20, 30].map(value => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal
        before='translate-x-full'
        after='translate-x-0'
        bg='bg-black/50'
        showModal={showModal}
        setShowModal={setShowModal}
        floatRight={true}
        duration='duration-300'
      >
        <div className='h-[calc(100dvh-27px)] w-[435px] bg-white rounded-[16px] m-[17px] p-6 overflow-y-auto mobile:m-0 mobile:w-screen mobile:h-screen'>
          <Image
            src='/arrow-left.svg'
            width={32}
            height={32}
            alt='close'
            className='cursor-pointer hover:-translate-x-1 duration-300'
            title='close modal'
            onClick={() => {
              setShowModal(false);
              enableScroll();
            }}
          />

          <div className='mt-3 h-[113px] rounded-[12px] w-full bg-gradient-to-r from-[#8ED5FF]/50 via-[#BFF9FF]/50 to-[#D255FF]/50'></div>
          <div className='flex relative'>
            <Image
              src='/dashboard/avatar-set.png'
              width={93}
              height={93}
              alt='avatar'
              className='absolute top-[-50px] left-0 right-0 mx-auto'
            />
            <div className='flex flex-col text-black mt-[65px] mx-auto gap-y-1 text-center'>
              <h2 className='font-semibold text-[33px] tracking-wide font-inter'>
                {selectedRow?.name}
              </h2>
              <span className='text-[22px] leading-[100%] tracking-wider'>
                {selectedRow?.email}
              </span>
            </div>
          </div>
          
          <details open className='mt-14'>
            <summary className='cursor-pointer font-semibold'>
              Information
            </summary>
            <div className='mt-[26px] flex flex-col gap-y-[24px]'>
              <div className='flex justify-between'>
                <span className='text-[#9b9b9b] tracking-wider'>Reason:</span>
                <span className='font-semibold'>
                  {selectedRow?.reason && getInquiryText(selectedRow.reason)}
                </span>
              </div>
              
              <div className='flex justify-between'>
                <span className='text-[#9b9b9b] tracking-wider'>Date:</span>
                <span className='font-semibold'>
                  {selectedRow?.createdAt && format(new Date(selectedRow.createdAt), 'MMM dd, yyyy')}
                </span>
              </div>
              
              <div className='flex flex-col gap-y-2'>
                <span className='text-[#9b9b9b] tracking-wider'>Details:</span>
                <p className='font-semibold'>
                  {selectedRow?.query}
                </p>
              </div>
              
              {selectedRow?.subscriptionStatus && (
                <div className='flex justify-between'>
                  <span className='text-[#9b9b9b] tracking-wider'>Subscription Status:</span>
                  <span className='font-semibold'>
                    {selectedRow.subscriptionStatus}
                  </span>
                </div>
              )}
            </div>
          </details>

          {selectedRow?.reason === "cancel_subscription" && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-4">Subscription Cancellation</h3>
              <p className="mb-4 text-gray-600">
                {selectedRow.subscriptionStatus === "ACTIVE"
                  ? "Are you sure you want to cancel your subscription?"
                  : " subscription is not pending and cannot be canceled."}
              </p>
              
              <button
                onClick={handleApproveCancellation}
                className={`w-full py-3 rounded-lg font-bold ${
                  selectedRow.subscriptionStatus === "PENDING"
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-gray-300 cursor-not-allowed text-gray-500"
                }`}
                disabled={selectedRow.subscriptionStatus !== "PENDING"}
              >
                {selectedRow.subscriptionStatus === "PENDING"
                  ? "Confirm Cancellation"
                  : "Subscription Not PENDING"}
              </button>
            </div>
          )}
        </div>
      </Modal>
    </section>
  );
};

export default InquiriesPage;