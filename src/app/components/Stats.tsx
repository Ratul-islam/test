import NumberTicker from "./NumberTicker";
import Image from "next/image";

const statsData = [
  {
    title: "Satisfied Clients",
    value: 100,
    sign: "k+"
  },
  {
    title: "Design Uploaded",
    value: 5,
    sign: "k+"
  },
  {
    title: "Positive feedbacks",
    value: 98,
    sign: "%"
  },
  {
    title: "Close Rate",
    value: 80,
    sign: "%"
  }
];

const Stats = () => {
  return (
    <div className='w-full flex items-center justify-center gap-10 flex-wrap bg-[#2c2c2c] md:px-14 px-8 md:py-20 py-14 cursor-default relative'>
      {statsData.map(stat => (
        <div
          key={stat.title}
          className='flex flex-col items-center justify-center gap-1 z-30'
        >
          <div className='flex items-center justify-center whitespace-pre-wrap text-4xl font-semibold tracking-tighter'>
            <p>
              <NumberTicker
                value={stat.value}
                className={`${stat.title === "Satisfied Clients" ? "text-orange-500" : stat.title === "Positive feedbacks" ? "text-purple-500" : "text-white"}`}
              />
            </p>
            <span className='text-white'>{stat.sign}</span>
          </div>
          <h2 className='text-base tracking-wide text-white'>{stat.title}</h2>
        </div>
      ))}
      <div className='w-full h-full absolute z-0 top-0 left-0'>
        <Image src='BlackDotStats.svg' fill alt='' className='object-cover' />
      </div>
    </div>
  );
};

export default Stats;
