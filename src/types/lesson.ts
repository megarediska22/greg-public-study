export type Normalization = {
  caseSensitive?: boolean;
  ignoreTerminalPunctuation?: boolean;
};

type BaseQuestion = {
  id: string;
  instruction: string;
  prompt: string;
  acceptedAnswers: readonly string[];
  explanation: string;
  normalization?: Normalization;
};

export type Question = BaseQuestion & (
  | { type: 'choice'; options: readonly string[] }
  | { type: 'blank' | 'written'; placeholder: string }
);

type BaseStep = { id: string; title: string; description: string };
export type TheoryBlock = {
  title: string;
  text: string;
  formula?: string;
  example?: string;
  translation?: string;
};

export type LessonStep = BaseStep & (
  | { type: 'intro'; completion: 'acknowledge'; heading: string; text: string; example: string; translation: string }
  | { type: 'theory'; completion: 'acknowledge'; heading: string; text: string; tableCaption: string; rows: readonly { subject: string; subjectTranslation?: string; form: string; example: string; translation: string }[]; blocks?: readonly TheoryBlock[]; noteTitle: string; note: string }
  | { type: 'exercise'; completion: 'all-correct'; questions: readonly Question[] }
  | { type: 'review'; completion: 'acknowledge' }
  | { type: 'summary'; completion: 'acknowledge' }
);

export type Lesson = {
  id: string;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  title: string;
  sample: boolean;
  objectives: readonly string[];
  steps: readonly LessonStep[];
};

export type CourseEntry = {
  id: string;
  title: string;
  subtitle: string;
  objective: string;
  lesson?: Lesson;
};
