import { HttpException, HttpStatus } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import {
  IMessageResponse,
  IValidationErrors,
  IValidationErrorsResponse,
} from '@common/models';

export class ResponseManager {
  static buildError(
    error: IMessageResponse | IValidationErrorsResponse = null,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    throw new HttpException(error, status);
  }

  static validationHandler(
    errors: ValidationError[],
    prop: string = null,
  ): IValidationErrors[] {
    const parentProp = prop ? `${prop}.` : '';
    const errorResponse: IValidationErrors[] = [];

    for (const e of errors) {
      if (e.constraints) {
        const constrainKeys = Object.keys(e.constraints);
        for (const item of constrainKeys) {
          errorResponse.push({
            field: e.property,
            message: `err_${parentProp}${e.property.toLowerCase()}_${item}`,
          });
        }
      }
    }
    return errorResponse;
  }
}
