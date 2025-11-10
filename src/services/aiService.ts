import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_KEY || "",
});

export interface SlideData {
  id: string;
  type:
    | "title"
    | "content"
    | "stats"
    | "timeline"
    | "chart"
    | "closing"
    | "twoColumn"
    | "quote";
  title: string;
  subtitle?: string;
  content: string[];
  layout?: "default" | "image-left" | "image-right" | "centered" | "split";
  stats?: {
    label: string;
    value: string;
    description: string;
    icon?: string;
  }[];
  chartData?: {
    label: string;
    value: number;
    color?: string;
  }[];
  quote?: {
    text: string;
    author: string;
  };
  imagePrompt?: string;
  notes?: string;
}

export interface PresentationStructure {
  title: string;
  subtitle: string;
  plan?: string[];
  slides: SlideData[];
  metadata: {
    topic: string;
    language: string;
  };
}

export class AIService {
  async generatePresentationStructure(
    topic: string,
    language: string,
    slideCount: number
  ): Promise<PresentationStructure> {
    slideCount = Math.max(5, Math.min(slideCount, 25));

    const densityInstruction =
      slideCount <= 10
        ? "Each slide must include 4–8 detailed bullet points (max 15 words each)."
        : "Each slide must include 2–5 concise bullet points (max 8 words each).";

    const structureGuide = `
Follow this structure strictly:
1. Title slide (always first)
2. 2–4 informative content slides
3. 1–2 stats, timeline, or chart slides if relevant
4. 1 quote or inspirational slide (optional)
5. Closing slide (always last)
`;

    const prompt = `
You are an expert AI presentation planner and content creator.

Task: Create an engaging, informative presentation about "${topic}" in ${language} language.

Target slide count: ${slideCount}

${densityInstruction}

${structureGuide}

Rules:
- Avoid generic titles like "Introduction" or "Overview" — make each slide specific.
- Each slide should be informative and standalone.
- Prefer educational or insightful bullet points.
- Ensure logical flow across slides.
- Response must be valid JSON only (no markdown or explanations).

Example JSON:
{
  "title": "Main Presentation Title",
  "subtitle": "Engaging tagline or theme",
  "plan": [
    "Introduction",
    "Key insights",
    "Trends",
    "Inspiration",
    "Closing"
  ],
  "slides": [
    {
      "type": "title",
      "title": "Welcome to the Future of AI",
      "subtitle": "How artificial intelligence transforms our world",
      "content": []
    },
    {
      "type": "content",
      "title": "What is AI?",
      "content": ["Definition of AI", "Brief history", "Applications today"],
      "layout": "default"
    },
    {
      "type": "closing",
      "title": "Thank You",
      "content": ["Questions?", "Let's discuss your ideas"]
    }
  ],
  "metadata": {
    "topic": "${topic}",
    "language": "${language}"
  }
}`;

    try {
      const response = await genAI.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          temperature: 0.7,
        },
      });

      const text = response.text ?? "";

      let cleanedText = text.replace(/```(?:json)?/g, "").trim();
      const start = cleanedText.indexOf("{");
      const end = cleanedText.lastIndexOf("}");
      if (start === -1 || end === -1) {
        throw new Error("Invalid JSON structure in AI response");
      }

      const jsonString = cleanedText.slice(start, end + 1);
      const parsed = JSON.parse(jsonString) as PresentationStructure;

      if (!Array.isArray(parsed.slides)) {
        throw new Error("Missing slides array in AI output");
      }

      parsed.slides = parsed.slides
        .slice(0, slideCount)
        .map((slide, index) => ({
          ...slide,
          id: `slide-${Date.now()}-${index}`,
        }));

      // ✅ Validate minimal fields
      if (!parsed.title || !parsed.metadata) {
        parsed.title = topic;
        parsed.metadata = { topic, language };
      }

      return parsed;
    } catch (error) {
      console.error("AI generation error:", error);
      return this.getFallbackStructure(topic, language, slideCount);
    }
  }

  private getFallbackStructure(
    topic: string,
    language: string,
    slideCount: number
  ): PresentationStructure {
    return {
      title: topic,
      subtitle: "A Professional Presentation",
      slides: [
        {
          id: "slide-1",
          type: "title",
          title: topic,
          subtitle: "An Overview",
          content: [],
        },
        {
          id: "slide-2",
          type: "content",
          title: "Introduction",
          content: [
            "Welcome to this presentation",
            "Overview of key topics",
            "What you'll learn today",
          ],
        },
        {
          id: "slide-3",
          type: "closing",
          title: "Thank You",
          content: ["Questions?"],
        },
      ],
      metadata: {
        topic,
        language,
      },
    };
  }
}
