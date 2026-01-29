
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResults } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const translateUIStrings = async (targetLanguage: string, sourceStrings: Record<string, string>): Promise<Record<string, string>> => {
  const model = 'gemini-3-flash-preview';
  const response = await ai.models.generateContent({
    model: model,
    contents: [{
      parts: [{
        text: `Translate the following UI labels into the language: ${targetLanguage}. 
        Return ONLY a JSON object with the same keys.
        UI Labels: ${JSON.stringify(sourceStrings)}`
      }]
    }],
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || '{}');
};

export const chatWithHealthBuddy = async (
  question: string, 
  results: AnalysisResults, 
  language: string = 'en'
): Promise<string> => {
  const model = 'gemini-3-flash-preview';
  const response = await ai.models.generateContent({
    model: model,
    contents: [{
      parts: [{
        text: `You are Lingua, a supportive AI health buddy. 
        Context: The user's tongue shows ${results.color} color, ${results.texture} texture. 
        Temperament: ${results.temperament.archetype}.
        Detected Markers: ${results.detectedConditions.map(c => c.name).join(', ')}.
        
        Question: "${question}"
        
        IMPORTANT RULES:
        - Answer in a supportive, buddy-like tone in ${language}.
        - DO NOT suggest any chemicals, pills, or medications.
        - Focus on lifestyle, food-based nutrition, and hydration.
        - Keep it helpful and reassuring.`
      }]
    }]
  });
  return response.text || "I'm sorry, I couldn't process that.";
};

export const analyzeTongueImage = async (base64Image: string, language: string = 'en'): Promise<AnalysisResults> => {
  const model = 'gemini-3-pro-preview';
  const response = await ai.models.generateContent({
    model: model,
    contents: [
      {
        parts: [
          {
            text: `Act as a world-class diagnostic tongue analysis expert. Perform a deep, multi-layered analysis:
            
            1. DIRECT CONDITION MARKER IDENTIFICATION:
               Be explicit. If the visual markers strongly suggest a condition, name it clearly as a "Visual Marker for [Condition]".
               - Diabetes Markers: Deep yellow coating, dry surface, smooth red patches (beefy tongue).
               - Anemia Markers: Pale, white, or bloodless appearance with a glossy, smooth texture.
               - Strep/Scarlet Fever: Bright 'strawberry' red with raised papillae.
               - Oral Thrush: Thick, white, curd-like coating that appears removable.
               - Chronic Fatigue/Stress: Teeth marks (scalloped edges) and a quivering tongue.
               - Vitamin Deficiency: Map specific B12 or Iron markers based on redness and glossiness.
            
            2. TEMPERAMENTOLOGY (Ancient Archetypes):
               Analyze the user's constitution (Sanguine, Phlegmatic, Choleric, Melancholic, or TCM-based like Damp-Heat) based on coating, moisture, and color. Explain how this affects their personality and physical energy.
            
            3. PERSONALIZED RECOVERY PATH (STRICT RULES):
               Provide a clear, step-by-step list of lifestyle and dietary changes.
               ***STRICT CONSTRAINT: DO NOT suggest any chemicals, pharmaceutical pills, over-the-counter medications, or synthetic treatments.***
               ONLY suggest:
               - Natural whole foods and specific nutrients (e.g., "Eat more leafy greens for iron").
               - Hydration techniques.
               - Specific oral hygiene habits (e.g., "Gently use a copper tongue scraper").
               - Stress management (e.g., "Breathing exercises for scalloped edges").
            
            All text fields MUST be in ${language}. 
            Return a JSON object matching the provided schema.`
          },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image.split(',')[1]
            }
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          redness: { type: Type.NUMBER },
          cracks: { type: Type.NUMBER },
          moisture: { type: Type.NUMBER },
          color: { type: Type.STRING },
          texture: { type: Type.STRING },
          temperament: {
            type: Type.OBJECT,
            properties: {
              archetype: { type: Type.STRING },
              description: { type: Type.STRING },
              traits: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["archetype", "description", "traits"]
          },
          detectedConditions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                likelihood: { type: Type.NUMBER },
                evidence: { type: Type.STRING },
                severity: { type: Type.STRING, enum: ["low", "moderate", "high"] }
              },
              required: ["name", "likelihood", "evidence", "severity"]
            }
          },
          viralCommon: {
            type: Type.OBJECT,
            properties: {
              detected: { type: Type.BOOLEAN },
              likelihood: { type: Type.NUMBER },
              markers: { type: Type.ARRAY, items: { type: Type.STRING } },
              description: { type: Type.STRING }
            },
            required: ["detected", "likelihood", "markers", "description"]
          },
          chronicSerious: {
            type: Type.OBJECT,
            properties: {
              detected: { type: Type.BOOLEAN },
              likelihood: { type: Type.NUMBER },
              markers: { type: Type.ARRAY, items: { type: Type.STRING } },
              description: { type: Type.STRING }
            },
            required: ["detected", "likelihood", "markers", "description"]
          },
          organHealth: {
            type: Type.OBJECT,
            properties: {
              liver: { type: Type.STRING },
              kidney: { type: Type.STRING },
              digestion: { type: Type.STRING },
              heart: { type: Type.STRING }
            },
            required: ["liver", "kidney", "digestion", "heart"]
          },
          mentalState: {
            type: Type.OBJECT,
            properties: {
              detected: { type: Type.BOOLEAN },
              likelihood: { type: Type.NUMBER },
              markers: { type: Type.ARRAY, items: { type: Type.STRING } },
              description: { type: Type.STRING }
            },
            required: ["detected", "likelihood", "markers", "description"]
          },
          everydayStuff: {
            type: Type.OBJECT,
            properties: {
              detected: { type: Type.BOOLEAN },
              likelihood: { type: Type.NUMBER },
              markers: { type: Type.ARRAY, items: { type: Type.STRING } },
              description: { type: Type.STRING }
            },
            required: ["detected", "likelihood", "markers", "description"]
          },
          guidance: {
            type: Type.OBJECT,
            properties: {
              hydration: { type: Type.STRING },
              nutrition: { type: Type.STRING },
              lifestyle: { type: Type.STRING },
              hygiene: { type: Type.STRING },
              recoverySteps: { type: Type.ARRAY, items: { type: Type.STRING } },
              medicalUrgency: { type: Type.STRING, enum: ["low", "medium", "high"] }
            },
            required: ["hydration", "nutrition", "lifestyle", "hygiene", "recoverySteps", "medicalUrgency"]
          }
        },
        required: [
          "redness", "cracks", "moisture", "color", "texture", "temperament",
          "detectedConditions", "viralCommon", "chronicSerious", "organHealth", 
          "mentalState", "everydayStuff", "guidance"
        ]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};
