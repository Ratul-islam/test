/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import ReactPaginate from "react-paginate";
import Image from "next/image";
import Modal from "@/app/components/modal";
import { disableScroll, enableScroll } from "@/app/utils/scrollbar";
import {fetchLeads} from "@/app/services/leadService"
import { format } from 'date-fns';
import ImageModal from "@/app/components/ImageModal";

const Leads: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [leadsData, setLeadsData] = useState<any>({
    records: [],
    pagination: {
      currentPage: 1,
      limit: 10,
      total: 0
    }
  });
  const [searchString, setSearchString] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const [selected, setSelected] = useState<string>("Recent");
  const [selectedRow, setSelectedRow] = useState<any>({});
  const [perPage, setPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  async function allLeads(orderBy = "desc") {
    setLoading(true);
    try {
      const [res, err] = await fetchLeads({searchParams: {page: currentPage, limit: perPage, searchString, orderBy: orderBy}});
      if(!err && res) {
        setLeadsData(res);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  }

  const onPageChange = (e: any) => {
    setCurrentPage(e.selected + 1);
  };

  const handleSort = (item: string) => {
    const orderBy = item === "Recent" ? "desc" : "asc";
    allLeads(orderBy);
    setSelected(item);
  }
  useEffect(() => {
    allLeads("desc"); // Load recent leads first by default
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, perPage]);

  const renderTableData = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={5} className="text-center py-8">Loading...</td>
        </tr>
      );
    }

    if (!leadsData.records || leadsData.records.length === 0) {
      return (
        <tr>
          <td colSpan={5} className="text-center py-8">No leads found</td>
        </tr>
      );
    }

    return leadsData.records.map((item: any) => (
      <tr className="cursor-pointer" key={item.id} onClick={() => {
        disableScroll();
        setShowModal(true);
        setSelectedRow(item)
      }}>
        <td
          title={item.clientName}
          className='px-7 w-[290px] min-w-[200px] font-inter border-r border-b border-gray-200  items-center gap-x-2 font-extrabold cursor-pointer '
        >
          <div className='flex items-center gap-x-5'>
            <Image
              src={"/dashboard/avatar1.png"}
              height={36}
              width={36}
              alt='avatar'
            />{" "}
            {item.clientName}
          </div>
        </td>
        <td
          title='John Doe'
          className='px-7 w-[304px] min-w-[200px] font-inter border-r border-b border-gray-200  items-center gap-x-2 font-extrabold '
        >
          <div className='flex items-center gap-x-5'>
            <Image
              src={"/dashboard/avatar2.png"}
              height={36}
              width={36}
              alt='avatar'
            />{" "}
            {item.artistName}
          </div>
        </td>
        <td
          title={item.email}
          className='max-w-[308px] min-w-[250px] h-[71px] px-7 border-r border-b border-gray-200 truncate text-ellipsis whitespace-nowrap tracking-wider'
        >
          {item.email}
        </td>
        <td className='w-[286px] min-w-[240px] h-[71px] px-7 border-r border-b border-gray-200 tracking-wider'>
          {item.Booking && item.Booking.length > 0 ? 
            format(new Date(item.Booking[0].date), "dd MMM, yyyy - hh:mm a") : 
            "Not scheduled"}
        </td>
        <td className='w-[219px] min-w-[140px] h-[71px] px-7 border-r border-b border-gray-200'>
          <div
            className={`bg-[#02b151]/30 text-[#02b151] h-[24px] flex items-center gap-x-1 w-fit py-1 px-[14px] rounded-[6px] text-[11px] font-second font-semibold
              ${item.deposit === "paid" ? "bg-[#02b151]/30 text-[#02b151]" : null}
              ${item.deposit === "unpaid" ? "bg-[#e06800]/30 text-[#e06800]" : null}
              ${item.deposit === "canceled" ? "bg-[#f03d3d]/30 text-[#f03d3d]" : null}
            `}
          >
            <div className={`h-1 w-1 rounded-[50%] bg-[currentColor]`}></div>
            {item.depositPaid}
          </div>
        </td>
      </tr>
    ));
  };

  console.log(selectedRow);
  return (
    <section className='h-[100%] m-4 mobile:pb-20 mobile:m-1'>
      <h1 className='font-semibold text-[26px] leading-[150%] tracking-wide tablet:text-center'>
        Leads List
      </h1>
      {/* filter & search */}
      <div className='mt-3 flex justify-between laptop:flex-col laptop:gap-y-2 tablet:items-center'>
        <button className='bg-white boreder py-2 px-3 w-[116px] h-[39px] rounded-[9px] flex items-center justify-center gap-x-2 shadow-md tablet:w-full'>
          <Image
            width={19}
            height={19}
            alt='filter'
            src='/dashboard/filter.svg'
          />
          <span className='text-[12px] font-semibold leading-[150%] tracking-wide'>
            Filter
          </span>
        </button>

        <div className='flex items-center justify-between gap-x-[14px] tablet:flex-col tablet:gap-y-2 tablet:w-full'>
          <div className='h-10 w-[183px] bg-[#e7e7e7] rounded-[8px] p-1 flex items-center gap-x-2 justify-between tablet:w-full'>
            {["All Leads", "Recent"].map(item => (
              <div
                key={item}
                onClick={() => handleSort(item)}
                className={`text-[14px] font-bold pt-[6px] px-2 text-center rounded-[4px] h-[32px] w-[85px] cursor-pointer tablet:w-[50%]
                ${item === selected ? "bg-white shadow-md" : ""}
                `}
              >
                {item}
              </div>
            ))}
          </div>
          <div className='relative tablet:w-full'>
            <form
              onSubmit={e => {
                e.preventDefault();
                allLeads();
              }}
            >
              <input
                className='h-[43px] w-[280px] py-1 pr-4 pl-[54px] border border-[#dcdcdc] rounded-[8px] focus:outline-none laptop:w-[200px] mobile:w-full'
                placeholder='Enter Client name or email'
                onChange={(e) => setSearchString(e.target.value)}
                value={searchString}
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
              <th className='w-[304px] h-[60px] px-7  tracking-wider border-b border-r font-extrabold'>
                Artist Booked
              </th>
              <th className='w-[308px] h-[60px] px-7  tracking-wider border-b border-r font-extrabold'>
                Client Email
              </th>
              <th className='w-[286px] h-[60px] px-7  tracking-wider border-b border-r font-extrabold'>
                Booked date
              </th>
              <th className='w-[219px] h-[60px] px-7  tracking-wider border-b  border-r font-extrabold'>
                Deposit
              </th>
            </tr>
          </thead>
          <tbody className='bg-white text-black/75'>
            {renderTableData()}
          </tbody>
        </table>
      </div>

      {/* pagination */}
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
            forcePage={(leadsData?.pagination?.currentPage || 1) - 1}
            pageRangeDisplayed={perPage - 3}
            pageCount={leadsData?.pagination?.total ? Math.ceil(leadsData.pagination.total / leadsData.pagination.limit): 1}
            disabledClassName="opacity-50 cursor-not-allowed"
          />
        </div>

        <div className='mt-4 flex items-center gap-x-5 mobile:gap-x-1'>
          <span className='text-[14px] text-[#494656] font-semibold truncate tracking-wider mobile:text-[10px]'>
            Results per page:
          </span>
          <select
            value={perPage}
            onChange={e => setPerPage(Number(e.target.value))}
            className='w-[62px] h-10 bg-transparent focus:outline-none'
          >
            {[5, 10, 20, 30].map(value => (
              <option
                key={value}
                value={value}
              >
                {value}
              </option>
            ))}
          </select>
        </div>
      </div>

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
                {selectedRow?.clientName || ""}
              </h2>
              <span className='text-[22px] leading-[100%] tracking-wider'>
                {selectedRow?.email || ""}
              </span>
            </div>
          </div>
          <details open className='mt-14'>
            <summary className='cursor-pointer font-semibold'>
              Information
            </summary>
            <div className='mt-[26px] flex flex-col gap-y-[24px]'>
              <div className='flex items-center justify-between gap-x-2'>
                <div className='flex items-center gap-x-2'>
                  <Image
                    src='/dashboard/box.svg'
                    width={20}
                    height={20}
                    alt='box'
                  />
                  <span className='text-black/50 font-semibold pt-1'>ID</span>
                </div>
                <div className='flex items-center gap-x-2'>
                  <span className='font-bold'>{selectedRow?.id || ""}</span>
                </div>
              </div>
              {/*------ Mail------ */}
              <div className='flex items-center justify-between gap-x-2'>
                <div className='flex items-center gap-x-2'>
                  <Image
                    src='/dashboard/mail.svg'
                    width={20}
                    height={20}
                    alt='box'
                  />
                  <span className='text-black/50 font-semibold'>Mail</span>
                </div>
                <span className='font-bold text-[14px] tracking-[0.07em]'>
                  {selectedRow.email}
                </span>
              </div>
              {/*------ Skinton------ */}
              <div className='flex items-center justify-between gap-x-2'>
                <div className='flex items-center gap-x-2'>
                  <Image
                    src='/dashboard/mail.svg'
                    width={20}
                    height={20}
                    alt='box'
                  />
                  <span className='text-black/50 font-semibold'>Skin tone</span>
                </div>
                <span className='font-bold text-[14px] tracking-[0.07em]'>
                  {selectedRow.skinTone}
                </span>
              </div>
              {/*------ Artist Booked------ */}
              <div className='flex items-center justify-between gap-x-2'>
                <div className='flex items-center gap-x-2'>
                  <Image
                    src='/dashboard/box.svg'
                    width={20}
                    height={20}
                    alt='box'
                  />
                  <span className='text-black/50 font-semibold pt-1'>
                    Artist Booked
                  </span>
                </div>
                <div className='flex items-center gap-x-2'>
                  <Image
                    src='/dashboard/avatar1.png'
                    width={20}
                    height={20}
                    alt='artists'
                  />
                  <span className='font-bold'>{selectedRow?.artistName || "FahimHaq"}</span>
                </div>
              </div>
              {/*------ Date & time ------ */}
              <div className='flex items-center justify-between gap-x-2'>
                <div className='flex items-center gap-x-2'>
                  <Image
                    src='/dashboard/time.svg'
                    width={20}
                    height={20}
                    alt='box'
                  />
                  <span className='text-black/50 font-semibold'>
                    Booked Date & Time
                  </span>
                </div>
                <span className='font-bold text-[14px]'>
                  {selectedRow?.Booking && selectedRow.Booking.length > 0 
                    ? format(new Date(selectedRow.Booking[0].date), "dd MMM, yyyy - hh:mm a") 
                    : 'Not scheduled'}
                </span>
              </div>
              {/*------ Price------ */}
              <div className='flex items-center justify-between gap-x-2'>
                <div className='flex items-center gap-x-2'>
                  <Image
                    src='/dashboard/dollar.svg'
                    width={20}
                    height={20}
                    alt='box'
                  />
                  <span className='text-black/50 font-semibold pt-[2px]'>
                    Price
                  </span>
                </div>
                <div className='rounded-[6px] py-2 px-3 h-6 w-[65px]  flex items-center justify-center gap-x-2'>
                  <div className='h-1 w-1 rounded-[50%] '></div>£
                  {selectedRow.priceEstimate}
                </div>
              </div>
              {/*------ Deposit------ */}
              <div className='flex items-center justify-between gap-x-2'>
                <div className='flex items-center gap-x-2'>
                  <Image
                    src='/dashboard/dollar.svg'
                    width={20}
                    height={20}
                    alt='box'
                  />
                  <span className='text-black/50 font-semibold pt-[2px]'>
                    Deposit
                  </span>
                </div>
                <div className='rounded-[6px] py-2 px-3 h-6 w-[65px] bg-[#affad0] flex items-center justify-center gap-x-2'>
                  <div className='h-1 w-1 rounded-[50%] bg-[#02b151]'></div>
                  <span className='font-bold text-[#02b151] text-[11px] pt-[2px]'>
                    {selectedRow?.depositPaid ? "Paid" : "Unpaid"}
                  </span>
                </div>
              </div>
              <div className='flex items-center justify-between gap-x-2'>
                <div className='flex items-center gap-x-2'>
                  <Image
                    src='/dashboard/mail.svg'
                    width={20}
                    height={20}
                    alt='box'
                  />
                  <span className='text-black/50 font-semibold'>Mail</span>
                </div>
                <span className='font-bold text-[14px] tracking-[0.07em]'>
                  {selectedRow?.email || ""}
                </span>
              </div>
            </div>
          </details>

          <details open className='mt-10'>
            <summary className='cursor-pointer font-semibold'>Design</summary>
            
            {selectedRow?.tattooCloseups && selectedRow.tattooCloseups.length > 0 ? (
              <div className="mt-4">
              {/*  <p className="text-sm text-gray-500 mb-2">Full tattoo view:</p>
<div className="flex flex-wrap gap-2">
      {selectedRow.tattooCloseups.map((img: string, idx: number) => (
        <div
          key={idx}
          className="w-24 h-24 border rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => {
            setCurrentImageIndex(idx);
            setShowImageModal(true);
            disableScroll();
          }}
        >
          <Image
            src={img}
            alt={`Tattoo closeup ${idx + 1}`}
            className="w-full h-full object-cover"
            width={96}
            height={96}
          />
        </div>
      ))}
    </div>*/}
                <p className="text-sm text-gray-500 mb-2">Tattoo closeups:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedRow.tattooCloseups.map((url: string, idx: number) => (
                    <div 
                      key={idx} 
                      className="w-24 h-24 border rounded-lg overflow-hidden cursor-pointer"
                      onClick={() => {
                        setCurrentImageIndex(idx + 1); // +1 because full view is at index 0
                        setShowImageModal(true);
                        disableScroll();
                      }}
                    >
                      <Image 
                        src={url} 
                        alt={`Tattoo closeup ${idx+1}`} 
                        className="w-full h-full object-cover"
                        width={100}
                        height={100}
                      />
                    </div>
                  ))}
                                    {selectedRow.Designs.map((url: string, idx: number) => (
                    <div 
                      key={idx} 
                      className="w-24 h-24 border rounded-lg overflow-hidden cursor-pointer"
                      onClick={() => {
                        setCurrentImageIndex(idx + 1); // +1 because full view is at index 0
                        setShowImageModal(true);
                        disableScroll();
                      }}
                    >
                      <Image 
                        src={url} 
                        alt={`Tattoo closeup ${idx+1}`} 
                        className="w-full h-full object-cover"
                        width={100}
                        height={100}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : selectedRow?.confirmed3DModel ? (
              <Image 
                src={selectedRow.confirmed3DModel} 
                alt="Tattoo design" 
                className="mt-4 w-full h-auto rounded-lg border border-gray-200 cursor-pointer" 
                width={100  }
                height={100}
                onClick={() => {
                  setCurrentImageIndex(0);
                  setShowImageModal(true);
                  disableScroll();
                }}
              />
            ) : (
              <Image
                src='/dashboard/3d-small.png'
                width={387}
                height={226}
                alt='design'
                className='mt-4'
              />
            )}
          </details>

          {/* Add image modal to Leads component */}
                  <ImageModal 
          isOpen={showImageModal}
          onClose={() => {
            setShowImageModal(false);
            enableScroll();
          }}
          images={[
            ...(selectedRow?.confirmed3DModel ? [selectedRow.confirmed3DModel] : []),
            ...(selectedRow?.tattooCloseups || []),
            ...(selectedRow?.Designs || [])
          ]}
          currentIndex={currentImageIndex}
          setCurrentIndex={setCurrentImageIndex}
        />
        </div>
      </Modal>
    </section>
  );
};

export default Leads;