"use client";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { LineChartData } from "./navigation.data";

interface props {
  width: string;
  height: string;
  title: string;
  count: string;
  text: string;
  py?: string;
  percent: string;
  percentColor: string;
  chartHeight: number;
  chartColor: string;
  chartWidth: number;
}

const SalesThisWeek: React.FC<props> = ({
  width,
  height,
  chartHeight,
  chartWidth,
  title,
  count,
  text,
  chartColor,
  percent,
  percentColor,
  py = ""
}) => {
  return (
    <div
      className={`flex gap-x-4 bg-white p-6 ${py} mobile:py-6 ${width} ${height} w-full justify-between shadow-md rounded-[12px]`}
    >
      <div className='flex min-w-fit flex-col justify-between'>
        <span className='font-extrabold text-[18px] mt-5 tracking-wide'>
          {title}
        </span>
        <div className='flex flex-col mb-4 font-second'>
          <span className='text-[44px] mobile:text-[28px] font-bold tracking-tighter leading-[120%]'>
            {count}
          </span>
          <span className='text-[14px] mobile:text-[12px]'>{text}</span>
        </div>
      </div>
      <div className={`h-full w-full flex items-end relative`}>
        <span className={`absolute block right-0 top-5 ${percentColor}`}>
          {percent}
        </span>
        <ResponsiveContainer className='pt-10' width='100%' height='100%'>
          <LineChart
            width={chartWidth}
            height={chartHeight}
            data={LineChartData}
          >
            <Line
              type='monotone'
              dataKey='pv'
              stroke={chartColor}
              strokeWidth={4}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesThisWeek;
