import {
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { validateBr } from 'js-brasil';

@ValidatorConstraint({ name: 'isCpf', async: false })
export class IsCpfConstraint implements ValidatorConstraintInterface {
  validate(cpf: string): boolean {
    if (!cpf) return false;

    return validateBr.cpf(cpf);
  }

  defaultMessage(): string {
    return 'CPF inválido';
  }
}

export function IsCpf(options?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      constraints: [],
      validator: IsCpfConstraint,
    });
  };
}
