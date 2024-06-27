import React, { useRef, useState } from "react";
import { Button } from "./button";

const CustomFileInput = ({
  accept,
  onChange,
}: {
  accept: string;
  onChange: Function;
}) => {
  const fileInputRef = useRef(null as any);
  const [fileName, setFileName] = useState("No la has elegido aún");

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleChange = (event: any) => {
    const fileList = event.target.files;
    if (fileList.length > 0) {
      setFileName(
        fileList.length === 1
          ? fileList[0].name
          : `${fileList.length} files selected`
      );
    } else {
      setFileName("No file chosen");
    }
    if (onChange) {
      onChange(event);
    }
  };

  return (
    <div className="flex items-start">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        className="hidden"
        accept={accept}
      />
      <Button
        onClick={handleClick}
        className="bg-blue-500 hover:bg-blue-700"
        type="button"
      >
        Elije la imágen
      </Button>
      <span className="ml-3 text-gray-700">{fileName}</span>
    </div>
  );
};

export default CustomFileInput;
