// src/app/dashboard/components/dashboard/usuarios/usuarios.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AdminUsuariosService } from '../admin/admin.service';
import { UsuarioDashboard } from './usuarioDashboard.interface';
import { AuthService } from '../../auth/services/auth.service';
import { FormUtils } from '../../utils/forms.utils';
import { PerfilEstiloDirective } from '../../utils/directives/perfil-estilo';


@Component({
  selector: 'app-dashboard-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,PerfilEstiloDirective],
  templateUrl: './dashboard.usuarios.html',
})
export class DashboardUsuarios implements OnInit {
  private adminService = inject(AdminUsuariosService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  public formUtils = FormUtils;

  // Control de pestañas: 'listar' o 'crear'
  public vistaActual = signal<'listar' | 'crear'>('listar');

  // Control de Archivos de Imagen (Avatar)
  public fileSelected: File | null = null;
  public imagePreview: string | ArrayBuffer | null = null;


  public registroForm: FormGroup = this.fb.group({
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
    descripcion: ['', [Validators.maxLength(250)]],
    perfil: ['usuario', [Validators.required]] // Rango de iniciación controlado por admin
  }, {
    validators: [
      FormUtils.isFieldOneEqualFieldTwo('password', 'confirmPassword')
    ]
  });

  // Lista mockeada para renderizar de inmediato (conectala luego a tu AdminService)
  public usuarios = signal<UsuarioDashboard[]>([]);


  ngOnInit(): void {
    this.cargarUsuariosDelNexo();
  }


  cargarUsuariosDelNexo() {
    this.adminService.listarUsuarios().subscribe({
      next: (data) => this.usuarios.set(data),
      error: (err) => console.error('Error invocando el registro base de usuarios:', err)
    });
  }

  cambiarVista(vista: 'listar' | 'crear') {
    this.vistaActual.set(vista);
    if (vista === 'listar') {
      this.limpiarFormulario();
    }
  }

  limpiarFormulario() {
    this.registroForm.reset({ perfil: 'usuario' });
    this.fileSelected = null;
    this.imagePreview = null;
  }



  // Acciones Administrativas
  verPublicacionesUsuario(usuarioId: string) {
    // Redireccionamos opcionalmente a un feed filtrado o detalle
    this.router.navigate(['/home'], { queryParams: { autor: usuarioId } });
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: 'Filtrando plano espectral por autor...',
      showConfirmButton: false,
      timer: 2000,
      background: '#1a1a1a',
      color: '#e0e0e0'
    });
  }



 crearNuevoUsuario() {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    const formValues = this.registroForm.value;

    // 📦 CONSTRUIMOS EL FORMDATA PARA TRANSMISIÓN BINARIA
    const formData = new FormData();
    formData.append('nombre', formValues.nombre);
    formData.append('apellido', formValues.apellido);
    formData.append('email', formValues.email);
    formData.append('nombreUsuario', formValues.nombreUsuario);
    formData.append('password', formValues.password);
    formData.append('fechaNacimiento', formValues.fechaNacimiento);
    formData.append('descripcion', formValues.descripcion || '');
    formData.append('perfil', formValues.perfil);

    if (this.fileSelected) {
      formData.append('avatar', this.fileSelected, this.fileSelected.name);
    }

    this.adminService.crearUsuario(formData).subscribe({
      next: (userCreado: UsuarioDashboard) => {
        this.usuarios.update(lista => [...lista, userCreado]);

        Swal.fire({
          title: '<span class="text-emerald-400 font-logo tracking-wider">INVOCACIÓN COMPLETADA</span>',
          text: `El alma de ${userCreado.nombreUsuario} ha sido mapeada al Nexo por orden jerárquica.`,
          icon: 'success',
          background: '#1a1a1a',
          color: '#e0e0e0',
          confirmButtonColor: '#10b981'
        });

        this.limpiarFormulario();
        this.vistaActual.set('listar');
      },
      error: (err) => {
        console.error('Error al manifestar usuario:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error de Sincronización',
          text: err.error?.message || 'No se pudo forzar el alta en la base oculta.',
          background: '#1a1a1a',
          color: '#e0e0e0',
          confirmButtonColor: '#a30000'
        });
      }
    });
  }


  alternarEstadoUsuario(usuario: UsuarioDashboard) {
    const proximoEstado = !usuario.activo;
    const peticion$ = usuario.activo
      ? this.adminService.deshabilitar(usuario._id)
      : this.adminService.habilitar(usuario._id);

    peticion$.subscribe({
      next: () => {
        this.usuarios.update(lista =>
          lista.map(u => u._id === usuario._id ? { ...u, activo: proximoEstado } : u)
        );
      }
    });
  }



  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fileSelected = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
}



