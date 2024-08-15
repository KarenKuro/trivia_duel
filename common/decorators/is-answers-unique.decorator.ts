import { ICreateAnswer } from '@common/models/question/create-answer';
import { registerDecorator, ValidationOptions } from 'class-validator';

export function ValidateIsAnswersUnique(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'is_answers_unique',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: ICreateAnswer[]) {
          const texts = value.map((e) => e.text);
          const uniqueArr = new Set([...texts]);
          return uniqueArr.size === texts.length;
        },
        defaultMessage() {
          return `is_answers_unique`;
        },
      },
    });
  };
}
