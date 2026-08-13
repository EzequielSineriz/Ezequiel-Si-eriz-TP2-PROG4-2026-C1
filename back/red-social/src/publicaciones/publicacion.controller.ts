import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { TokenGuard } from 'src/auth/token/token.guard';
import { PublicacionService } from './publicacion.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import { UpdatePublicacionDto } from './dto/update-publicacion.dto';

@Controller('publicaciones')
@UseGuards(TokenGuard)
export class PublicacionController {
  constructor(private readonly publicacionService: PublicacionService) {}

 @Post()
 @UseInterceptors(
  FileInterceptor('imagen', {
    storage: diskStorage({
      destination: './uploads/publicaciones',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `post-${uniqueSuffix}${ext}`);
      },
     }),
     fileFilter: (req, file, callback) => {          // 👈 nuevo
      if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
        return callback(new BadRequestException('Solo se permiten imágenes (jpg, png, webp)'), false);
      }
      callback(null, true);
     },
     limits: { fileSize: 5 * 1024 * 1024 },          // 👈 nuevo, 5MB
    }),
  )
  crear(
    @Body() createDto: CreatePublicacionDto,
    @Req() req: any, // Capturamos la request para sacar al usuario inyectado por el Guard
    @UploadedFile() file: Express.Multer.File,
  ) {
    const usuarioId = req.user._id; // Sacamos el ID del Token de forma segura
    const imagenUrl = file
      ? `/uploads/publicaciones/${file.filename}`
      : undefined;

    return this.publicacionService.crear(createDto, usuarioId, imagenUrl);
  }
  @Post('/:id/like')
  async darLike(@Param('id') id: string, @Req() req: any) {
    const usuarioId = String(req.user._id); // Extraído del token de forma segura
    return this.publicacionService.darLike(id, usuarioId);
  }

  @Post('/:id/dislike')
  async darDislike(@Param('id') id: string, @Req() req: any) {
    const usuarioId = String(req.user._id); // Extraído del token de forma segura
    return this.publicacionService.darDislike(id, usuarioId);
  }

  @Get()
  obtenerTodas(
    @Query('sort') sort?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,) {

    const limiteNumerico = limit ? Number(limit) : 5;
    const offsetNumerico = offset ? Number(offset) : 0;
    
    console.log(`[BACKEND CONTROLLER] Despachando Feed -> Orden: ${sort || 'fecha'}, Limit: ${limiteNumerico}, Offset: ${offsetNumerico}`);
    return this.publicacionService.obtenerTodas(sort, limiteNumerico, offsetNumerico);
  }

  @Get('perfil/metricas')
  async obtenerMetricasPerfil(@Req() req: any) {
    const usuarioId = req.user._id;
    console.log('--- SOLICITUD DE MÉTRICAS PARANORMALES ---');
    return await this.publicacionService.obtenerMetricasPerfilUsuario(
      usuarioId,
    );
  }

  @Get('/:id')
  obtenerPorId(@Param('id') id: string) {
    return this.publicacionService.obtenerPorId(id);
  }

  @Put('/:id')
  actualizar(
    @Param('id') id: string,
    @Body() updateDto: UpdatePublicacionDto,
    @Req() req: any,
  ) {
    const usuarioId = req.user._id;
    return this.publicacionService.actualizar(id, updateDto, usuarioId);
  }

  @Delete('/:id')
  eliminar(@Param('id') id: string, @Req() req: any) {
    const usuario= req.user;
    return this.publicacionService.eliminar(id, usuario);
  }
}
