/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect } from "react";
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Calendar from "@/app/components/dashboard/calendar";
import ChartItem from "@/app/components/dashboard/chartItem";
import LeadItem from "@/app/components/dashboard/leadsItem";
import TableWrapper from "@/app/components/dashboard/tableWrapper";
import Modal from "@/app/components/modal";
import Image from "next/image";
import { useState } from "react";
import { enableScroll } from "@/app/utils/scrollbar";
import {fetchArtists} from "@/app/services/artistService"
import { format } from 'date-fns';
import {fetchLeads} from "@/app/services/leadService"
import {fetchUserSession} from "@/app/services/userService";
import ProfileComponent from "@/app/components/dashboard/profileComponent";
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [linkShareValue, setLinkShareValue] = useState<string>('');
  const [artistsData, setArtistsData] = useState<any>([]);
  const [leadsData, setLeadsData] = useState<any>([]);
  const [meetingData, setMeetingData] = useState<any>([]);
  const [graphData, setGraphData] = useState<any>({
    percentageChangeYear: 0,
    percentageChangeMonth: 0,
    thisYearLeads: 0,
    thisMonthLeads: 0
  });
  const [user, setUser] = useState<any>({});

  const router = useRouter()
  
  const { data: session }: any = useSession()
  
  console.log("🚀 ~ Dashboard ~ session:", session)
  
  async function getAdmins() {
    const [res, err] = await fetchUserSession({});
    if(!err && res) {
      const {name = '', email = '', phone = '', depositPercentage = 0, image = ''} = res || {};
      setUser({name, email, phone, depositPercentage, image});
    }
  }

  async function allArtists () {
    const [artists, leads, graphData] = await Promise.all([
      fetchArtists({searchParams: {page:1, limit: 10}}),
      fetchLeads({searchParams: {page:1, limit: 3}}),
      fetchLeads({searchParams: {graph: "true"}})
    ]);

    const [artistsRes, errAr] = artists
    const [leadsRes, errLeads] = leads
    const [leadsGraph, errGraph] = graphData

    if(!errGraph && leadsGraph) {
      setGraphData(leadsGraph)
      console.log("🚀 ~ allArtists ~ leadsGraph:", leadsGraph)
    }

    if(!errLeads && leadsRes && leadsRes.records) {
      setLeadsData(leadsRes.records);
      const tempMeetingData: any[] = [];
      leadsRes.records.forEach((record: any) => {
        if (record.Booking && Array.isArray(record.Booking)) {
          record.Booking.forEach((booking: any) => {
            const tempMeeting = {
              key: record.id,
              name: record.clientName,
              date: format(new Date(booking.date), "dd MMM, yyyy"),
              image:'/dashboard/avatar-mid.png'
            }
            tempMeetingData.push(tempMeeting);
          })
        }
      })
      setMeetingData(tempMeetingData);
    }
    if(!errAr && artistsRes && artistsRes.records) {
      setArtistsData(artistsRes.records);
    }
  }
  
  const handleLinkClick = (event: any) => {
    event.preventDefault();
    window.open(linkShareValue, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(linkShareValue)
      .then(() => {
        toast('Link copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy link: ', err);
      });
  };

  const onChangeProfilePhoto = (image: File | null) => {
    const tempUser = {...user, image: image};
    setUser(tempUser);
  };

  useEffect(() => {
    allArtists()
    getAdmins()
  },[])

  useEffect(() => {
    if (session?.id) {
      setLinkShareValue(`${window.location.origin}/tattoo-viewer/${session.id}`)
    }
  },[session])

  // const selectedMeetingsData = meetingData.filter((meeting: any) => meeting.date === selectedDay);
  
  return (
    <div className='flex flex-col gap-y-4 p-4 tablet:p-2 tablet:gap-y-2 mobile:p-1 mobile:pb-20'>
      {/* first row */}
      <div className='flex gap-x-4 xl:flex-col items-center xl:items-start xl:gap-y-4 tablet:gap-y-2 w-full'>
        <div
          className='border max-w-[781px] w-full h-[203px] tracking-[-0.02em] shadow-md border-[#ececed]
          rounded-[18px] py-6 px-3 tablet:py-2 bg-white flex font-second
          xl:max-w-full min-w-[712px] laptop:min-w-[600px]
          tablet:min-w-fit '
        >
          {/* profile picture with name & email */}
          <ProfileComponent user={user} session={session} onChangeProfilePhoto={onChangeProfilePhoto} />

          {/* lead endpoint */}
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
                className='h-[32px] min-w-fit text-[12px] gap-x-2 px-3 py-2 flex bg-black text-white rounded-[4px]
                 tablet:px-1 tablet:gap-x-1 tablet:text-[10px] tablet:h-[28px] '
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

        {/* Subscription Status 25 Days Left & leading */}
        <div className='flex items-center gap-x-4 tablet:gap-2 w-full mobile:flex-col'>
          {/* Subscription Status 25 Days Left  */}
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

          {/* booking */}
          {/* <ChartItem
            width='w-full min-w-[346px] max-w-[346px] xl:max-w-full xl:min-w-0'
            height='h-[203px]'
            chartHeight={50}
            chartWidth={153}
            title='Total Sales'
            count='145'
            text='this month'
            chartColor='#7780FE'
            percent='4.5%'
            percentColor='text-[#7780FE]'
          /> */}
        </div>
      </div>

      {/* second row */}
      <div className='flex gap-4 xl:flex-col xl:items-start xl:w-full tablet:gap-2'>
        <div className='flex items-center w-full max-w-[781px] gap-x-4 tablet:gap-2 xl:max-w-full mobile:flex-col'>
          <ChartItem
            width='max-w-[384px] xl:max-w-full'
            height='h-[244px]'
            title='Total Leads'
            count={graphData?.thisYearLeads || 0}
            text='/this year'
            chartColor={(graphData?.percentageChangeMonth || 0) >= 0 ? '#0ed065' : '#f03d3d'}
            chartHeight={73}
            chartWidth={171}
            py='py-10'
            percent={`${graphData?.percentageChangeYear || 0}%`}
            percentColor={(graphData?.percentageChangeYear || 0) >= 0 ? 'text-[#0ed065]' : 'text-[#f03d3d]'}
          />
          <ChartItem
            width='max-w-[384px] xl:max-w-full'
            height='h-[244px]'
            title='New Leads'
            count={graphData?.thisMonthLeads || 0}
            text='/this month'
            chartColor={(graphData?.percentageChangeMonth || 0) >= 0 ? '#77FEB3' : '#FFA9A9'}
            chartHeight={57}
            chartWidth={171}
            py='py-10'
            percent={`${graphData?.percentageChangeMonth || 0}%`}
            percentColor={(graphData?.percentageChangeMonth || 0) >= 0 ? 'text-[#0ed065]' : 'text-[#f03d3d]'}
          />
        </div>

        <TableWrapper width='w-full' height='max-h-[250px]' title='Leads' redirectRoute={"/leads"}>
  <div className='shadow-lg rounded-[10px] overflow-x-auto'>
    <table className='w-full font-second text-[13px]'>
      <thead>
        <tr className='bg-gray-100 text-left'>
          <th className='w-[186px] py-[9px] px-[11px] border-r font-extrabold'>
            Name
          </th>
          <th className='w-[200px] py-[9px] px-[11px] border-r font-extrabold'>
            Contact Details
          </th>
          <th className='w-[168px] py-[9px] px-[11px] border-r font-extrabold'>
            Phone
          </th>
          <th className='w-[144px] min-w-[107px] py-[9px] text-[10px] px-[11px] border-r font-extrabold'>
            Date Onboarded
          </th>
          <th className='w-[117px] py-[9px] pl-6 px-[11px] border-r font-extrabold'>
            Status
          </th>
          <th className='w-[117px] py-[9px] pl-6 px-[11px] border-r font-extrabold'>
            Design
          </th>
        </tr>
      </thead>
      <tbody className='bg-white'>
        {leadsData && leadsData.length > 0 ? leadsData.map((lead: any) => (
          <tr key={lead.id} className='h-[42px]'>
            <td
              title='John Doe'
              className='px-[12px] w-[186px] whitespace-nowrap text-ellipsis truncate font-inter text-[14px] pb-2 border-r border-b h-[42px] border-gray-200'
            >
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
            <td
              title='johndoe@gmail.com'
              className='px-[9px] w-[200px] border-r border-b whitespace-nowrap text-ellipsis truncate'
            >
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
      {lead.tattooCloseups.slice(0, 2).map((url: string, idx: number) => (
        <div key={idx} className="w-10 h-10 rounded-md overflow-hidden">
          <img 
            src={url} 
            alt={`Tattoo closeup ${idx+1}`} 
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
      <img 
        src={lead.confirmed3DModel} 
        alt="Tattoo design" 
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

      {/* third row */}
      <div className='flex items-center gap-4 xl:flex-col xl:items-start tablet:gap-2 '>
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
                {leadsData && leadsData.length > 0 ? leadsData.map((lead: any) => {
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
            {/* <ChartItem
              width='w-[383px]'
              height='h-[177px]'
              title='Bookings'
              percent='4.8%'
              percentColor='text-[#0ed065]'
              count='145'
              text='/this month'
              chartColor='#77FEB3'
              chartHeight={51}
              chartWidth={171}
              py='py-2'
            /> */}
          </div>
        </div>

        <TableWrapper
  title='Artists'
  width='w-full xl:w-full'
  height='max-h-[476px]'
  redirectRoute={"/artists"}
>
  <div className='shadow-lg rounded-[10px] overflow-x-auto'>
    <table className='w-full font-second text-[13px]'>
      <thead className='h-[48px]'>
        <tr className='bg-gray-100 text-left'>
          <th className='w-[122px] p-2 border-r font-extrabold'>
            <div className='flex items-center gap-x-2'>
              <label htmlFor='checkbox1'>Artist ID</label>
            </div>
          </th>
          <th className='min-w-[157px] p-2 border-r font-extrabold'>
            Name
          </th>
          <th className='min-w-[145px] p-2 border-r font-extrabold'>
            Contact Details
          </th>
          <th className='min-w-[111px] p-2 border-r font-extrabold'>
            Phone
          </th>
          <th className='min-w-[102px] p-2 border-r font-extrabold'>
            Date Onboarded
          </th>
        </tr>
      </thead>
      <tbody className='bg-white text-[#777]'>
        {artistsData && artistsData.length > 0 ? artistsData.map((artist: any) => (
          <tr key={artist.id} className='h-[48px]'>
            <td
              title={artist.id}
              className='p-2 w-[122px] border-r border-b border-gray-200'
            >
              <div className='flex items-center gap-x-2'>
                <label htmlFor='checkbox2'>{artist.id}</label>
              </div>
            </td>
            <td
              title={artist.name}
              className='p-2 w-[157px] font-inter text-[14px] border-r border-b border-gray-200'
            >
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

      <Modal
        setShowModal={setShowModal}
        after='visible'
        before='invisible bg-black/75'
        showModal={showModal}
        bg='bg-black/50'
        contentCenter={true}
      >
        <div
          className='bg-white w-[432px] h-fit rounded-[16px] p-6 flex flex-col gap-y-4
         mobile:w-fit mobile:p-2'
        >
          <div className='flex gap-x-3 justify-between items-center'>
            <span className='text-[20px] mobile:text-[16px] tracking-[-0.02em] font-semibold font-second '>
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

          {/* <div
            className='p-6 w-[384px] min-h-[144px] rounded-[12px] mx-auto shadow-md flex flex-col justify-between
           mobile:p-2 mobile:min-h-[100px] mobile:w-full
          '
          >
            <span className='text-[20px] mobile:text-[16px] tracking-[-0.02em] font-semibold font-second mb-4'>
              Booked Lead
            </span>
            {selectedMeetingsData.length !== 0 && selectedMeetingsData.map((data: any, index: number) => (
              <div key={`${index} ${data.date}`} className='flex items-center gap-x-3 my-2'>
                <Image
                  src={data?.image}
                  height={40}
                  width={40}
                  alt='avatar'
                />
                <span className='text-[20px] mobile:text-[16px] font-inter font-bold'>
                  {data.name}
                </span>
                <span className='flex ml-auto gap-x-2'>
                  <Image
                    src='/dashboard/time-blue.svg'
                    alt='time'
                    height={16}
                    width={16}
                  />
                  {data.date}
                </span>
              </div>
            ))}
          </div> */}

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