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
- content → must contain EXACTLY 2 items.
  Each item MUST be a coherent paragraph with AT LEAST 60 words.
  Do NOT include lists, bullets, or short descriptions. 
  Each item should be a full, self-contained explanation of the slide’s subtopic.
  Each paragraph should be different and not repetitive,
- twoColumn → MUST return exactly 4 content items in this order:
  1. Left column title (short)
  2. Left column description (40–60 words)
  3. Right column title (short)
  4. Right column description (40–60 words)

  NEVER return JSON objects or markdown like **text**.
  ALWAYS return clean plain text strings.
  DO NOT return lists or bullet points.
  Titles must be short, descriptions must be longer.
  Should return data always, dont return empty in in its content
- comparison → MUST return EXACTLY 4 content items in this order:
  1. Short title for item A (3–6 words, ONLY the title, no description)
  2. Long description for item A (40–60 words, detailed, complete sentence)
  3. Short title for item B (3–6 words, ONLY the title, no description)
  4. Long description for item B (40–60 words, detailed, complete sentence)

  DO NOT combine title and description into a single string.
  DO NOT include colon ":" format like "Title: description".
  DO NOT return markdown like **bold** or lists.
  Titles MUST be short.
  Descriptions MUST be long paragraphs.
- cards → 6 highlight points or ideas
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
    },
    {
      "type": "content",
      "title": "Here title of subtopic or something in plan",
      "content": ["Here a long description -- about 60 words","Here second one of description -- about 60 words"]
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
          content: (() => {
            let raw = slide.content;

            if (!Array.isArray(raw)) {
              if (raw == null) raw = [];
              else raw = [raw];
            }

            const processed: string[] = [];

            raw.forEach((item: any) => {
              if (typeof item === "string") {
                try {
                  const parsed = JSON.parse(item);

                  // Flatten known fields
                  if (parsed.title) processed.push(parsed.title);
                  if (parsed.description) processed.push(parsed.description);
                  if (parsed.label) processed.push(parsed.label);
                  if (parsed.value) processed.push(parsed.value);
                  if (parsed.year) processed.push(parsed.year);

                  return;
                } catch {
                  processed.push(item);
                  return;
                }
              }

              if (typeof item === "object" && item !== null) {
                if (item.title) processed.push(item.title);
                if (item.description) processed.push(item.description);
                if (item.label) processed.push(item.label);
                if (item.value) processed.push(item.value);
                if (item.year) processed.push(item.year);

                return;
              }

              processed.push(String(item));
            });

            return processed;
          })(),
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
