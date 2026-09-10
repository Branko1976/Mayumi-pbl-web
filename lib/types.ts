export type CharacterKey = "patient" | "friend" | "mother" | "narrator";
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

// ── Live classroom mode ──────────────────────────────────────────────────
// Unlike solo mode (SessionData carries its own private `messages`), the
// classroom mode's chat is shared per room+step: everyone working on a step
// sees the same conversation, tagged with who said what, so students can
// see each other's questions. Each student's own progress/scores stay
// separate — the tutor dashboard filters the shared chat back down to one
// student at a time.

export interface RoomChatMessage {
  id: string;
  studentId: string;
  studentName: string;
  stepKey: string;
  characterKey: CharacterKey;
  sender: SenderKey;
  addressedTo: CharacterKey | null;
  content: string;
  createdAt: string;
}

export interface RoomStudentProgress {
  id: string;
  displayName: string;
  language: string;
  currentStepKey: string;
  startedAt: string;
  updatedAt: string;
  lastSeenAt: string;
  scores: Record<string, StepScore>;
}

export const CHARACTER_LABELS: Record<string, string> = {
  patient: "Patient",
  friend: "Friend",
  mother: "Mother (phone)",
  narrator: "Narrator / Examiner",
  student: "You",
};

export const CHARACTER_COLORS: Record<string, string> = {
  patient: "#B85C38",
  friend: "#3D6B5C",
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
  "session2_part3",
];
