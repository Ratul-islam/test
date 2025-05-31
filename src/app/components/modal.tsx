"use client";
import { enableScroll } from "@/app/utils/scrollbar";
import { Dispatch, SetStateAction } from "react";

interface Imodal {
  setShowModal: Dispatch<SetStateAction<boolean>>;
  showModal: boolean;
  children: React.ReactNode;
  bg?: string;
  contentCenter?: boolean;
  before?: string;
  after?: string;
  floatRight?: boolean;
  duration?: string;
}

const Modal: React.FC<Imodal> = ({
  setShowModal,
  showModal,
  children,
  before = "translate-y-full",
  after = "translate-y-0",
  bg = "bg-bgPrimary",
  duration = "duration-150",
  contentCenter = false,
  floatRight = false
}) => {
  return (
    <section
      onClick={() => {
        setShowModal(false);
        enableScroll();
      }}
      className={`fixed inset-0 z-50 overflow-hidden ${bg} transition-all ${duration} ease-in-out
       ${showModal ? after : before} 
       ${contentCenter ? "flex items-center justify-center" : ""}
       `}
    >
      <div
        onClick={e => e.stopPropagation()}
        className={`relative overflow-hidden duration-150 transition-all ease-in-out
          ${floatRight ? "w-fit float-right" : ""}
          ${showModal ? "scale-100 opacity-100" : "scale-125 opacity-0"}`}
      >
        {children}
      </div>
    </section>
  );
};

export default Modal;
