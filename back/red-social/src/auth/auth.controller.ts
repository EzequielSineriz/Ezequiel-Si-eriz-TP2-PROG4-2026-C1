import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards, UseInterceptors } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UploadedFile } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UserRegisterDto } from "src/usuarios/dto/create-user.dto";
import { UsuarioLoginDTO } from "src/usuarios/dto/log-in.dto";
import { TokenGuard } from "./token/token.guard";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}  
  @Post('/registro')
  // 1. Interceptamos el archivo con la clave 'avatar' (el mismo nombre que usará el Front en el FormData)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars', // Carpeta local donde se guardarán las fotos
        filename: (req, file, callback) => {
          // Generamos un nombre único metiendo la fecha actual para evitar colisiones
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  registrar(
    @Body() usuario: UserRegisterDto, 
    @UploadedFile() file: Express.Multer.File // Capturamos el archivo procesado
  ) {
    // Si subieron un archivo, le pasamos la ruta al servicio para guardarla en la BD
    const avatarUrl = file ? `/uploads/avatars/${file.filename}` : '';
    return this.authService.registrar(usuario, avatarUrl);
  }

  @Post('/ingresar')
  @HttpCode(HttpStatus.OK) // Forzamos un 200 OK en vez de 201 Created (Semántica limpia de APIs)
  ingresar(@Body() usuario: UsuarioLoginDTO) {
    return this.authService.ingresar(usuario);
  }

  @Get('/seguro')
  @UseGuards(TokenGuard)
  rutaSegura(@Req() req: any) {
    // Recuperamos los datos que el Guard guardó en la request
    const usuarioLogueado = req.user; 
    
    console.log('Datos del usuario desde el token:', usuarioLogueado);
    // Ahora tenés acceso a:
    // usuarioLogueado._id
    // usuarioLogueado.email
    // usuarioLogueado.perfil (usuario/administrador)

    return { 
      mensaje: `Acceso otorgado con éxito.`,
      usuario: usuarioLogueado
    };
  }

  
  
}   