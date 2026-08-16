import { Controller, Post, Body, Delete, Param, Req, UseGuards, Get, Put, Query } from '@nestjs/common';
import { ComentarioService } from './comentario.service';
import { CreateComentarioDto } from './dtos/create-comentario.dto';
import { TokenGuard } from 'src/auth/token/token.guard';
import * as requestConUsuarioInterface from 'src/auth/request-con-usuario.interface';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotificationsGateway } from 'src/notificaciones/notificaciones.gateway';

@ApiTags('Comentarios')
@ApiBearerAuth('access-token')
@Controller('comentarios')
@UseGuards(TokenGuard)
export class ComentarioController {
  constructor(
    private readonly comentarioService: ComentarioService,
    private readonly webSocketGateway: NotificationsGateway
  ) {}

  @ApiOperation({ summary: 'Crear un comentario en una publicación' })
  @ApiResponse({ status: 201, description: 'Comentario creado.' })
  @Post()
  async crear(@Body() createDto: CreateComentarioDto, @Req() req: requestConUsuarioInterface.RequestConUsuario) {
    const usuarioId = String(req.user._id);
    
    // 1. Guardar el comentario y obtener la publicación/datos actualizados
    const resultado = await this.comentarioService.crear(createDto, usuarioId);

    // 2. Si el servicio retorna la publicación actualizada o tiene la pubId asociada,
    // se obtiene y se emite para refrescar los contadores en todos los clientes:
    if (resultado && resultado.publicacionActualizada) {
      this.webSocketGateway.server.emit('publicacionActualizada', resultado.publicacionActualizada);
    }

    return resultado;
  }

  @Get('publicacion/:pubId')
  @ApiOperation({ summary: 'Listar comentarios de una publicación puntual' })
  @ApiResponse({ status: 200, description: 'Comentarios de esa publicación.' })
  obtenerPorPublicacion(@Param('pubId') pubId: string) {
    return this.comentarioService.obtenerPorPublicacion(pubId);
  }

  @Get('')
  @ApiOperation({ summary: 'Listar todos los comentarios (paginado)' })
  @ApiResponse({ status: 200, description: 'Listado de comentarios.' })
  traerTodos(@Query('limit') limit?: string, @Query('offset') offset?: string) {
    return this.comentarioService.obtenerTodos(
      limit ? Number(limit) : 20,
      offset ? Number(offset) : 0,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un comentario', description: 'Dueño o ADMIN.' })
  @ApiResponse({ status: 200, description: 'Comentario eliminado.' })
  @ApiResponse({ status: 401, description: 'No tenés permisos para eliminarlo.' })
  async eliminar(@Param('id') id: string, @Req() req: requestConUsuarioInterface.RequestConUsuario) {
    const resultado = await this.comentarioService.eliminar(id, req.user);

    if (resultado && resultado.publicacionActualizada) {
      this.webSocketGateway.server.emit('publicacionActualizada', resultado.publicacionActualizada);
    }

    return resultado;
  }

  @Post(':id/like')
  @ApiOperation({ summary: 'Dar/quitar like a un comentario' })
  @ApiResponse({ status: 200, description: 'Comentario actualizado.' })
  darLike(@Param('id') id: string, @Req() req: requestConUsuarioInterface.RequestConUsuario) {
    const usuarioId = String(req.user._id);
    return this.comentarioService.darLike(id, usuarioId);
  }

  @Post(':id/dislike')
  @ApiOperation({ summary: 'Dar/quitar dislike a un comentario' })
  @ApiResponse({ status: 200, description: 'Comentario actualizado.' })
  darDislike(@Param('id') id: string, @Req() req: requestConUsuarioInterface.RequestConUsuario) {
    const usuarioId = String(req.user._id);
    return this.comentarioService.darDislike(id, usuarioId);
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Editar el contenido de un comentario propio' })
  @ApiResponse({ status: 200, description: 'Comentario actualizado.' })
  async modificarComentario(
    @Param('id') id: string,
    @Body('contenido') nuevoContenido: string,
    @Req() req: requestConUsuarioInterface.RequestConUsuario
  ) {
    return await this.comentarioService.modificar(id, nuevoContenido, req.user._id);
  }
}