export type CharacterKey = "mayumi" | "father" | "mother" | "narrator";
export type SenderKey = CharacterKey | "student";

export interface CaseStep {
  key: string;
  order: number;
  label: string;
  settingNote: string;
  availableCharacters: CharacterKey[];
}

export interface CaseMeta {
  id: string;
  title: string;
  subtitle: string;
  objectives: string[];
}

export interface Language {
  code: string;
  label: string;
}

export interface Message {
  id: string;
  stepKey: string;
  sender: SenderKey;
  addressedTo: CharacterKey | null;
  content: string;
  createdAt: string;
}

export interface RubricItem {
  criterion: string;
  met: boolean | "partial";
  note: string;
}

export interface AiScoreResult {
  score: number | null;
  feedback: string;
  rubric: RubricItem[];
  strengths: string[];
  areas_for_improvement: string[];
}

export interface TutorReview {
  score: number;
  feedback: string;
  reviewed: true;
}

export interface StepScore {
  ai: AiScoreResult | null;
  tutor: TutorReview | null;
}

export interface SessionData {
  id: string;
  displayName: string;
  currentStepKey: string;
  language: string;
  startedAt: string;
  updatedAt: string;
  messages: Message[];
  scores: Record<string, StepScore>;
}

export const CHARACTER_LABELS: Record<string, string> = {
  mayumi: "Mayumi (patient)",
  father: "Father",
  mother: "Mother",
  narrator: "Narrator / Examiner",
  student: "You",
};

export const CHARACTER_COLORS: Record<string, string> = {
  mayumi: "#B85C38",
  father: "#3D6B5C",
  mother: "#6B5B95",
  narrator: "#8A8478",
};

// Must match the order in case.js
export const STEPS_ORDER = [
  "initial_information",
  "session1_part1",
  "session1_part2",
  "session1_part3",
  "session2_part1",
  "session2_part2",
];
