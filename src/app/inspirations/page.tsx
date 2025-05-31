"use client";

import InspirationComponent from "../components/Inspirations/InspirationComponent";

const Inspiration = () => {
  return (
    <div className='w-full bg-bgPrimary2 relative'>
      <InspirationComponent />
      <div className='w-full py-20 bg-white shadow-3xl shadow-white absolute z-0 bottom-10 left-0 blur-2xl' />
    </div>
  );
};

export default Inspiration;
