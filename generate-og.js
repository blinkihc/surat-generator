import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generate() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: 'A modern, professional, and clean abstract illustration representing property tax (PBB) document handover in Indonesia. It features stylized documents, a house or building icon, and a subtle Indonesian flag color accent (red and white). The design is flat, vector-style, with a blue and indigo color palette, suitable for a web application open graph cover image. 1200x630 resolution.',
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64EncodeString = part.inlineData.data;
        const buffer = Buffer.from(base64EncodeString, 'base64');
        fs.writeFileSync('public/og-image.png', buffer);
        console.log('Image saved to public/og-image.png');
        return;
      }
    }
    console.log('No image found in response');
  } catch (error) {
    console.error('Error generating image:', error);
  }
}

generate();
