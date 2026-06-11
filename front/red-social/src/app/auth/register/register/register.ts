import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FormUtils } from '../../../utils/forms.utils';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [ CommonModule, RouterLink, ReactiveFormsModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  //public authService = inject(AuthServices);
  public formUtils = FormUtils;

  public fileSelected: File | null = null;
  public imagePreview: string | ArrayBuffer | null = null;

  // Creamos el formulario reactivo acoplado a tu Backend DTO
  public myForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.pattern(FormUtils.namePattern)]],
    apellido: ['', [Validators.required, Validators.pattern(FormUtils.namePattern)]],
    email: ['',
      [Validators.required, Validators.pattern(FormUtils.emailPattern)],
      [this.authService.validarEmailUnico.bind(this.authService)]
    ],
    nombreUsuario: ['', [
      Validators.required,
      Validators.minLength(6),
      Validators.pattern(FormUtils.notOnlySpacesPattern)
    ]],
    password: ['', [Validators.required, Validators.pattern(FormUtils.passwordPattern)]],
    confirmPassword: ['', [Validators.required]],
    fechaNacimiento: ['', [Validators.required]],
    descripcion: ['', [Validators.maxLength(250)]], // Opcional, biografía del buscador
    terms: [false, [Validators.requiredTrue]]
  }, {
    validators: [
      FormUtils.isFieldOneEqualFieldTwo('password', 'confirmPassword')
    ]
  });

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fileSelected = file;

      // Crea un lector para generar la vista previa gótica en tiempo real
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.myForm.invalid) {
      this.myForm.markAllAsTouched();
      return;
    }

    // Estructuramos los datos finales para enviarle al Backend
    console.log('Iniciación Ocultista Invocada:', this.myForm.value);


    // 📦 CONSTRUIMOS EL FORMDATA
    const formData = new FormData();
    const formValues = this.myForm.value;


    formData.append('nombre', formValues.nombre);
    formData.append('apellido', formValues.apellido);
    formData.append('email', formValues.email);
    formData.append('nombreUsuario', formValues.nombreUsuario);
    formData.append('password', formValues.password); // 👈 Viaja solo la clave real
    formData.append('fechaNacimiento', formValues.fechaNacimiento);
    formData.append('descripcion', formValues.descripcion || '');

    // Metemos el archivo binario del avatar bajo la llave 'avatar' (coincidiendo con NestJS)
    if (this.fileSelected) {
      formData.append('avatar', this.fileSelected, this.fileSelected.name);
    }

    // Aquí llamarías a tu servicio inyectado
    this.authService.registrar(formData, this.myForm);

  }
}
