export interface IUpdateQuestion {
  text: string;
  answers?: IUpdateAnswer[];
  correctAnswerId?: number;
  categoryId?: number;
  translatedQuestions?: IUpdateTranslatedQuestions[];
}

export interface IUpdateAnswer {
  id: number;
  text: string;
  translatedAnswers?: IUpdateTranslatedAnswers[];
}

export interface IUpdateTranslatedAnswers {
  id: number;
  text: string;
}

export interface IUpdateTranslatedQuestions {
  id: number;
  text: string;
}
