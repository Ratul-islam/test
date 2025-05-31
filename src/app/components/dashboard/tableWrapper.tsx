"use client";
import { useRouter } from 'next/navigation'

interface props {
  title: string;
  children: React.ReactNode;
  width: string;
  height: string;
  tracking?: string;
  redirectRoute?: string;
}

const TableWrapper: React.FC<props> = ({
  title,
  children,
  width,
  height,
  redirectRoute,
  tracking = "tracking-tight"
}) => {
      const router = useRouter()
  
  return (
    <section
      className={`bg-white ${width} h-full py-5 px-6 shadow-md rounded-[8px] ${height}`}
    >
      <div className='flex items-center justify-between mb-3'>
        <span
          className={`text-[20px] mobile:text-[18px] font-extrabold ${tracking} `}
        >
          {title}
        </span>
        <button onClick={() => redirectRoute?router.push(redirectRoute):null} className='text-[12px] w-[93px] h-[28px] py-[6px] px-[9px] font-second font-bold text-[#100c20] border-[0.59px] border-[#ececed] shadow-md'>
          View all
        </button>
      </div>
      {children}
    </section>
  );
};

export default TableWrapper;
