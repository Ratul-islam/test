/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Dispatch, SetStateAction, useState } from "react";
import { Info, DateTime, Interval } from "luxon";
import Image from "next/image";
import { disableScroll } from "@/app/utils/scrollbar";
import { format } from "date-fns";

interface props {
  meetings?: any[];
  selectedDay?: string;
  calendarIsInOpenModal?: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  setSelectedDay: Dispatch<SetStateAction<string>>;
}

const Calendar: React.FC<props> = ({
  meetings,
  selectedDay,
  setShowModal,
  setSelectedDay,
  calendarIsInOpenModal = false
}) => {
  const meetingDateArray = meetings?.map((meeting: any) => meeting.date);
  const today = DateTime.local();
  const [active, setActive] = useState<DateTime | null>(null);
  const [firstDayOfActiveMonth, setFirstDayOfActiveMonth] = useState(
    today.startOf("month")
  );

  const weekDays = Info.weekdays("short");
  const daysOfMonth = Interval.fromDateTimes(
    firstDayOfActiveMonth.startOf("week"),
    firstDayOfActiveMonth.endOf("month").endOf("week")
  )
    .splitBy({ day: 1 })
    .map(day => day.start);
  const goToPreviousMonth = () => {
    setFirstDayOfActiveMonth(firstDayOfActiveMonth.minus({ month: 1 }));
  };
  const goToNextMonth = () => {
    setFirstDayOfActiveMonth(firstDayOfActiveMonth.plus({ month: 1 }));
  };

  const todayDate = selectedDay || (active ? format(new Date(active.toJSDate()), "dd MMM, yyyy") : "");

  return (
    <div>
      <div>
        <div className='flex flex-col gap-y-10'>
          {!calendarIsInOpenModal ? (
            <span className='font-bold font-second text-[18px] block tracking-tighter'>
              Upcoming Bookings{" "}
            </span>
          ) : null}
          <div className='flex items-center justify-between gap-x-5'>
            <div
              onClick={() => goToPreviousMonth()}
              className='h-10 w-[42px] bg-[#f3f3f4] flex items-center justify-center rounded-[12px] cursor-pointer hover:bg-black/10 duration-300'
            >
              <Image
                src='/dashboard/prev.svg'
                height={18}
                width={18}
                alt='prev'
              />
            </div>
            <div className='font-inter font-bold text-[18px]'>
              {firstDayOfActiveMonth.monthShort}, {firstDayOfActiveMonth.year}
            </div>

            <div
              onClick={() => goToNextMonth()}
              className='h-10 w-[42px] bg-[#f3f3f4] flex items-center justify-center rounded-[12px] cursor-pointer hover:bg-black/10 duration-300'
            >
              <Image
                src='/dashboard/next.svg'
                height={18}
                width={18}
                alt='prev'
              />
            </div>
          </div>
        </div>

        {/* weeks */}
        <div
          className={`grid grid-cols-7 ${calendarIsInOpenModal ? "mt-4" : "mt-10"}`}
        >
          {weekDays.map((weekDay, weekDayIndex) => (
            <div
              key={weekDayIndex}
              className='h-10 w-12 py-2 px-3 font-second text-[#b3b1b8]'
            >
              {weekDay}
            </div>
          ))}
        </div>
        <div className='grid grid-cols-7 mt-3'>
          {daysOfMonth.map((dayOfMonth, dayOfMonthIndex) => {
            const haveMettingInThisDay = meetingDateArray?.includes(
              format(new Date(dayOfMonth?.toJSDate() || new Date()), "dd MMM, yyyy") || ""
            );
            return (
              <div
                key={dayOfMonthIndex}
                onClick={() => {
                  setActive(dayOfMonth);
                  if (
                    !calendarIsInOpenModal &&
                    haveMettingInThisDay &&
                    dayOfMonth
                  ) {
                    setSelectedDay(format(new Date(dayOfMonth?.toJSDate() || new Date()), "dd MMM, yyyy"));
                    disableScroll();
                    setShowModal(true);
                  }

                  if (
                    calendarIsInOpenModal &&
                    haveMettingInThisDay &&
                    dayOfMonth
                  ) {
                    setSelectedDay(format(new Date(dayOfMonth?.toJSDate() || new Date()), "dd MMM, yyyy"));
                  }
                }}
                className={`h-10 w-12 py-2 px-3 font-second text-center rounded-[12px] duration-150
                ${
                  dayOfMonth?.month === firstDayOfActiveMonth.month
                    ? "text-black cursor-pointer hover:bg-black/10"
                    : "text-[#b3b1b8]"
                }
                ${haveMettingInThisDay ? "bg-[#c5e5ff] hover:bg-[#c5e5ff]" : ""}
                ${todayDate === format(new Date(dayOfMonth?.toJSDate() || new Date()), "dd MMM, yyyy") && haveMettingInThisDay ? "bg-black hover:bg-black/100 text-white" : ""}
                `}
              >
                {dayOfMonth?.day}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
