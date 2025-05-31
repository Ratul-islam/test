import { Dispatch, SetStateAction } from "react";

export interface FormData {
  full_name?: string;
  email?: string;
  otp?: string;
  studioOrArtist?: string;
  instagram?: string;
  tikTok?: string;
  facebook?: string;
  description?: string;
  [key: string]: string | undefined; 
}

export interface Isteps {
  setStep: Dispatch<SetStateAction<number>>;
  updateFormData?: (data: FormData) => void;
}