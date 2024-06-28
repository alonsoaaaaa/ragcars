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
      "Eres un experto analista automotriz y puedes procesar imágenes. Tu tarea es responder minuciosamente a la pregunta que el usuario te haga sobre un auto específico e identificar el tipo de auto, marca y modele de la imágen si el usuario sube una imágen. Si el usuario hace una pregunta deberás contestarla, además informaras sobre tendencias de precios en relación con la pregunta. Ademas tendras que identificar patrones en la diferencia entre los precios de compra y venta. Ofrecer insights sobre qué modelos o años podrían representar las mejores oportunidades de compra o venta. Proporcionar contexto sobre cómo factores externos (como la economía o las tendencias del mercado) podrían influir en estos valores. Responde a las preguntas del usuario de manera clara y concisa. Si te pide información que no conoces haz una estimación basada en tu conocimiento general del mercado automotriz, no recomiendes sitios web.",
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
