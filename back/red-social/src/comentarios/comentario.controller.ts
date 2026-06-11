import { Controller, Post, Body, Delete, Param, Req, UseGuards, Get, Put } from '@nestjs/common';
import { ComentarioService } from './comentario.service';
import { CreateComentarioDto } from './dtos/create-comentario.dto';
import { TokenGuard } from 'src/auth/token/token.guard';

@Controller('comentarios')
@UseGuards(TokenGuard)
export class ComentarioController {
  constructor(private readonly comentarioService: ComentarioService) {}

  @Post()
  crear(@Body() createDto: CreateComentarioDto, @Req() req: any) {
    const usuarioId = String(req.user._id);
    return this.comentarioService.crear(createDto, usuarioId);
  }

  @Get('publicacion/:pubId')
  obtenerPorPublicacion(@Param('pubId') pubId: string) {
    return this.comentarioService.obtenerPorPublicacion(pubId);
  }

  @Get('')
  traerTodos() {
    return this.comentarioService.obtenerTodos();
  }


  @Delete(':id')
  eliminar(@Param('id') id: string, @Req() req: any) {
    const usuarioId = String(req.user._id);
    return this.comentarioService.eliminar(id, usuarioId);
  }

  @Post(':id/like')
  darLike(@Param('id') id: string, @Req() req: any) {
    const usuarioId = String(req.user._id);
    return this.comentarioService.darLike(id, usuarioId);
  }

  @Post(':id/dislike')
  darDislike(@Param('id') id: string, @Req() req: any) {
    const usuarioId = String(req.user._id);
    return this.comentarioService.darDislike(id, usuarioId);
  }


    @Put('/:id')
    @UseGuards(TokenGuard)
    async modificarComentario(
    @Param('id') id: string,
    @Body('contenido') nuevoContenido: string,
    @Req() req: any
    ) {
    return await this.comentarioService.modificar(id, nuevoContenido, req.user._id);
    }
}