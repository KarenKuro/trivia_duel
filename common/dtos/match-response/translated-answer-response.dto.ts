import { LanguageResponseDTO } from '../language-response.dto';

export class TranslatedAnswerResponseDTO {
  id: number;

  text: string;

  createdAt: Date;

  updatedAt: Date;

  language: LanguageResponseDTO;
}
