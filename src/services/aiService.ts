import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_KEY || "",
});

export interface SlideData {
  id: string;
  type:
    | "title"
    | "plan"
    | "content"
    | "twoColumn"
    | "timeline"
    | "comparison"
    | "cards"
    | "stats"
    | "quote"
    | "closing";
  title: string;
  subtitle?: string;
  content: string[];
  layout?: "default" | "centered" | "split";
  stats?: {
    label: string;
    value: string;
    description: string;
    icon?: string;
  }[];
  quote?: { text: string; author: string };
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
  private getSlideTypePlan(slideCount: number): string[] {
    if (slideCount <= 5) {
      return ["title", "plan", "content", "twoColumn", "closing"];
    }
    if (slideCount <= 10) {
      return [
        "title",
        "plan",
        "content",
        "twoColumn",
        "timeline",
        "comparison",
        "cards",
        "stats",
        "closing",
      ];
    }
    const basePlan = [
      "title",
      "plan",
      "content",
      "twoColumn",
      "timeline",
      "comparison",
      "cards",
      "stats",
      "closing",
    ];
    const extra = Array.from({ length: slideCount - 10 }, (_, i) =>
      i % 2 === 0 ? "content" : "twoColumn"
    );
    return [...basePlan.slice(0, -1), ...extra, "closing"];
  }

  async generatePresentationStructure(
    topic: string,
    language: string,
    slideCount: number
  ): Promise<PresentationStructure> {
    slideCount = Math.max(5, Math.min(slideCount, 25));
    const plan = this.getSlideTypePlan(slideCount);

    const prompt = `
You are an expert presentation designer and content creator.
Your task: Generate a presentation structure about "${topic}" in ${language}.

Use exactly these slide types in order:
${plan.map((t, i) => `${i + 1}. ${t}`).join("\n")}

### Slide Type Guidelines:
- title → main topic & subtitle
- plan → outline or agenda (no more than 6 agenda)
- content → deep explanation of one subtopic
- twoColumn → split comparison or pros/cons
- timeline → chronological evolution of topic
- comparison → compare related ideas, industries, or cases
- cards → 3–5 highlight points or ideas
- stats → key statistics (each with label, value, description)
- quote → motivational or insightful quote
- closing → thank you / conclusion

Rules:
- Use clear, concise, professional language.
- Avoid generic text; make each slide unique and connected.
- Each slide must have a "title" and "content" (array).
- Return a valid JSON object only (no markdown, no explanations).

Example output JSON:
{
  "title": "AI in Modern Education",
  "subtitle": "Revolutionizing Learning Through Technology",
  "plan": ["Intro", "Plan", "Trends", "Stats", "Closing"],
  "slides": [
    {
      "type": "title",
      "title": "AI in Education",
      "subtitle": "How AI is reshaping classrooms",
      "content": []
    },
    {
      "type": "plan",
      "title": "Presentation Roadmap",
      "content": ["Overview of AI in education", "Key statistics", "Case studies", "Future trends"]
    }
  ],
  "metadata": {
    "topic": "${topic}",
    "language": "${language}"
  }
}
`;

    try {
      const response = await genAI.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: { temperature: 0.7 },
      });

      const text = response.text ?? "";
      const cleanedText = text.replace(/```(?:json)?/g, "").trim();
      const start = cleanedText.indexOf("{");
      const end = cleanedText.lastIndexOf("}");
      if (start === -1 || end === -1) {
        throw new Error("Invalid JSON structure in AI response");
      }

      const parsed = JSON.parse(
        cleanedText.slice(start, end + 1)
      ) as PresentationStructure;

      if (!Array.isArray(parsed.slides)) {
        throw new Error("Missing slides array in AI output");
      }

      parsed.slides = parsed.slides
        .slice(0, slideCount)
        .map((slide, index) => ({
          ...slide,
          id: `slide-${Date.now()}-${index}`,
          content: (slide.content || []).map((item: any) => {
            if (typeof item === "string") {
              try {
                const parsedItem = JSON.parse(item);
                return parsedItem;
              } catch {
                return item;
              }
            }
            return item;
          }),
        }));

      parsed.plan = plan;

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
    const plan = this.getSlideTypePlan(slideCount);
    return {
      title: topic,
      subtitle: "A Professional Presentation",
      plan,
      slides: plan.map((type, i) => ({
        id: `fallback-${i}`,
        type: type as SlideData["type"],
        title:
          type === "title"
            ? topic
            : type === "closing"
            ? "Thank You"
            : `${type.charAt(0).toUpperCase() + type.slice(1)} Slide`,
        content: [
          "This is placeholder content.",
          "The AI could not generate full details.",
        ],
      })),
      metadata: { topic, language },
    };
  }
}
