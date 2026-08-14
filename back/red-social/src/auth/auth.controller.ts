import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Req, UnauthorizedException, UseGuards, UseInterceptors } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UploadedFile } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UserRegisterDto } from "src/usuarios/dto/create-user.dto";
import { UsuarioLoginDTO } from "src/usuarios/dto/log-in.dto";
import { TokenGuard } from "./token/token.guard";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import * as requestConUsuarioInterface from "./request-con-usuario.interface";


@ApiTags('Autenticación')
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}  



@Post('registro')
@ApiOperation({ summary: 'Registrar un nuevo usuario', description: 'El perfil siempre queda como "usuario", sin excepción.' })
@ApiConsumes('multipart/form-data')
@ApiBody({
    schema: {
      type: 'object',
      properties: {
        nombre: { type: 'string' },
        apellido: { type: 'string' },
        email: { type: 'string' },
        nombreUsuario: { type: 'string' },
        password: { type: 'string' },
        fechaNacimiento: { type: 'string', format: 'date' },
        avatar: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Usuario creado, devuelve token y datos del usuario.' })
  @ApiResponse({ status: 400, description: 'Email o nombre de usuario ya registrados, o datos inválidos.' })
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
  @ApiOperation({ summary: 'Iniciar sesión con email/username + password' })
  @ApiResponse({ status: 200, description: 'Login correcto, devuelve token y datos del usuario.' })
  @ApiResponse({ status: 401, description: 'Credenciales incorrectas o cuenta deshabilitada.' })
  @HttpCode(HttpStatus.OK)
  ingresar(@Body() usuario: UsuarioLoginDTO) {
    return this.authService.ingresar(usuario);
  }

  @Get('/seguro')
  @ApiOperation({ summary: 'Acceder a una ruta segura' })
  @ApiResponse({ status: 200, description: 'Acceso otorgado con éxito.' })
  @UseGuards(TokenGuard)
  rutaSegura(@Req() req: requestConUsuarioInterface.RequestConUsuario) {
    // Recuperamos los datos que el Guard guardó en la request
    const usuarioLogueado = req.user; 
    
    console.log('Datos del usuario desde el token:', usuarioLogueado);

    return { 
      mensaje: `Acceso otorgado con éxito.`,
      usuario: usuarioLogueado
    };
  }



  @Get('/check-email')
  @ApiOperation({ summary: 'Verificar si un email ya está registrado' })
  @ApiResponse({ status: 200, description: '{ exists: boolean }' })
  async checkEmail(@Query('email') email: string) {
    // Le preguntamos al servicio si el email ya está registrado
    const userExists = await this.authService.findByEmail(email); 
    
    // Devolvemos un objeto JSON que Angular pueda entender claramente
    return { exists: !!userExists }; 
  }

  @Post('/refrescar')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Renovar el token antes de que expire' })
  @ApiResponse({ status: 200, description: 'Token nuevo generado.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
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
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Devuelve los datos del usuario autenticado a partir del token' })
  @ApiResponse({ status: 200, description: 'Datos del usuario logueado.' })
  @ApiResponse({ status: 401, description: 'Token inválido o ausente.' })
  @UseGuards(TokenGuard)
  @HttpCode(HttpStatus.OK)
  async autorizar(@Req() req: requestConUsuarioInterface.RequestConUsuario) {
   const usuarioLogueado = req.user;
    return {
      _id: usuarioLogueado._id,
      email: usuarioLogueado.email,
      nombreUsuario: usuarioLogueado.nombreUsuario,
      perfil: usuarioLogueado.perfil,
      avatarUrl: (usuarioLogueado as any).avatarUrl || ''
    };
  }

  
}   