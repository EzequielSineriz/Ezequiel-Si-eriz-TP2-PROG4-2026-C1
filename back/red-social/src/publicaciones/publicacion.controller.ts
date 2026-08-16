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
import * as requestConUsuarioInterface from 'src/auth/request-con-usuario.interface';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Publicaciones')
@ApiBearerAuth('access-token')
@Controller('publicaciones')
@UseGuards(TokenGuard)
export class PublicacionController {

  constructor(private readonly publicacionService: PublicacionService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una publicación nueva' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Publicación creada.' })
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
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return callback(new BadRequestException('Solo se permiten imágenes (jpg, png, webp)'), false);
        }
        callback(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  crear(
    @Body() createDto: CreatePublicacionDto,
    @Req() req: requestConUsuarioInterface.RequestConUsuario,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const usuarioId = req.user._id;
    const imagenUrl = file ? `/uploads/publicaciones/${file.filename}` : undefined;

    return this.publicacionService.crear(createDto, usuarioId, imagenUrl);
  }

  @Post('/:id/like')
  @ApiOperation({ summary: 'Dar/quitar like a una publicación' })
  @ApiResponse({ status: 200, description: 'Publicación actualizada con el like.' })
  @ApiResponse({ status: 404, description: 'Publicación no encontrada.' })
  async darLike(@Param('id') id: string, @Req() req: requestConUsuarioInterface.RequestConUsuario) {
    const usuarioId = String(req.user._id);
    return await this.publicacionService.darLike(id, usuarioId);
  }

  @Post('/:id/dislike')
  @ApiOperation({ summary: 'Dar/quitar dislike a una publicación' })
  @ApiResponse({ status: 200, description: 'Publicación actualizada con el dislike.' })
  @ApiResponse({ status: 404, description: 'Publicación no encontrada.' })
  async darDislike(@Param('id') id: string, @Req() req: requestConUsuarioInterface.RequestConUsuario) {
    const usuarioId = String(req.user._id);
    return await this.publicacionService.darDislike(id, usuarioId);
  }

  @Get()
  @ApiOperation({ summary: 'Feed de publicaciones', description: 'Ordenable por fecha o likes, paginado.' })
  @ApiResponse({ status: 200, description: 'Listado de publicaciones.' })
  obtenerTodas(
    @Query('sort') sort?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const limiteNumerico = limit ? Number(limit) : 5;
    const offsetNumerico = offset ? Number(offset) : 0;

    return this.publicacionService.obtenerTodas(sort, limiteNumerico, offsetNumerico);
  }

  @Get('perfil/metricas')
  @ApiOperation({ summary: 'Métricas del perfil propio', description: 'Últimas publicaciones, totales y likes acumulados.' })
  @ApiResponse({ status: 200, description: 'Métricas del usuario logueado.' })
  async obtenerMetricasPerfil(@Req() req: requestConUsuarioInterface.RequestConUsuario) {
    const usuarioId = req.user._id;
    return await this.publicacionService.obtenerMetricasPerfilUsuario(usuarioId);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Obtener una publicación por ID' })
  @ApiResponse({ status: 200, description: 'Publicación encontrada.' })
  @ApiResponse({ status: 404, description: 'No existe o fue eliminada.' })
  obtenerPorId(@Param('id') id: string) {
    return this.publicacionService.obtenerPorId(id);
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Editar una publicación', description: 'Solo el dueño puede editarla.' })
  @ApiResponse({ status: 200, description: 'Publicación actualizada.' })
  @ApiResponse({ status: 401, description: 'No sos el dueño de esta publicación.' })
  @ApiResponse({ status: 404, description: 'Publicación no encontrada.' })
  actualizar(
    @Param('id') id: string,
    @Body() updateDto: UpdatePublicacionDto,
    @Req() req: requestConUsuarioInterface.RequestConUsuario,
  ) {
    const usuarioId = req.user._id;
    return this.publicacionService.actualizar(id, updateDto, usuarioId);
  }

  @Delete('/:id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Eliminar una publicación (Baja lógica)' })
  @ApiResponse({ status: 200, description: 'Publicación eliminada con éxito.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 403, description: 'No tenés permisos para eliminar esta publicación.' })
  @ApiResponse({ status: 404, description: 'Publicación no encontrada.' })
  eliminar(@Param('id') id: string, @Req() req: any) {
    const usuario = req.user;
    return this.publicacionService.eliminar(id, usuario);
  }
}