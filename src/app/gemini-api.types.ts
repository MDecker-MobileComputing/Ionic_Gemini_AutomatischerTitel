/**
 * Interfaces für die Antwort der Gemini-API.
 */

export interface GeminiTextPart {
  text?: string;
}

export interface GeminiContent {
  parts?: GeminiTextPart[];
}

export interface GeminiCandidate {
  content?: GeminiContent;
}

export interface GeminiGenerateContentResponse {
  candidates?: GeminiCandidate[];
}

export interface GeminiGenerateContentRequest {
  generationConfig: {
    responseMimeType: string;
    temperature: number;
  };
  contents: Array<{
    parts: Array<{ text: string }>;
  }>;
}
