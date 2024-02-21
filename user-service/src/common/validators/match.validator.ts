import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'matchPassword', async: false })
export class MatchPasswordConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    const relatedPropertyName = args.constraints[0];
    const relatedValue = (args.object as any)[relatedPropertyName];
    return value === relatedValue;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(args: ValidationArguments) {
    return `repeated password and password do not match`;
  }
}

export function MatchPassword(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: MatchPasswordConstraint,
    });
  };
}
