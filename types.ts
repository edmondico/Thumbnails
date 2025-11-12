export interface ComboAnalysisResult {
  opinion: string;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  competition: string;
}

export interface GeneratedCombo {
  title: string;
  imageUrl: string;
}

export interface ScriptResult {
  title: string;
  hook: string;
  sections: {
    heading: string;
    content: string;
    visuals: string;
  }[];
  cta: string;
  outro: string;
}