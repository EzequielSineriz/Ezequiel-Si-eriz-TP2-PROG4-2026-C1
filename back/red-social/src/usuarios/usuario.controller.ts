import { BadRequestException, Body, Controller, Param, Put, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { UsuariosService } from "./usuario.service";

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Put(':id/perfil')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars', // 🔮 Tu carpeta estática elegida
        filename: (req, file, cb) => {
          // Generamos un nombre único pseudo-aleatorio ciberpunk
          const randomName = Array(12)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${Date.now()}-${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return cb(new BadRequestException('Archivo de evidencia inválido. Solo JPG o PNG.'), false);
        }
        cb(null, true);
      },
    }),
  )
  async actualizarPerfil(
    @Param('id') id: string,
    @Body('descripcion') descripcion: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    let pathAvatar: string | undefined = undefined;
    
    if (file) {
      // Guardamos la ruta relativa tal cual lo maneja tu base de datos actual
      pathAvatar = `/uploads/avatars/${file.filename}`;
    }

    return this.usuariosService.actualizarPerfil(id, descripcion, pathAvatar);
  }
}