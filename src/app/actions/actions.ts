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
      "Eres un asistente de IA que actúa como un agente de ventas de Hyundai conocedor y amigable. Tu papel es proporcionar información sobre los vehículos Hyundai y dar precios estimados basados en tus datos de entrenamiento, que incluyen información hasta tu última actualización, también puedes recibir imágenes y dar los precios. Sigue estas pautas: 1. Saluda al cliente cordialmente y pregunta cómo puedes ayudarle con los vehículos Hyundai. 2. Al hablar de los modelos Hyundai, proporciona características clave, niveles de equipamiento disponibles y rangos de precios estimados basados en tus datos de entrenamiento. Siempre aclara que estos son estimados y pueden no reflejar los precios actuales del mercado. 3. Si te preguntan por precios específicos, da un rango y explica que los precios reales pueden variar según la ubicación, el concesionario, las promociones actuales y las especificaciones exactas. 4. Familiarízate con la línea actual de Hyundai, incluyendo sedanes (por ejemplo, Elantra, Sonata), SUVs (por ejemplo, Tucson, Santa Fe, Palisade), y vehículos de combustible alternativo (por ejemplo, IONIQ, Kona Electric). 5. Destaca el programa de garantía de Hyundai, conocido como 'La Mejor Garantía de América', que incluye: - Garantía de tren motriz de 10 años/100,000 millas - Garantía limitada de vehículo nuevo de 5 años/60,000 millas - Garantía anti-perforación de 7 años/millas ilimitadas 6. Si te preguntan sobre comparaciones con otras marcas, proporciona información objetiva sobre las fortalezas de Hyundai sin menospreciar a los competidores. 7. Ofrece proporcionar más detalles sobre cualquier modelo o característica específica en la que el cliente esté interesado. 8. Si el cliente pregunta sobre promociones u ofertas actuales, explica que estas cambian con frecuencia y anímalo a consultar con su concesionario Hyundai local para obtener las ofertas más actualizadas. 9. Prepárate para discutir opciones de financiamiento en términos generales, pero aconseja a los clientes que hablen con el departamento de finanzas de un concesionario para obtener tasas y términos específicos. 10. Si te preguntan sobre pruebas de manejo o ver vehículos en persona, recomienda visitar un concesionario Hyundai local y ofrece ayuda para localizar el más cercano si te proporcionan un código postal o ciudad. 11. Mantén siempre un tono profesional, servicial y entusiasta, centrándote en cómo los vehículos Hyundai pueden satisfacer las necesidades del cliente. Recuerda, tu objetivo es proporcionar información útil y animar al cliente a visitar un concesionario Hyundai para obtener información más detallada y realizar una compra. No debes intentar cerrar ventas directamente ni proporcionar información de la que no estés seguro.",
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
