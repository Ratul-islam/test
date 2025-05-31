import Image from "next/image";

interface props {
  text: string;
  image: string;
  maxW?: string;
  bottom?: string;
}

const HeaderItem: React.FC<props> = ({
  text,
  image,
  maxW = "max-w-[157px]",
  bottom = "bottom-0"
}) => {
  return (
    <div
      className='flex text-left relative rounded-[30px] w-[345px] h-[237px] bg-white/10 p-5 border-grey/30 border-[1px] duration-300
     hover:border-grey/60 mobile:w-[330px] tablet:h-[187px] tablet:w-[225px] overflow-hidden'
    >
      <p className={`${maxW} text-[14px] leading-4 tablet:text-[12px] z-10`}>
        {text}
      </p>
      <div
        className={`
          absolute right-0 ${bottom} tablet:right-[-66px] h-[224px] w-[188px] tablet:h-[100px] tablet:w-[245px] tablet:bottom-0 mobile:h-[170px] mobile:right-[-40px]`}
      >
        <Image
          style={{ objectFit: "contain" }}
          sizes='100%'
          fill
          src={image}
          alt={image}
        />
      </div>
      <a href='/sign-up'>
        <div className='absolute bottom-2 left-2 bg-white/10 p-[17px] rounded-[50%] border-[1px] border-grey/30 cursor-pointer hover:scale-105 duration-300'>
          <Image width={18} height={18} src='arrow-corner.svg' alt='arrow' />
        </div>
      </a>
    </div>
  );
};

export default HeaderItem;
