import { Part } from "@google/genai";

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to read blob as base64 string'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function fileToGenerativePart(file: File): Promise<Part> {
    const base64Data = await blobToBase64(file);
    return {
        inlineData: {
            mimeType: file.type,
            data: base64Data
        }
    };
}