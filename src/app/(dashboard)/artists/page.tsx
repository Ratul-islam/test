/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import ReactPaginate from "react-paginate";
import Image from "next/image";
import { useEffect, useState } from "react";
import Modal from "@/app/components/modal";
import { disableScroll } from "@/app/utils/scrollbar";
import { fetchArtists, fetchSpecialisations } from "@/app/services/artistService";
import ArtistForm from "@/app/components/forms/ArtistForm";
import { loadStripe } from "@stripe/stripe-js";
import { useSession } from "next-auth/react";

const Artists: React.FC = () => {
  const [detailModal, setDetailModal] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchString, setSearchString] = useState<string>("");
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [perPage, setPerPage] = useState<number>(10);
  const [row, setRow] = useState<any>({});
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [showLimitModal, setShowLimitModal] = useState<boolean>(false);
  const [artistsToAdd, setArtistsToAdd] = useState<number>(1);
  const [maxArtists, setMaxArtists] = useState<number>(0);
  
  // Filter related states
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [filters, setFilters] = useState<{
    specialization: string;
    minRate: string;
    maxRate: string;
  }>({
    specialization: '',
    minRate: '',
    maxRate: ''
  });

  const [artistsData, setArtistsData] = useState<{ records: any[]; pagination: any }>({
    records: [],
    pagination: {}
  });

  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
  );

  const { data: session, status, update } = useSession();

  async function allArtists() {
    // Include filters in search params
    const searchParams: any = { 
      page: currentPage, 
      limit: perPage, 
      searchString 
    };
    
    // Add filter parameters if they exist
    if (filters.specialization) {
      searchParams.specialization = filters.specialization;
    }
    if (filters.minRate) {
      searchParams.minRate = filters.minRate;
    }
    if (filters.maxRate) {
      searchParams.maxRate = filters.maxRate;
    }

    const [res, err] = await fetchArtists({
      searchParams
    });

    if (err || !res || !Array.isArray(res.records)) {
      console.warn("Failed to fetch artists or invalid response structure.");
      setArtistsData({ records: [], pagination: {} });
      return;
    }

    setArtistsData(res);
  }

  async function fetchSpecializationOptions() {
    try {
      const [res, err] = await fetchSpecialisations({});
      if (!err && res && Array.isArray(res)) {
        setSpecializations(res);
      }
    } catch (error) {
      console.error("Error fetching specializations:", error);
    }
  }

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get('artist_addon_success')) {
      update().then(() => {
        setShowMessage(true);
        allArtists();
      });
    }
  }, [update]);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setMaxArtists(session.user.artistsNum || 0);
      allArtists();
      fetchSpecializationOptions();
    }
  }, [currentPage, perPage, searchString, status, session, filters]);

  const onPageChange = (e: any) => {
    setCurrentPage(e.selected + 1);
  };

  const handleEdit = (row: any) => {
    disableScroll();
    setShowModal(true);
    setRow(row);
  };

  const handleDeleteSelected = async () => {
    if (selectedArtists.length === 0) return;

    try {
      setLoading(true);
      await Promise.all(
        selectedArtists.map(artistId =>
          fetch(`/api/artists/${artistId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
          })
        )
      );
      setLoading(false);
      setArtistsData((prev: any) => ({
        ...prev,
        records: prev.records.filter(
          (artist: any) => !selectedArtists.includes(artist.id))
      }));

      setSelectedArtists([]);
      allArtists();
    } catch (error) {
      setLoading(false);
      console.error("Error deleting artists:", error);
    }
  };
  
  const handleAddArtists = async () => {
    if (artistsToAdd <= 0) return;
    setLoading(true);
  
    try {
      const response = await fetch('/api/create-artist-addon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity: artistsToAdd,
          success_url: `${window.location.origin}/dashboard?artist_addon_success=true&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/artists`,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create artist addon');
      }
  
      const { sessionId } = await response.json();
      const stripe = await stripePromise;
  
      if (!stripe) {
        throw new Error("Stripe failed to initialize");
      }
  
      const { error } = await stripe.redirectToCheckout({ sessionId });
  
      if (error) {
        throw error;
      }
    } catch (err) {
      console.error("Error adding artists:", err);
      let errorMessage = "Payment processing failed. Please try again later.";
  
      if (err instanceof Error) {
        errorMessage = err.message.includes('price') 
          ? "Invalid artist addon plan. Please contact support."
          : err.message;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    setSelectedArtists(prevSelected =>
      prevSelected.length === artistsData.records.length
        ? []
        : artistsData.records.map((item: any) => item.id)
    );
  };

  const handleCheckboxChange = (id: string) => {
    setSelectedArtists(
      prevSelected =>
        prevSelected.includes(id)
          ? prevSelected.filter(artistId => artistId !== id)
          : [...prevSelected, id]
    );
  };

  const handleApplyFilters = () => {
    setCurrentPage(1); // Reset to first page when applying filters
    allArtists();
    setShowFilterModal(false);
  };

  const handleResetFilters = () => {
    setFilters({
      specialization: '',
      minRate: '',
      maxRate: ''
    });
    setCurrentPage(1);
    allArtists();
    setShowFilterModal(false);
  };

  useEffect(() => {
    if (showMessage) {
      const timeOut = setTimeout(() => {
        setShowMessage(false);
      }, 5000);

      return () => {
        clearTimeout(timeOut);
      };
    }
  }, [showMessage]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  const data = artistsData.records.map((item: any) => {
    return (
      <tr
        className='cursor-pointer'
        key={item.id}
        onClick={() => {
          disableScroll();
          // setDetailModal(true);
          setRow(item);
        }}
      >
        <td className='w-[100px] h-[71px] px-7 border-r border-b border-gray-200'>
          <div className='flex items-center gap-x-2'>
            <input
              type='checkbox'
              className='w-4 h-4'
              id={item.id}
              checked={selectedArtists.includes(item.id)}
              onChange={(e) => {
                e.stopPropagation();
                handleCheckboxChange(item.id);
              }}
            />
          </div>
        </td>
        <td className='px-7 w-[264px] font-inter border-r border-b border-gray-200 items-center gap-x-2 font-extrabold' 
        onClick={() => {
          disableScroll();
          setDetailModal(true);
          // setRow(item);
        }}>
          <div className='flex items-center gap-x-5'>
            {item.image ? (
              <Image
                src={item.image}
                height={36}
                width={36}
                alt='avatar'
                className='rounded-full'
              />
            ) : (
              <div className='h-9 w-9 flex items-center justify-center rounded-full bg-black text-white font-medium'>
                {item.name?.charAt(0).toUpperCase()}
              </div>
            )}
            {item.name}
          </div>
        </td>
        <td className='px-7 w-[273px] border-r border-b border-gray-200' 
        onClick={() => {
          disableScroll();
          setDetailModal(true);
          // setRow(item);
        }}>
          {item.email}
        </td>
        <td className='w-[199px] h-[71px] px-7 border-r border-b border-gray-200 tracking-wider' 
        onClick={() => {
          disableScroll();
          setDetailModal(true);
          // setRow(item);
        }}>
          {item.phone}
        </td>
        <td className='px-7 w-[169px] font-inter border-r border-b border-gray-200 tracking-wider' onClick={() => {
          disableScroll();
          setDetailModal(true);
          // setRow(item);
        }}>
          {item.rates?.xxl}
        </td>
        <td className='w-[164px] h-[71px] px-7 border-r border-b border-gray-200'>
          <div
            className={`h-[24px] flex items-center gap-x-1 w-fit py-1 px-[14px] rounded-[6px] text-[11px] font-second font-semibold
              ${item.specialization === "portrait" ? "bg-[#09f]/30 text-[#09f]" : "bg-[#4e00e0]/30 text-[#4e00e0]"}
            `}
          >
            <div className={`h-1 w-1 rounded-[50%] bg-[currentColor]`}></div>
            {item.specialization}
          </div>
        </td>
        <td className='px-7 w-[177px] font-inter border-r border-b border-gray-200 items-center justify-center gap-x-2'>
          <Image
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(item);
            }}
            src='/dashboard/edit.svg'
            width={20}
            height={20}
            alt='edit'
            className='mx-auto cursor-pointer'
          />
        </td>
      </tr>
    );
  });

  return (
    <section className='h-[100%] relative m-4 mobile:m-1 mobile:pb-20'>
      <div
        className={`absolute top-[-120px] h-[73px] w-full max-w-[400px] shadow-lg left-0 right-0 mx-auto duration-700 ease-in-out z-50 bg-white
          ${showMessage ? "top-[-60px] opacity-100" : "top-[-120px] opacity-0"}
          `}
        onClick={() => setShowMessage(false)}
      >
        <div className='flex items-start px-6 gap-x-4 py-3 border border-[#2ae77f]'>
          <Image
            src='/dashboard/message.svg'
            width={24}
            height={24}
            alt='message'
          />
          <p className='font-bold tracking-wider'>
            New Artist has been added.
          </p>
          <Image
            className='cursor-pointer'
            src='/dashboard/close-modal.svg'
            width={20}
            height={20}
            alt='close'
          />
        </div>
      </div>

      {/* Filter Modal */}
      <Modal
        showModal={showFilterModal}
        setShowModal={setShowFilterModal}
        bg='bg-black/50'
        contentCenter={true}
      >
        <div className='bg-white w-[432px] rounded-[16px] p-6 flex flex-col gap-y-4 mobile:w-fit mobile:p-4'>
          <div className='flex gap-x-3 justify-between items-center'>
            <span className='text-[20px] mobile:text-[16px] tracking-[-0.02em] font-semibold'>
              Filter Artists
            </span>
            <Image
              src='/dashboard/close-modal.svg'
              height={25}
              width={24}
              alt='close'
              className='hover:scale-125 duration-200 cursor-pointer'
              onClick={() => setShowFilterModal(false)}
            />
          </div>

          <div className='p-4 w-full rounded-[12px] shadow-md flex flex-col gap-y-4'>
            {/* Specialization Filter */}
            <div className='flex flex-col gap-y-2'>
              <label className='font-semibold'>Specialization</label>
              <select 
                value={filters.specialization}
                onChange={(e) => setFilters({...filters, specialization: e.target.value})}
                className='p-2 border rounded-md'
              >
                <option value="">All Specializations</option>
                {specializations.length > 0 ? (
                  specializations.map((spec) => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))
                ) : (
                  <>
                    <option value="portrait">Portrait</option>
                    <option value="abstract">Abstract</option>
                  </>
                )}
              </select>
            </div>

            {/* Rate Range Filter */}
            <div className='flex flex-col gap-y-2'>
              <label className='font-semibold'>Price Range</label>
              <div className='flex gap-x-2'>
                <input 
                  type="number"
                  placeholder="Min"
                  value={filters.minRate}
                  onChange={(e) => setFilters({...filters, minRate: e.target.value})}
                  className='p-2 border rounded-md w-1/2'
                />
                <input 
                  type="number"
                  placeholder="Max"
                  value={filters.maxRate}
                  onChange={(e) => setFilters({...filters, maxRate: e.target.value})}
                  className='p-2 border rounded-md w-1/2'
                />
              </div>
            </div>

            <div className='flex justify-between mt-2'>
              <button
                onClick={handleResetFilters}
                className='px-4 py-2 border border-gray-300 rounded-md'
              >
                Reset
              </button>
              <button
                onClick={handleApplyFilters}
                className='px-4 py-2 bg-black text-white rounded-md'
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        showModal={showLimitModal}
        setShowModal={setShowLimitModal}
        bg='bg-black/50'
        contentCenter={true}
      >
        <div className='bg-white w-[432px] rounded-[16px] p-6 flex flex-col gap-y-4 mobile:w-fit mobile:p-2'>
          <div className='flex gap-x-3 justify-between items-center'>
            <span className='text-[20px] mobile:text-[16px] tracking-[-0.02em] font-semibold'>
              Plan Limit Reached
            </span>
            <Image
              src='/dashboard/close-modal.svg'
              height={25}
              width={24}
              alt='close'
              className='hover:scale-125 duration-200 cursor-pointer'
              onClick={() => setShowLimitModal(false)}
            />
          </div>

          <div className='p-6 w-full rounded-[12px] shadow-md'>
            <p className='text-center mb-4'>
              You have reached your current plan limit of {maxArtists} artists.
            </p>
            
            <div className='flex items-center justify-center gap-x-4 mb-6'>
              <span>Artists to add:</span>
              <div className='flex items-center gap-x-2'>
                <button 
                  onClick={() => setArtistsToAdd(prev => Math.max(1, prev - 1))}
                  className='w-8 h-8 flex items-center justify-center border rounded-md'
                >
                  -
                </button>
                <span className='w-10 text-center'>{artistsToAdd}</span>
                <button 
                  onClick={() => setArtistsToAdd(prev => prev + 1)}
                  className='w-8 h-8 flex items-center justify-center border rounded-md'
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleAddArtists}
              disabled={loading}
              className='w-full py-3 bg-black text-white rounded-md font-semibold disabled:opacity-50'
            >
              {loading ? 'Processing...' : ' Add Artists'}
            </button>
          </div>
        </div>
      </Modal>
      <h1 className='font-semibold text-[26px] leading-[150%] tracking-wide mobile:text-center'>
        Artists List
      </h1>

      <div className='mt-3 flex justify-between tablet:flex-col tablet:gap-y-2 mobile:items-center'>
        <button 
          onClick={() => setShowFilterModal(true)}
          className='bg-white border py-2 px-3 w-[116px] h-[39px] rounded-[9px] flex items-center justify-center gap-x-2 shadow-md mobile:w-full'
        >
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

        <div className='flex items-center justify-between gap-x-[14px] laptop:gap-x-1 tablet:justify-start mobile:flex-col mobile:gap-y-2 mobile:w-full'>
          <span className='text-sm'>
            Artists on Current Plan : {artistsData.records.length}/{maxArtists}
          </span>
          <div className='relative mobile:order-1 mobile:w-full'>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                allArtists();
              }}
            >
              <input
                className='h-[43px] w-[280px] py-1 pr-4 pl-[54px] border border-[#dcdcdc] rounded-[8px] focus:outline-none laptop:w-[200px] mobile:w-full'
                placeholder='Enter artist name email or phone'
                onChange={(e) => setSearchString(e.target.value)}
              />
              <button onClick={allArtists} type='submit'>
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
          <button
            onClick={handleDeleteSelected}
            disabled={loading}
            className='flex items-center justify-center gap-x-2 bg-white h-[39px] px-3 py-2 w-[116px] rounded-[9px] shadow-md mobile:w-full'
          >
            <Image
              width={17}
              height={17}
              src='/dashboard/trash.svg'
              alt='trash'
            />
            <span className='text-[13px] font-bold tracking-wider mt-[2px] leading-[150%]'>
              {loading ? "Deleting..." : "Delete"}
            </span>
          </button>
          <button
            onClick={() => {
              if (artistsData.records.length >= maxArtists) {
                setShowLimitModal(true);
              } else {
                disableScroll();
                setShowModal(true);
                setRow({});
              }
            }}
            className='flex items-center justify-center gap-x-2 bg-black h-[39px] px-3 py-2 w-[116px] rounded-[9px] shadow-md mobile:w-full'
          >
            <Image
              width={17}
              height={17}
              src='/dashboard/plus.svg'
              alt='plus'
            />
            <span className='text-[13px] font-bold tracking-wider mt-[2px] leading-[150%] text-white'>
              {artistsData.records.length < maxArtists ? 'Add Artist' : 'Increase Limit'}
            </span>
          </button>
        </div>
      </div>

      {/* Filter tags/chips to show active filters */}
      {(filters.specialization || filters.minRate || filters.maxRate) && (
        <div className="flex flex-wrap gap-2 mt-3">
          {filters.specialization && (
            <div className="bg-gray-200 rounded-full px-3 py-1 text-sm flex items-center gap-x-2">
              <span>Specialization: {filters.specialization}</span>
              <button 
                onClick={() => setFilters({...filters, specialization: ''})}
                className="text-gray-500 hover:text-black"
              >
                ×
              </button>
            </div>
          )}
          {(filters.minRate || filters.maxRate) && (
            <div className="bg-gray-200 rounded-full px-3 py-1 text-sm flex items-center gap-x-2">
              <span>
                Rate: {filters.minRate ? `Min £${filters.minRate}` : ''}
                {filters.minRate && filters.maxRate ? ' - ' : ''}
                {filters.maxRate ? `Max £${filters.maxRate}` : ''}
              </span>
              <button 
                onClick={() => setFilters({...filters, minRate: '', maxRate: ''})}
                className="text-gray-500 hover:text-black"
              >
                ×
              </button>
            </div>
          )}
          <button 
            onClick={handleResetFilters}
            className="text-sm text-blue-600 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      <div className='shadow-md rounded-[10px] overflow-x-auto mt-4'>
        <table className='w-full font-semibold text-[16px]'>
          <thead className='h-[60px]'>
            <tr className='bg-white text-left'>
              <th className='w-[100px] h-[60px] px-7 border-r border-b flex items-center gap-x-4'>
                <input
                  type='checkbox'
                  className='w-4 h-4'
                  id='selectAll'
                  checked={
                    selectedArtists.length === artistsData.records.length && 
                    artistsData.records.length > 0
                  }
                  onChange={handleSelectAll}
                />
              </th>
              <th className='min-w-[264px] h-[60px] px-7 tracking-wider border-b border-r font-extrabold'>
                Artist Name
              </th>
              <th className='min-w-[273px] h-[60px] px-7 tracking-wider border-b border-r font-extrabold'>
                Email
              </th>
              <th className='min-w-[199px] max-w-[199px] h-[60px] px-9 tracking-wider border-b border-r font-extrabold'>
                Phone
              </th>
              <th className='min-w-[169px] max-w-[169px] h-[60px] px-7 tracking-wider border-b border-r font-extrabold'>
                Rate(10x10cm)
              </th>
              <th className='w-[164px] h-[60px] px-7 tracking-wider border-b border-r font-extrabold'>
                Specialization
              </th>
              <th className='min-w-[82px] w-[177px] h-[60px] text-center tracking-wider border-b border-r font-extrabold'>
                Action
              </th>
            </tr>
          </thead>
          <tbody className='bg-white text-black/75'>{data}</tbody>
        </table>
      </div>

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
            forcePage={(artistsData?.pagination?.currentPage || 1) - 1}
            pageRangeDisplayed={perPage - 3}
            pageCount={
              artistsData?.pagination?.total
                ? Math.ceil(
                    artistsData.pagination.total / artistsData.pagination.limit
                  )
                : 1
            }
          />
        </div>

        <div className='mt-4 flex items-center gap-x-5 mobile:gap-x-1'>
          <span className='text-[14px] text-[#494656] font-semibold tracking-wider truncate mobile:text-[10px]'>
            Results per page:
          </span>
          <select
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
            className='w-[62px] h-10 bg-transparent focus:outline-none'
          >
            {[10, 20, 30].map(value => (
              <option key={value} value={value}>
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
        <ArtistForm
          setShowModal={setShowModal}
          allArtists={allArtists}
          artist={row}
        />
      </Modal>

      <Modal
        before='translate-x-full'
        after='translate-x-0'
        bg='bg-black/50'
        showModal={detailModal}
        setShowModal={setDetailModal}
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
              setDetailModal(false);
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
                {row?.name}
              </h2>
              <span className='text-[22px] leading-[100%] tracking-wider'>
                {row?.email}
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
                  <span className='font-bold'>{row?.id}</span>
                </div>
              </div>
              <div className='flex items-center justify-between gap-x-2'>
                <div className='flex items-center gap-x-2'>
                  <Image
                    src='/dashboard/box.svg'
                    width={20}
                    height={20}
                    alt='box'
                  />
                  <span className='text-black/50 font-semibold pt-1'>
                    Phone
                  </span>
                </div>
                <div className='flex items-center gap-x-2'>
                  <span className='font-bold'>{row?.phone}</span>
                </div>
              </div>
              <div className='flex items-center justify-between gap-x-2'>
                <div className='flex items-center gap-x-2'>
                  <Image
                    src='/dashboard/time.svg'
                    width={20}
                    height={20}
                    alt='box'
                  />
                  <span className='text-black/50 font-semibold'>
                    Hourly Rate
                  </span>
                </div>
                <span className='font-bold text-[14px]'>{row?.hourlyRate}</span>
              </div>
              <div className='flex items-center justify-between gap-x-2'>
                <div className='flex items-center gap-x-2'>
                  <Image
                    src='/dashboard/time.svg'
                    width={20}
                    height={20}
                    alt='box'
                  />
                  <span className='text-black/50 font-semibold'>
                    Tiny tattoo: 1-5cm
                  </span>
                </div>
                <span className='font-bold text-[14px]'>
                  {row?.rates?.tiny || ""}
                </span>
              </div>
              <div className='flex items-center justify-between gap-x-2'>
                <div className='flex items-center gap-x-2'>
                  <Image
                    src='/dashboard/time.svg'
                    width={20}
                    height={20}
                    alt='box'
                  />
                  <span className='text-black/50 font-semibold'>
                    Small tattoo: 5-10cm
                  </span>
                </div>
                <span className='font-bold text-[14px]'>
                  {row?.rates?.small || ""}
                </span>
              </div>
              <div className='flex items-center justify-between gap-x-2'>
                <div className='flex items-center gap-x-2'>
                  <Image
                    src='/dashboard/time.svg'
                    width={20}
                    height={20}
                    alt='box'
                  />
                  <span className='text-black/50 font-semibold'>
                    Medium tattoo: 10-15cm
                  </span>
                </div>
                <span className='font-bold text-[14px]'>
                  {row?.rates?.medium || ""}
                </span>
              </div>
              <div className='flex items-center justify-between gap-x-2'>
                <div className='flex items-center gap-x-2'>
                  <Image
                    src='/dashboard/time.svg'
                    width={20}
                    height={20}
                    alt='box'
                  />
                  <span className='text-black/50 font-semibold'>
                    Large tattoo: 15-20cm
                  </span>
                </div>
                <span className='font-bold text-[14px]'>
                  {row?.rates?.large || ""}
                </span>
              </div>
              <div className='flex items-center justify-between gap-x-2'>
                <div className='flex items-center gap-x-2'>
                  <Image
                    src='/dashboard/time.svg'
                    width={20}
                    height={20}
                    alt='box'
                  />
                  <span className='text-black/50 font-semibold'>xl Rate</span>
                </div>
                <span className='font-bold text-[14px]'>
                  {row?.rates?.xl || ""}
                </span>
              </div>
              <div className='flex items-center justify-between gap-x-2'>
                <div className='flex items-center gap-x-2'>
                  <Image
                    src='/dashboard/time.svg'
                    width={20}
                    height={20}
                    alt='box'
                  />
                  <span className='text-black/50 font-semibold'>xxl Rate</span>
                </div>
                <span className='font-bold text-[14px]'>
                  {row?.rates?.xxl || ""}
                </span>
              </div>
            </div>
          </details>
        </div>
      </Modal>
    </section>
  );
};

export default Artists;