import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const createEncodedImg = async (file: File) => {
  return new Promise((resolve, reject) => {
    if (file.type === "image/jpeg" || file.type === "image/jpg") {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = (error) => reject(error);
    } else {
      throw Error;
    }
  });
};
