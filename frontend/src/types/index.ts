export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type QuestionType = 'MCQ' | 'Short Question' | 'Broad Question' | 'True/False';

export interface MCQQuestion {
  id: number;
  type: 'MCQ';
  question: string;
  options: [string, string, string, string];
  answer?: string;
}

export interface ShortQuestion {
  id: number;
  type: 'Short Question';
  question: string;
  answer?: string;
}

export interface BroadQuestion {
  id: number;
  type: 'Broad Question';
  question: string;
  answer?: string;
}

export interface TrueFalseQuestion {
  id: number;
  type: 'True/False';
  question: string;
  answer?: 'True' | 'False';
}

export type Question = MCQQuestion | ShortQuestion | BroadQuestion | TrueFalseQuestion;

export interface QuestionPaper {
  title: string;
  questions: Question[];
}

export type QuestionCounts = Partial<Record<QuestionType, number>>;
