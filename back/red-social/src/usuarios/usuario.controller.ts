import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { UsuariosService } from "./usuario.service";
import { AdminGuard } from "src/auth/admin/admin.guard";
import { TokenGuard } from "src/auth/token/token.guard";
import { UserAdminRegisterDto } from "./dto/admin-create-user.dto";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";



@ApiTags('Usuarios')
@ApiBearerAuth('access-token')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar usuarios (paginado)', description: 'Solo ADMIN' })
  @ApiResponse({ status: 200, description: 'Listado de usuarios sin el campo password.' })
  @ApiResponse({ status: 403, description: 'No tenés permisos de administrador.' })
  @UseGuards(TokenGuard, AdminGuard)
  async listarTodos() {
    return this.usuariosService.listarTodosLosUsuarios();
  }


 @Post('admin-alta')
 @ApiConsumes('multipart/form-data')
 @ApiResponse({ status: 201, description: 'Usuario creado.' })
 @ApiResponse({ status: 400, description: 'Email o nombre de usuario ya registrados.' })
 @ApiResponse({ status: 403, description: 'No tenés permisos de administrador.' })
 @UseGuards(TokenGuard, AdminGuard)
 @ApiOperation({ summary: 'Crear un usuario desde el panel de admin', description: 'Solo ADMIN. Acá sí se puede elegir el perfil (usuario/admin).' })
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
  @ApiOperation({ summary: 'Deshabilitar (baja lógica) un usuario', description: 'Solo ADMIN' })
  @ApiResponse({ status: 200, description: 'Usuario deshabilitado.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  @UseGuards(TokenGuard, AdminGuard)
  async darDeBajaLogica(@Param('id') id: string) {
    return this.usuariosService.modificarEstadoActivo(id, false);
  }

  @Post(':id/reactivar')
  @ApiOperation({ summary: 'Reactivar un usuario deshabilitado', description: 'Solo ADMIN' })
  @ApiResponse({ status: 200, description: 'Usuario reactivado.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  @UseGuards(TokenGuard, AdminGuard)
  async darDeAltaLogica(@Param('id') id: string) {
    return this.usuariosService.modificarEstadoActivo(id, true);
  }

  @Put(':id/perfil')
  @ApiOperation({ summary: 'Actualizar el perfil de un usuario', description: 'Solo el usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil actualizado.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
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
      limits: { fileSize: 3 * 1024 * 1024 },
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