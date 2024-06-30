"use server";
import fs from "fs";
import path from "path";
const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
const tempFilePath = path.join(__dirname, "google-credentials.json"); //esto se hace para que railway pueda leer la variable
fs.writeFileSync(tempFilePath, credentialsJson!); //NOTA: En local podemos leerlo desde el archivo, en produccion tenemos que hacer esto
import { VertexAI, Part } from "@google-cloud/vertexai";

export async function createChatAnswer(
  questionOrImg: string,
  context: string,
  projectId = "ornate-ray-424712-r8",
  location = "us-central1",
  //   model = "gemini-1.5-flash-001"
  model = "gemini-1.5-pro-001"
) {
  // Initialize Vertex with your Cloud project and location
  const vertexAI = new VertexAI({
    project: projectId,
    location: location,
    googleAuthOptions: {
      keyFilename: tempFilePath,
      // keyFilename:
      //   "C:\\Users\\52551\\Desktop\\proyectos\\omodacars\\src\\ornate-ray-424712-r8-14ad3c627e2a.json",
      // NOTA: cambiar esto por tempFilePath en produccion
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    },
  });

  const generativeVisionModel = vertexAI.getGenerativeModel({
    model: model,
    generationConfig: {
      temperature: 0.8,
    },
    systemInstruction:
      "Eres un vendedor de alitas que atiende a los clientes de forma amable y rápida, te dedicas a darles los diferentes precios a los clientes de las alitas: Vendemos las alitas a $200 la orden de 10 alitas, $120 las papas y $60 el refresco. Una vez los clientes decidieron lo que van a pedir les das el numero de whatsapp de la persona que vende las alitas, este es:+5520198765.",
  });
  // For images, the SDK supports both Google Cloud Storage URI and base64 strings
  const previousContext = { text: "previous context:" + context };
  console.log("CONTEXT: ", context);
  let userInput = {};
  if (questionOrImg.search("data:image") !== -1) {
    let img = questionOrImg.replace(
      /^data:image\/(?:jpg|jpeg|png);base64,/,
      ""
    );
    userInput = { inlineData: { data: img, mimeType: "image/jpeg" } };
  } else {
    userInput = {
      text: questionOrImg,
    };
  }
  const request = {
    contents: [
      {
        role: "user",
        parts: [userInput, previousContext] as Part[],
      },
    ],
  };
  const streamingResult = await generativeVisionModel.generateContentStream(
    request
  );
  const contentResponse = await streamingResult.response;
  return contentResponse?.candidates![0].content.parts[0]?.text!;
}
