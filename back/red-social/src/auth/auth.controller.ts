import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Req, UnauthorizedException, UseGuards, UseInterceptors } from "@nestjs/common";
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
 @Post('registro')
  // 🔮 Interceptamos el archivo que venga bajo la llave 'avatar'
  @UseInterceptors(FileInterceptor('avatar', {
    storage: diskStorage({
      destination: './uploads/avatars', // Carpeta raíz donde se guardarán los archivos
      filename: (req, file, callback) => {
        // Generamos un nombre único con la fecha para que no se pisen
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        callback(null, `avatar-${uniqueSuffix}${ext}`);
      },
    }),
    fileFilter: (req, file, callback) => {
      // Validamos que sea estrictamente una imagen
      if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
        return callback(new Error('El archivo no es una imagen válida espectral'), false);
      }
      callback(null, true);
    }
  }))
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

    return { 
      mensaje: `Acceso otorgado con éxito.`,
      usuario: usuarioLogueado
    };
  }



  @Get('/check-email')
  async checkEmail(@Query('email') email: string) {
    // Le preguntamos al servicio si el email ya está registrado
    const userExists = await this.authService.findByEmail(email); 
    
    // Devolvemos un objeto JSON que Angular pueda entender claramente
    return { exists: !!userExists }; 
  }

@Post('/refrescar')
@UseGuards(TokenGuard)
async refrescar(@Req() req: any) {
  // 🕵️‍♂️ Investigamos qué metió tu Guard dentro de la Request
    console.log('--- REVISANDO CONTENIDO DEL REQ.USER ---', req.user);

    if (!req.user) {
      throw new UnauthorizedException('No se encontraron credenciales válidas en el espectro.');
    }

    // Le pasamos el req.user completo al servicio
    return this.authService.generarTokenDeRefresco(req.user);
}


  
  @Post('autorizar')
  @UseGuards(TokenGuard)
  @HttpCode(HttpStatus.OK) // Devolvemos un 200 OK
  async autorizar(@Req() req: any) {
    // El TokenGuard ya decodificó el token y guardó al usuario en req.user
    const usuarioLogueado = req.user; 
    
    console.log('--- VALIDACIÓN DE ACCESO ESPECTRAL ---');
    console.log('Token válido para el usuario:', usuarioLogueado.nombreUsuario);

    // Devolvemos los datos limpios del usuario al Frontend
    return {
      _id: usuarioLogueado._id,
      email: usuarioLogueado.email,
      nombreUsuario: usuarioLogueado.nombreUsuario,
      perfil: usuarioLogueado.perfil,
      avatarUrl: usuarioLogueado.avatarUrl || ''
    };
  }
}   