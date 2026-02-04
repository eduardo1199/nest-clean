/* eslint-disable @typescript-eslint/no-explicit-any */
import { BadRequestException, PipeTransform } from '@nestjs/common'
import { ZodError, ZodObject, ZodPipe } from 'zod'
import { fromZodError } from 'zod-validation-error'

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodObject<any> | ZodPipe<any>) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value)
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          message: 'Validation failed',
          statusCode: 400,
          errors: fromZodError(error),
        })
      }

      throw new BadRequestException('Validation failed')
    }

    return value
  }
}
