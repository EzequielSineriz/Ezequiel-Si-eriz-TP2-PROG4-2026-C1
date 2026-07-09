import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ScaryGhostIcon } from '../../../utils/icons/ghost_icon';
import { ScaryUfoIconComponent } from '../../../utils/icons/ovni_icons';
import { ScaryMythIconComponent } from '../../../utils/icons/mytology_icons';
import { ScaryGeneralIconComponent } from '../../../utils/icons/pergamino_icons';
import { ScaryEvidenceIconComponent } from '../../../utils/icons/scary_evidence';

@Component({
  selector: 'app-post-box',
  imports: [ReactiveFormsModule, CommonModule, ScaryGhostIcon,
    ScaryUfoIconComponent,
    ScaryMythIconComponent,
    ScaryGeneralIconComponent,
    ScaryEvidenceIconComponent
  ],
  templateUrl: './post-box.html',
  styleUrl: './post-box.css',
})
export class PostBox {private fb = inject(FormBuilder);

  @Output() onNuevoPost = new EventEmitter<any>();

  public imagenSeleccionada: File | null = null;
  public imagenPreview: string | null = null;

  public postForm: FormGroup = this.fb.group({
    contenido: ['', [Validators.required, Validators.maxLength(500)]],
    categoria: ['ovnis', [Validators.required]] // Categoría por defecto
  });

  public categorias = [
  { id: 'ovnis', nombre: 'Ovnis y Avistamientos' },
  { id: 'fantasmas', nombre: 'Fantasmas y Psicofonías' },
  { id: 'mitologia', nombre: 'Mitología y Leyendas' },
  { id: 'general', nombre: 'Difusión General' }
];

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imagenSeleccionada = input.files[0];

      // Generar la preview local en Base64
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenPreview = reader.result as string;
      };
      reader.readAsDataURL(this.imagenSeleccionada);
    }
  }

  quitarImagen() {
    this.imagenSeleccionada = null;
    this.imagenPreview = null;
  }

  enviarPost() {
    if (this.postForm.invalid) return;

    // Construimos el FormData para soportar la subida del archivo
    const formData = new FormData();
    formData.append('contenido', this.postForm.value.contenido);
    formData.append('categoria', this.postForm.value.categoria);

    if (this.imagenSeleccionada) {
      formData.append('imagen', this.imagenSeleccionada); // Llave que esperará el backend
    }

    // Emitimos el FormData completo hacia el componente o servicio encargado de hacer el POST
    this.onNuevoPost.emit(formData);

    // Resetear formulario y estados de imagen
    this.postForm.reset({ categoria: 'ovnis' });
    this.quitarImagen();
  }
}
