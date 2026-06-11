import {
  AbstractControl,
  FormArray,
  FormGroup,
  ValidationErrors,
} from '@angular/forms';

async function sleep() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 2500);
  });
}

export class FormUtils {
  // Expresiones regulares
  static namePattern = '^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$';
  static emailPattern = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';
  static notOnlySpacesPattern = '^[a-zA-Z0-9]+$';
  static slugPattern = '^[a-z0-9_]+(?:-[a-z0-9_]+)*$';
  static passwordPattern = '^(?=.*[A-Z])(?=.*\\d).{8,}$'; //AL MENOS 8 CARACTERES 1 MAYÚSCULA Y 1 NÚMERO

  static getTextError(errors: ValidationErrors) {
    for (const key of Object.keys(errors)) {
      switch (key) {
        case 'required':
          return 'Este campo es requerido';

        case 'minlength':
          return `Mínimo de ${errors['minlength'].requiredLength} caracteres.`;

        // ✅ NUEVO: Manejo específico para el error de la clave robusta
        case 'pattern':
          if (errors['pattern'].requiredPattern === FormUtils.passwordPattern) {
            return 'Debe tener al menos 8 caracteres, una mayúscula y un número.';
          }
          if (errors['pattern'].requiredPattern === FormUtils.emailPattern) {
            return 'El valor ingresado no luce como un correo electrónico';
          }
          if (errors['pattern'].requiredPattern === FormUtils.namePattern) {
            return 'Solo se admiten caracteres alfabéticos.';
          }
          return 'Error de patrón invocado.';

        case 'passwordsNotEqual':
          return 'Las claves secretas no coinciden en el espejo';

        case 'emailTaken':
          return 'Este correo ya está registrado en las sombras';

        default:
          return `Error de validación no controlado: ${key}`;
      }
    }
    return null;
  }

  static isValidField(form: FormGroup, fieldName: string): boolean | null {
    return (
      !!form.controls[fieldName].errors && form.controls[fieldName].touched
    );
  }

  static getFieldError(form: FormGroup, fieldName: string): string | null {
    if (!form.controls[fieldName]) return null;

    const errors = form.controls[fieldName].errors ?? {};

    return FormUtils.getTextError(errors);
  }

  static isValidFieldInArray(formArray: FormArray, index: number) {
    return (
      formArray.controls[index].errors && formArray.controls[index].touched
    );
  }

  static getFieldErrorInArray(
    formArray: FormArray,
    index: number
  ): string | null {
    if (formArray.controls.length === 0) return null;

    const errors = formArray.controls[index].errors ?? {};

    return FormUtils.getTextError(errors);
  }

  static isFieldOneEqualFieldTwo(field1: string, field2: string) {
    return (formGroup: AbstractControl) => {
      const field1Value = formGroup.get(field1)?.value;
      const field2Value = formGroup.get(field2)?.value;

      return field1Value === field2Value ? null : { passwordsNotEqual: true };
    };
  }

  static async checkingServerResponse(
    control: AbstractControl
  ): Promise<ValidationErrors | null> {
    console.log('Validando contra servidor');

    await sleep(); // 2 segundos y medio

    const formValue = control.value;

    if (formValue === 'hola@mundo.com') {
      return {
        emailTaken: true,
      };
    }

    return null;
  }

  static notStrider(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    return value === 'strider' ? { noStrider: true } : null;
  }
}
