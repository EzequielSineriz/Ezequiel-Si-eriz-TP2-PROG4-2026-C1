import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { UsuariosService } from "./usuario.service";
import { AdminGuard } from "src/auth/admin/admin.guard";
import { TokenGuard } from "src/auth/token/token.guard";
import { UserAdminRegisterDto } from "./dto/admin-create-user.dto";

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  @UseGuards(TokenGuard, AdminGuard)
  async listarTodos() {
    return this.usuariosService.listarTodosLosUsuarios();
  }


@Post('admin-alta')
@UseGuards(TokenGuard, AdminGuard)
@UseInterceptors(
  FileInterceptor('avatar', {
    storage: diskStorage({
      destination: './uploads/avatars', // Carpeta donde se guardan los avatars
      filename: (req, file, cb) => {
        const randomName = Array(12)
          .fill(null)
          .map(() => Math.round(Math.random() * 16).toString(16))
          .join('');
        return cb(null, `${Date.now()}-${randomName}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
        return cb(new BadRequestException('Archivo de avatar inválido. Solo JPG o PNG.'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 3 * 1024 * 1024 },          // 👈 nuevo, 3MB
  }),
)
async crearUsuarioPorAdmin(
    @UploadedFile() file: Express.Multer.File,
    @Body() cuerpo: UserAdminRegisterDto,
  ) {
    if (!cuerpo || Object.keys(cuerpo).length === 0) {
    throw new BadRequestException('No se recibieron los datos del formulario (Body vacío).');
  }
    let pathAvatar = '';
    if (file) {
      pathAvatar = `/uploads/avatars/${file.filename}`;
    }
    // Le pasamos el cuerpo del formulario y la ruta del avatar procesada
  return this.usuariosService.crearUsuarioDesdeAdmin(cuerpo, pathAvatar);
}

  @Delete(':id')
  @UseGuards(TokenGuard, AdminGuard)
  async darDeBajaLogica(@Param('id') id: string) {
    return this.usuariosService.modificarEstadoActivo(id, false);
  }

  @Post(':id/reactivar')
  @UseGuards(TokenGuard, AdminGuard)
  async darDeAltaLogica(@Param('id') id: string) {
    return this.usuariosService.modificarEstadoActivo(id, true);
  }

  @Put(':id/perfil')
  @UseGuards(TokenGuard)
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