import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const createEncodedImg = async (file: File) => {
  console.log("hola 2");
  return new Promise((resolve, reject) => {
    console.log("hola 3");
    console.log("FILE TYPE ", file.type);
    if (
      file.type === "image/jpeg" ||
      file.type === "image/jpg" ||
      file.type === "image/png"
    ) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = (error) => reject(error);
    } else {
      console.log("Error");
      throw Error;
    }
  });
};
