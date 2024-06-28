"use client";
import { BrainIcon, PointerIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import Image from "next/image";
import { FormEvent, useRef, useState } from "react";
import { createChatAnswer } from "./actions/actions";
import { createEncodedImg } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import FileInput from "@/components/ui/file-input";

export default function Home() {
  const [chatContext, setChatContext] = useState([" "] as string[]);
  const currCtx = useRef("Mensajes anteriores: ");
  const [userMessage, setUserMessage] = useState("");
  const [submittingAns, setSubmittingAns] = useState(false);
  const [image, setImage] = useState<File>();
  function parseText(text: string) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g); // Split text by bold markers
    // const parts = text.split(/(\*\*[^*]+\*\*\.?\s*)/g);
    return parts.map((part, index) => {
      part.replaceAll(",", "").replaceAll("\n", "");
      if (
        (part.startsWith("**") && part.endsWith("**")) ||
        (part.startsWith("***") && part.endsWith("***"))
      ) {
        let rawPart = part.slice(2, -2);
        console.log("RAWPART: ", rawPart);
        return (
          <span className="font-extrabold" key={index}>
            {rawPart}
          </span>
        ); // Remove the asterisks and wrap with <strong>
      }
      return part; // Return the text as is if it's not between asterisks
    });
  }
  const handleImgSubmit = async (e: any) => {
    e.preventDefault();
    let parsedImg = await createEncodedImg(image!);
    setSubmittingAns(true);
    let answer = await createChatAnswer(parsedImg as string, currCtx.current);
    setSubmittingAns(false);
    setChatContext((prevState) => {
      return [...prevState, "**Inteligencia Artificial** " + answer];
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    debugger;
    e.preventDefault();
    let inp: any = document.getElementById("textinp");
    inp!.value = "";
    currCtx.current = `${chatContext} "Usuario: ${userMessage} `;
    setChatContext([...chatContext, "**Usuario** " + userMessage]);
    setSubmittingAns(true);
    let messageStream = await createChatAnswer(userMessage, currCtx.current);
    setSubmittingAns(false);
    setChatContext((prevState) => {
      return [...prevState, "**Inteligencia Artificial** " + messageStream];
    });
    console.log(chatContext);
  };
  return (
    <div>
      <div className="flex flex-col items-center">
        <div className="flex flex-col flex-wrap justify-center items-center max-w-[1100px] content-center ">
          <div id="chatContext" className="fñex flex-col pb-4">
            <div className="flex flex-col justify-center items-center text-center content-center">
              <h1 className="flex text-xl flex-wrap font-semibold pt-4 text-pretty">
                Haz preguntas o sube una imágen del auto que quieres identificar
                y deja que nuestra Inteligencia Aritificial especializada en la
                industria automotriz resuelve las dudas que tengas sobre los
                autos.
              </h1>
              <BrainIcon fill="pink" width={50} height={50} />
            </div>
            <div className="flex flex-col items-start">
              {chatContext.map((message) => {
                message = parseText(message) as any;
                return message;
              })}
            </div>
            {submittingAns && (
              <div className="flex flex-col justify-center items-center">
                <h1 className="self-center">Pensando respuesta...</h1>
                <Spinner />
              </div>
            )}
          </div>

          <form
            className="flex-col items-center justify-center "
            onSubmit={(e) => handleSubmit(e)}
          >
            <Input
              type="text"
              className="w-[50vw]"
              id="textinp"
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder="ej: Precio de Acura MDX 2019"
              // placeholder="Chevrolet Camaro 2023"
            />
            <Input
              className="bg-blue-400 hover:bg-blue-300 w-fit"
              type="submit"
              value={"Hacer pregunta"}
            />
          </form>
          <form
            onSubmit={(e) => handleImgSubmit(e)}
            className="flex flex-col max-md:justify-start content-center items-center mt-5 gap-3"
          >
            <div className="flex-col gap-3 items-center ">
              <div className="flex gap-3">
                <FileInput
                  accept=".png,.jpg,.jpeg"
                  onChange={(e: any) => setImage(e.target.files?.[0])}
                />
              </div>
              <div>
                <Input
                  type="submit"
                  value={"Subir imágen...."}
                  className="w-fit bg-green-600"
                />
              </div>

              {/* <Input
                type="file"
                accept="image/jpg, image/jpeg"
                name="file"
                onChange={(e) => {
                  setImage(e.target.files?.[0]); //NOTA: esto es lo mismo que FormData.get("image")? o eso es con react hook form?
                }}
                required
                className="w-fit"
              /> */}
            </div>
            {/* <Input
              className="bg-blue-300 w-fit"
              type="submit"
              value="Subir imágen"
            /> */}
          </form>
        </div>
      </div>
    </div>
  );
}
