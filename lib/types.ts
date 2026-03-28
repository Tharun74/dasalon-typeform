export type QuestionType =
  | "short_text"
  | "long_text"
  | "multiple_choice"
  | "multiple_select"
  | "rating"
  | "yes_no"
  | "number"
  | "file_upload"
  | "email"
  | "url"
  | "phone"
  | "date_picker";

export interface Option {
  id: string;
  value: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  showDescription?: boolean;
  required: boolean;
  options?: Option[]; // For MCQ, Multi-select
}

export interface Form {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: string;
}

export interface Answer {
  questionId: string;
  value: string | string[] | number | boolean;
}

export interface Response {
  id: string;
  formId: string;
  answers: Answer[];
  submittedAt: string;
}
