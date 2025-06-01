"use client";
import { useEffect } from "react";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Calendar from "@/app/components/dashboard/calendar";
import ChartItem from "@/app/components/dashboard/chartItem";
import LeadItem from "@/app/components/dashboard/leadsItem";
import TableWrapper from "@/app/components/dashboard/tableWrapper";
import Modal from "@/app/components/modal";
import Image from "next/image";
import { useState } from "react";
import { enableScroll } from "@/app/utils/scrollbar";
import {fetchArtists} from "@/app/services/artistService";
import { format } from 'date-fns';
import {fetchLeads} from "@/app/services/leadService";
import {fetchUserSession, updateAdminProfile} from "@/app/services/userService";
import ProfileComponent from "@/app/components/dashboard/profileComponent";
import { toast } from 'react-toastify';
import { fetchRevenueData } from "@/app/services/revenueService";

interface Artist {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

interface Booking {
  date: string;
}

interface Lead {
  id: string;
  clientName: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
  Booking?: Booking[];
  tattooCloseups?: string[];
  confirmed3DModel?: string;
  amount?: number;
}

interface Meeting {
  key: string;
  name: string;
  date: string;
  image: string;
}

interface GraphData {
  percentageChangeYear: number;
  percentageChangeMonth: number;
  thisYearLeads: number;
  thisMonthLeads: number;
}

interface User {
  name: string;
  email: string;
  phone: string;
  depositPercentage: number;
  image: string;
}

interface RevenueData {
  weeklySales: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  weeklySalesChange: number;
  monthlyRevenueChange: number;
}

const Dashboard = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [linkShareValue, setLinkShareValue] = useState<string>('');
  const [artistsData, setArtistsData] = useState<Artist[]>([]);
  const [leadsData, setLeadsData] = useState<Lead[]>([]);
  const [meetingData, setMeetingData] = useState<Meeting[]>([]);
  const [graphData, setGraphData] = useState<GraphData>({
    percentageChangeYear: 0,
    percentageChangeMonth: 0,
    thisYearLeads: 0,
    thisMonthLeads: 0
  });
  const [user, setUser] = useState<User>({
    name: '',
    email: '',
    phone: '',
    depositPercentage: 0,
    image: ''
  });
  const [revenueData, setRevenueData] = useState<RevenueData>({
    weeklySales: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    weeklySalesChange: 0,
    monthlyRevenueChange: 0
  });

  const router = useRouter();
  const { data: session } = useSession();

  async function getAdmins() {
    const [res, err] = await fetchUserSession({});
    if(!err && res) {
      const {name = '', email = '', phone = '', depositPercentage = 0, image = ''} = res;
      setUser({name, email, phone, depositPercentage, image});
    }
  }

  async function allArtists() {
    try {
      const [artists, leads, graphData, revenueRes] = await Promise.all([
        fetchArtists({searchParams: {page:1, limit: 10}}),
        fetchLeads({searchParams: {page:1, limit: 3}}),
        fetchLeads({searchParams: {graph: "true"}}),
        fetchRevenueData()
      ]);

      const [artistsRes, errAr] = artists;
      const [leadsRes, errLeads] = leads;
      const [leadsGraph, errGraph] = graphData;
      const [revenueData, errRevenue] = revenueRes;

      if(!errRevenue && revenueData) {
        setRevenueData(revenueData);
      }

      if(!errGraph && leadsGraph) {
        setGraphData(leadsGraph);
      }

      if(!errLeads && leadsRes?.records) {
        setLeadsData(leadsRes.records);
        const tempMeetingData: Meeting[] = [];
        leadsRes.records.forEach((record: Lead) => {
          if (record.Booking && Array.isArray(record.Booking)) {
            record.Booking.forEach((booking: Booking) => {
              const tempMeeting: Meeting = {
                key: record.id,
                name: record.clientName,
                date: format(new Date(booking.date), "dd MMM, yyyy"),
                image: '/dashboard/avatar-mid.png'
              };
              tempMeetingData.push(tempMeeting);
            });
          }
        });
        setMeetingData(tempMeetingData);
      }
      if(!errAr && artistsRes?.records) {
        setArtistsData(artistsRes.records);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  }
  
  const handleLinkClick = (event: React.MouseEvent) => {
    event.preventDefault();
    window.open(linkShareValue, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(linkShareValue)
      .then(() => {
        toast.success('Link copied to clipboard!');
      })
      .catch((err) => {
        toast.error('Failed to copy link');
        console.error('Failed to copy link: ', err);
      });
  };

 const onChangeProfilePhoto = async (file: File | null, previewUrl: string | null) => {
  if (!session || !session.user) {
    toast.error("Session not available");
    return;
  }

  try {
    // Update UI immediately for better UX
    setUser(prevUser => ({
      ...prevUser,
      image: previewUrl || "/dashboard/default.png"
    }));

    // If there's a file, upload it
    if (file) {
      const formData = new FormData();
      formData.append("adminId", session.user.id);
      formData.append("name", user.name);
      formData.append("phone", user.phone);
      formData.append("depositPercentage", user.depositPercentage.toString());
      
      // Make sure we're appending the actual File object, not a data URL
      formData.append("image", file);  // This should be the File object

      const [suc, err] = await updateAdminProfile({ body: formData });
      
      if (err) {
        // Revert UI change if upload failed
        setUser(prevUser => ({
          ...prevUser,
          image: user.image // revert to original image
        }));
        toast.error("Failed to update profile photo");
        console.error("Upload error:", err);
      } else {
        // Refresh user data to get the updated image URL from server
        console.log(suc)
        await getAdmins();
        toast.success("Profile photo updated successfully!");
      }
    }
  } catch (error) {
    // Revert UI change if upload failed
    setUser(prevUser => ({
      ...prevUser,
      image: user.image // revert to original image
    }));
    toast.error("Failed to update profile photo");
    console.error("Error updating profile photo:", error);
  }
};
  useEffect(() => {
    allArtists();
    getAdmins();
  }, []);

  useEffect(() => {
    if (session?.user.id) {
      setLinkShareValue(`${window.location.origin}/tattoo-viewer/${session.user.id}`);
    }
  }, [session]);

  // const selectedMeetingsData = meetingData.filter((meeting) => meeting.date === selectedDay);
  
  return (
    <div className='flex flex-col gap-y-4 p-4 tablet:p-2 tablet:gap-y-2 mobile:p-1 mobile:pb-20'>

      {/* Profile and Subscription Row */}
      <div className='flex gap-x-4 xl:flex-col items-center xl:items-start xl:gap-y-4 tablet:gap-y-2 w-full'>
        <div className='border max-w-[781px] w-full h-[203px] tracking-[-0.02em] shadow-md border-[#ececed] rounded-[18px] py-6 px-3 tablet:py-2 bg-white flex font-second xl:max-w-full min-w-[712px] laptop:min-w-[600px] tablet:min-w-fit'>
          <ProfileComponent user={user} session={session} onChangeProfilePhoto={onChangeProfilePhoto} />

          <div className='pl-[31px] max-w-[425px] w-full xl:max-w-full flex flex-col justify-between tablet:pl-2'>
            <div>
              <span className='text-[24px] tablet:text-[18px] font-bold'>
                Lead endpoint
              </span>
              <p className='mt-2 font-extrabold text-[#9b9b9b] tablet:text-[14px]'>
                Share your endpoint to potential leads.
              </p>
            </div>

            <div className='p-2 h-[48px] rounded-[8px] mb-1 bg-[#f0f1f2] w-full flex gap-x-2 justify-between tablet:h-10 mobile:items-center mobile:p-1'>
              <div className='cursor-pointer flex items-center w-full gap-x-4 tablet:gap-x-1 mobile:mt-1'>
                <Image
                  src='/dashboard/share.svg'
                  height={24}
                  width={24}
                  alt='share'
                  className='tablet:w-4 tablet:h-4'
                  onClick={handleCopyLink}
                />
                <input
                  value={linkShareValue}
                  readOnly
                  className='bg-transparent focus:outline-none w-full text-[12px] laptop:text-[10px] tablet:text-[8px] text-[#6d6d6d] py-4 pr-6 laptop:pr-2 tablet:pr-0'
                />
              </div>
              <button
                disabled={!linkShareValue}
                onClick={handleLinkClick}
                className='h-[32px] min-w-fit text-[12px] gap-x-2 px-3 py-2 flex bg-black text-white rounded-[4px] tablet:px-1 tablet:gap-x-1 tablet:text-[10px] tablet:h-[28px]'
              >
                <span className='mobile:hidden'>Open</span>
                <Image
                  src='/dashboard/telegram.svg'
                  height={16}
                  width={16}
                  alt='send'
                  className='mobile:h-3 mobile:w-3'
                />
              </button>
            </div>
          </div>
        </div>

        <div className='flex items-center gap-x-4 tablet:gap-2 w-full mobile:flex-col'>
          <div className='flex gap-x-4 bg-white p-6 max-w-full w-full shadow-md h-[203px] rounded-[12px]'>
            <div className='tracking-[-0.02em] flex flex-col justify-between max-w-fit'>
              <div className='flex flex-col gap-y-2'>
                <span className='text-[24px] tablet:text-[18px] block tracking-wider font-bold'>
                  Subscription Status
                </span>
                <div className='flex gap-x-3 tablet:gap-x-2'>
                  <Image
                    src='/dashboard/time.svg'
                    height={20}
                    width={20}
                    alt='time'
                  />
                  <span className='font-extrabold text-[#9b9b9b] block'>
                    25 Days Left
                  </span>
                </div>
              </div>

              <button onClick={() => router.push("/subscription")} className='py-3 px-4 h-[48px] w-[128px] tablet:w-fit font-bold text-[#100c20] roundede-[8px] border-[#ececed] border-[1px] shadow-md'>
                See More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rest of the component remains the same... */}
      {/* Leads Stats Row */}
      <div className='flex gap-4 xl:flex-col xl:items-start tablet:gap-2'>
        <div className='flex items-center w-full max-w-[781px] gap-x-4 tablet:gap-2 xl:max-w-full mobile:flex-col'>
          <ChartItem
            width='max-w-[384px] xl:max-w-full'
            height='h-[244px]'
            title='Total Leads'
            count={String(graphData.thisYearLeads)}
            text='/this year'
            chartColor={graphData.percentageChangeMonth >= 0 ? '#0ed065' : '#f03d3d'}
            chartHeight={73}
            chartWidth={171}
            py='py-10'
            percent={`${graphData.percentageChangeYear}%`}
            percentColor={graphData.percentageChangeYear >= 0 ? 'text-[#0ed065]' : 'text-[#f03d3d]'}
          />
          <ChartItem
            width='max-w-[384px] xl:max-w-full'
            height='h-[244px]'
            title='New Leads'
            count={String(graphData.thisMonthLeads)}
            text='/this month'
            chartColor={graphData.percentageChangeMonth >= 0 ? '#77FEB3' : '#FFA9A9'}
            chartHeight={57}
            chartWidth={171}
            py='py-10'
            percent={`${graphData.percentageChangeMonth}%`}
            percentColor={graphData.percentageChangeMonth >= 0 ? 'text-[#0ed065]' : 'text-[#f03d3d]'}
          />
        </div>
        <div className='flex w-full flex-col min-w-[320px] h-[250px] tablet:gap-y-2'>
          <TableWrapper width='w-full' height='max-h-[250px]' title='Leads' redirectRoute="/leads">
            <div className='shadow-lg rounded-[10px] h-[150px] overflow-x-auto'>
              <table className='w-full font-second text-[13px]'>
                <thead>
                  <tr className='bg-gray-100 text-left'>
                    <th className='w-[186px] py-[9px] px-[11px] border-r font-extrabold'>Name</th>
                    <th className='w-[200px] py-[9px] px-[11px] border-r font-extrabold'>Contact Details</th>
                    <th className='w-[168px] py-[9px] px-[11px] border-r font-extrabold'>Phone</th>
                    <th className='w-[144px] min-w-[107px] py-[9px] text-[10px] px-[11px] border-r font-extrabold'>Date Onboarded</th>
                    <th className='w-[117px] py-[9px] pl-6 px-[11px] border-r font-extrabold'>Status</th>
                    <th className='w-[117px] py-[9px] pl-6 px-[11px] border-r font-extrabold'>Design</th>
                  </tr>
                </thead>
                <tbody className='bg-white'>
                  {leadsData.length > 0 ? leadsData.map((lead) => (
                    <tr key={lead.id} className='h-[42px]'>
                      <td className='px-[12px] w-[186px] whitespace-nowrap text-ellipsis truncate font-inter text-[14px] pb-2 border-r border-b h-[42px] border-gray-200'>
                        <div className='flex items-center gap-x-3'>
                          <Image
                            src='/dashboard/avatar1.png'
                            height={28}
                            width={28}
                            alt='avatar'
                          />
                          {lead.clientName}
                        </div>
                      </td>
                      <td className='px-[9px] w-[200px] border-r border-b whitespace-nowrap text-ellipsis truncate'>
                        {lead.email}
                      </td>
                      <td className='px-[9px] w-[168px] border-r border-b border-gray-200'>
                        {lead.phone}
                      </td>
                      <td className='px-[9px] w-[144px] border-r border-b border-gray-200'>
                        {format(new Date(lead.createdAt), "dd MMM, yyyy")}
                      </td>
                      <td className='px-[9px] pl-6 w-[127px] border-r border-b border-gray-200'>
                        <div className='w-fit h-[24px] font-bold text-[#058f43] rounded-[6px] py-2 px-3 bg-[#affad0] flex items-center gap-x-2'>
                          <div className='h-1 w-1 bg-[#02b151]'></div>
                          {lead.status}
                        </div>
                      </td>
                      <td className='px-[9px] w-[117px] border-r border-b border-gray-200'>
                        {lead.tattooCloseups && lead.tattooCloseups.length > 0 ? (
                          <div className="flex gap-1">
                            {lead.tattooCloseups.slice(0, 2).map((url, idx) => (
                              <div key={idx} className="w-10 h-10 rounded-md overflow-hidden">
                                <Image 
                                  src={url} 
                                  alt={`Tattoo closeup ${idx+1}`} 
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                            {lead.tattooCloseups.length > 2 && (
                              <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center text-xs font-bold">
                                +{lead.tattooCloseups.length - 2}
                              </div>
                            )}
                          </div>
                        ) : lead.confirmed3DModel ? (
                          <div className="w-10 h-10 rounded-md overflow-hidden">
                            <Image 
                              src={lead.confirmed3DModel} 
                              alt="Tattoo design" 
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <span className="text-gray-400">No design</span>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-gray-500">No leads available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TableWrapper>
        </div>
      </div>
      {/* Revenue Stats Row */}
      <div className="flex gap-4 xl:flex-col xl:items-start tablet:gap-2">
        <ChartItem
          width='max-w-[525px] xl:max-w-full'
          height='h-[244px]'
          title='Sales This Week'
          count={`$${revenueData.weeklySales.toLocaleString()}`}
          text='Total revenue'
          chartColor={revenueData.weeklySalesChange >= 0 ? '#0ed065' : '#f03d3d'}
          chartHeight={73}
          chartWidth={171}
          py='py-10'
          percent={`${revenueData.weeklySalesChange}%`}
          percentColor={revenueData.weeklySalesChange >= 0 ? 'text-[#0ed065]' : 'text-[#f03d3d]'}
        />
        <ChartItem
          width='max-w-[525px] xl:max-w-full'
          height='h-[244px]'
          title='Monthly Revenue'
          count={`$${revenueData.monthlyRevenue.toLocaleString()}`}
          text='Total this month'
          chartColor={revenueData.monthlyRevenueChange >= 0 ? '#77FEB3' : '#FFA9A9'}
          chartHeight={57}
          chartWidth={171}
          py='py-10'
          percent={`${revenueData.monthlyRevenueChange}%`}
          percentColor={revenueData.monthlyRevenueChange >= 0 ? 'text-[#0ed065]' : 'text-[#f03d3d]'}
        />
        <ChartItem
          width='max-w-[525px] xl:max-w-full'
          height='h-[244px]'
          title='Yearly Revenue'
          count={`$${revenueData.yearlyRevenue.toLocaleString()}`}
          text='Total this year'
          chartColor='#77FEB3'
          chartHeight={57}
          chartWidth={171}
          py='py-10'
          percent=""
          percentColor="text-transparent"
        />
      </div>
      {/* Calendar and Artists Row */}
      <div className='flex items-center gap-4 xl:flex-col xl:items-start tablet:gap-2'>
        <div className='flex gap-4 tablet:gap-2 items-center w-full max-w-[781px] xl:max-w-full tablet:flex-col'>
          <div className='bg-white max-w-[384px] xl:max-w-full w-full min-w-[270px] p-6 shadow-md rounded-[12px] h-[476px]'>
            <Calendar
              meetings={meetingData}
              selectedDay={selectedDay}
              setShowModal={setShowModal}
              setSelectedDay={setSelectedDay}
            />
          </div>

          <div className='flex w-full flex-col min-w-[320px] h-[476px] gap-y-4 tablet:gap-y-2'>
            <TableWrapper
              title='Upcoming leads'
              width='w-full xl:max-w-full'
              height='h-[283px]'
              tracking='tracking-wide'
              redirectRoute="/leads"
            >
              <div className='flex flex-col gap-y-[28px] mt-[28px]'>
                {leadsData.length > 0 ? leadsData.map((lead) => {
                  if (lead.Booking && lead.Booking.length > 0) {
                    return (
                      <LeadItem
                        key={lead.id}
                        name={lead.clientName}
                        date={format(new Date(lead.Booking[0].date), "dd MMM, yyyy")}
                        image='/dashboard/avatar-mid.png'
                      />
                    );
                  }
                  return null;
                }) : (
                  <div className="text-center text-gray-500 py-4">No upcoming leads</div>
                )}
              </div>
            </TableWrapper>
          </div>
        </div>
        <div className='flex w-full flex-col min-w-[320px] h-[476px] gap-y-4 tablet:gap-y-2'>
          <TableWrapper title='Artists' width='w-full xl:max-w-full' height='h-[550px]' redirectRoute="/artists">
            <div className='shadow-lg rounded-[10px] h-[400px] overflow-x-auto'>
              <table className='w-full font-second text-[13px] h-full'>
                <thead className='h-[48px]'>
                  <tr className='bg-gray-100 text-left'>
                    <th className='w-[122px] p-2 border-r font-extrabold'>
                      <div className='flex items-center gap-x-2'>
                        <label htmlFor='checkbox1'>Artist ID</label>
                      </div>
                    </th>
                    <th className='min-w-[157px] p-2 border-r font-extrabold'>Name</th>
                    <th className='min-w-[145px] p-2 border-r font-extrabold'>Contact Details</th>
                    <th className='min-w-[111px] p-2 border-r font-extrabold'>Phone</th>
                    <th className='min-w-[102px] p-2 border-r font-extrabold'>Date Onboarded</th>
                  </tr>
                </thead>
                <tbody className='bg-white text-[#777]'>
                  {artistsData.length > 0 ? artistsData.map((artist) => (
                    <tr key={artist.id} className='h-[48px]'>
                      <td className='p-2 w-[122px] border-r border-b border-gray-200'>
                        <div className='flex items-center gap-x-2'>
                          <label htmlFor='checkbox2'>{artist.id}</label>
                        </div>
                      </td>
                      <td className='p-2 w-[157px] font-inter text-[14px] border-r border-b border-gray-200'>
                        <div className='flex items-center gap-x-2'>
                          <Image
                            src='/dashboard/avatar1.png'
                            height={28}
                            width={28}
                            alt='avatar'
                          />
                          {artist.name}
                        </div>
                      </td>
                      <td className='p-2 w-[145px] border-r border-b border-gray-200'>
                        {artist.email}
                      </td>
                      <td className='p-2 w-[111px] border-r border-b border-gray-200'>
                        {artist.phone}
                      </td>
                      <td className='p-2 w-[102px] border-r border-b border-gray-200'>
                        {format(new Date(artist.createdAt), "dd MMM, yyyy")}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-gray-500">No artists available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TableWrapper>
        </div>
      </div>

      <Modal
        setShowModal={setShowModal}
        after='visible'
        before='invisible bg-black/75'
        showModal={showModal}
        bg='bg-black/50'
        contentCenter={true}
      >
        <div className='bg-white w-[432px] h-fit rounded-[16px] p-6 flex flex-col gap-y-4 mobile:w-fit mobile:p-2'>
          <div className='flex gap-x-3 justify-between items-center'>
            <span className='text-[20px] mobile:text-[16px] tracking-[-0.02em] font-semibold font-second'>
              Booking Details
            </span>
            <Image
              src='/dashboard/close-modal.svg'
              height={25}
              width={24}
              alt='close'
              className='hover:scale-125 duration-200 cursor-pointer mobile:mr-1 mobile:pt-1'
              onClick={() => {
                enableScroll();
                setShowModal(false);
              }}
            />
          </div>

          <div className='p-6 mobile:p-2 rounded-[12px] h-[380px] shadow-md'>
            <Calendar
              meetings={meetingData}
              selectedDay={selectedDay}
              setSelectedDay={setSelectedDay}
              setShowModal={setShowModal}
              calendarIsInOpenModal={true}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;