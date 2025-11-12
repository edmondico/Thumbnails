import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { ComboAnalysisResult, GeneratedCombo, ScriptResult } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const fileToGenerativePart = (base64Data: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
};

export async function analyzeCombo(
  title: string,
  imageBase64: string,
  mimeType: string
): Promise<ComboAnalysisResult> {
    const imagePart = fileToGenerativePart(imageBase64, mimeType);
    const prompt = `As a YouTube growth hacking expert, analyze the synergy between this video title and thumbnail. The goal is maximum virality and click-through rate.
    Video Title: "${title}"
    
    Evaluate them as a single "packaging" unit for a viral video.
    1.  **Opinion**: Give your overall opinion on how well they work together to attract clicks from a broad audience.
    2.  **Strengths**: List 2-3 key strengths of the combination for going viral.
    3.  **Weaknesses**: List 2-3 key weaknesses or points of friction that might hinder virality.
    4.  **Improvements**: Suggest 2-3 actionable improvements for the combo to increase its viral potential.
    5.  **Competition**: Briefly describe the likely style of competing viral videos and how this combo stacks up.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }, imagePart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        opinion: { type: Type.STRING },
                        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                        improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
                        competition: { type: Type.STRING }
                    },
                    required: ["opinion", "strengths", "weaknesses", "improvements", "competition"]
                }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as ComboAnalysisResult;
    } catch (error) {
        console.error("Error analyzing combo:", error);
        throw new Error("Failed to analyze combination. Please check the API key and try again.");
    }
}

export async function generateCombos(
    analysis: ComboAnalysisResult,
    originalTitle: string
): Promise<GeneratedCombo[]> {
    const ideasPrompt = `
    Based on the following analysis of a YouTube title and thumbnail combination, generate 3 new, improved combinations designed for maximum virality.
    For each combination, provide a viral-optimized title and a detailed, descriptive prompt for an AI image generator to create a matching thumbnail.

    Original Title: "${originalTitle}"
    Analysis:
    - Opinion: ${analysis.opinion}
    - Weaknesses: ${analysis.weaknesses.join(', ')}
    - Improvements Suggested: ${analysis.improvements.join(', ')}

    Generate 3 distinct ideas that address the weaknesses and aim for a massive click-through rate. The thumbnail prompts should be vivid and compelling.
    `;
    
    const ideasResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: ideasPrompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    combinations: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                thumbnailPrompt: { type: Type.STRING }
                            },
                            required: ["title", "thumbnailPrompt"]
                        }
                    }
                }
            }
        }
    });

    const ideas = JSON.parse(ideasResponse.text.trim()).combinations;

    const generatedCombos = await Promise.all(
        ideas.map(async (idea: { title: string; thumbnailPrompt: string }) => {
            const imageResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ text: idea.thumbnailPrompt }] },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            });

            const part = imageResponse.candidates[0].content.parts.find(p => p.inlineData);
            if (!part || !part.inlineData) {
                throw new Error("Image data not found in response for prompt: ".concat(idea.thumbnailPrompt));
            }
            const imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            
            return {
                title: idea.title,
                imageUrl: imageUrl,
            };
        })
    );

    return generatedCombos;
}

export async function generateScript(analysis: ComboAnalysisResult, title: string): Promise<ScriptResult> {
    const prompt = `
    You are an expert viral YouTube scriptwriter. Your task is to write a highly engaging video script based on the provided analysis of a video's title and thumbnail.
    The script must be in English and structured for a video that is at least 8 minutes long to maximize watch time and ad revenue.

    Original Title Idea: "${title}"
    Analysis of the Idea:
    - Opinion: ${analysis.opinion}
    - Strengths: ${analysis.strengths.join(', ')}
    - Weaknesses: ${analysis.weaknesses.join(', ')}
    - Suggested Improvements: ${analysis.improvements.join(', ')}

    Based on this, create a complete script with the following structure:
    1.  **Title**: The final, optimized, viral title for the video.
    2.  **Hook**: An incredibly strong, attention-grabbing opening (the first 15-30 seconds) that makes the viewer need to know what happens next.
    3.  **Sections**: Break the main body into at least 4-5 detailed sections. For each section, provide a clear "Heading", the "Content" (what the host says), and "Visuals" (suggestions for B-roll, on-screen text, graphics, or animations to keep the viewer engaged). The content should be detailed enough to fill the 8-minute runtime.
    4.  **CTA**: A clear call to action (e.g., "subscribe," "comment with your thoughts," "check out another video").
    5.  **Outro**: A memorable closing that wraps up the video and encourages viewers to watch more content.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro', // Using a more powerful model for complex generation
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        hook: { type: Type.STRING },
                        sections: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    heading: { type: Type.STRING },
                                    content: { type: Type.STRING },
                                    visuals: { type: Type.STRING }
                                },
                                required: ["heading", "content", "visuals"]
                            }
                        },
                        cta: { type: Type.STRING },
                        outro: { type: Type.STRING }
                    },
                    required: ["title", "hook", "sections", "cta", "outro"]
                }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as ScriptResult;
    } catch (error) {
        console.error("Error generating script:", error);
        throw new Error("Failed to generate script. Please try again.");
    }
}