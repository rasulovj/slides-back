import { Request } from "express";

export interface AuthRequest extends Omit<Request, "user"> {
  user?: {
    id: string;
    email: string;
    isPremium: boolean;
  };
}

export interface GeneratePresentationRequest {
  topic: string;
  language: string;
  theme: string;
  format?: "pptx" | "pdf";
}
