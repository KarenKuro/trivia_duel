import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function ValidateIsInclude(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'is_include',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate<T>(value: T, args: ValidationArguments) {
          const arr: any[] = args.object[validationOptions.context];

          return Array.isArray(arr) && arr.includes(value);
        },
        defaultMessage() {
          return `err_is_include`;
        },
      },
    });
  };
}
