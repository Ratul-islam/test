/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  Button,
  Calendar,
  CalendarCell,
  CalendarGrid,
  DatePicker,
  Dialog,
  Heading
} from "react-aria-components";
import { parseDate } from "@internationalized/date";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";

interface Props {
  date: string;
  setDate: (newDate: string) => void;
  bookedDates: string[];
  availableDates: string[]; 
}

const DatePickerCal = ({
  date,
  setDate,
  bookedDates,
  availableDates
}: Props) => {
  const [error, setError] = useState("");

  const handleDateChange = (value: any) => {
    const formatted = `${value.year}-${String(value.month).padStart(2, "0")}-${String(value.day).padStart(2, "0")}`;

    if (bookedDates.includes(formatted)) {
      setError("This date is already booked.");
      return;
    }

    if (!availableDates.includes(formatted)) {
      setError("This date is not available.");
      return;
    }
    setError("");
    setDate(formatted);
  };

  return (
    <div className='w-full flex flex-col gap-1'>
      <div className='w-full flex'>
        <DatePicker
          className={"w-full"}
          value={date ? parseDate(date) : undefined}
          onChange={handleDateChange}
        >
          <div className='bg-white w-full'>
            <Dialog className='w-full'>
              <Calendar className='w-full'>
                <header className='w-full flex items-center justify-between mb-5 px-3'>
                  <Button
                    slot='previous'
                    className='p-3 rounded-lg bg-slate-200'
                  >
                    <FaAngleLeft className='text-sm' />
                  </Button>
                  <Heading className='font-bold text-lg' />
                  <Button slot='next' className='p-3 rounded-lg bg-slate-200'>
                    <FaAngleRight className='text-sm' />
                  </Button>
                </header>
                <CalendarGrid className='w-full'>
                  {calendarDate => {
                    const formatted = `${calendarDate.year}-${String(calendarDate.month).padStart(2, "0")}-${String(calendarDate.day).padStart(2, "0")}`;
                    const isBooked = bookedDates.includes(formatted);
                    const isAvailable = availableDates.includes(formatted);

                    return (
                      <CalendarCell
                        date={calendarDate}
                        className={({ isSelected, isOutsideMonth }) => {
                          let base =
                            "p-2 m-1 rounded-xl flex items-center justify-center ";

                          if (isOutsideMonth) {
                            base += "text-slate-500 cursor-default";
                          } else if (isBooked) {
                            base += "bg-slate-300 text-black";
                          } else if (isSelected) {
                            base += "bg-zinc-800 text-white font-semibold border-2 border-blue-500";
                          } else if (isAvailable) {
                            base += "bg-blue-300 hover:bg-blue-400 hover:text-white";
                          } else {
                            base += "hover:bg-blue-100 ";
                          }
                          return base;
                        }}
                      />
                    );
                  }}
                </CalendarGrid>
              </Calendar>
            </Dialog>
          </div>
        </DatePicker>
      </div>
      {error && <div className='text-red-500 text-xs px-2'>{error}</div>}
    </div>
  );
};

export default DatePickerCal;
