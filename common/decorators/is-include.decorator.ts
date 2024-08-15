import { ICreateAnswer } from '@common/models/question/create-answer';
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function ValidateIsAnswerIncluded(
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'is_include',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: string, args: ValidationArguments) {
          const arr: ICreateAnswer[] = args.object['answers'];

          return Array.isArray(arr) && arr.map((e) => e.text).includes(value);
        },
        defaultMessage() {
          return `err_is_include`;
        },
      },
    });
  };
}
