import { Body, Controller, Delete, Get, Param, Post, Put, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { TokenGuard } from "src/auth/token/token.guard";
import { PublicacionService } from "./publicacion.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { CreatePublicacionDto } from "./dto/create-publicacion.dto";
import { UpdatePublicacionDto } from "./dto/update-publicacion.dto";

@Controller('publicaciones')
@UseGuards(TokenGuard)
export class PublicacionController {
  constructor(private readonly publicacionService: PublicacionService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: diskStorage({
        destination: './uploads/publicaciones', // Carpeta para las fotos de los posts
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `post-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  crear(
    @Body() createDto: CreatePublicacionDto,
    @Req() req: any, // Capturamos la request para sacar al usuario inyectado por el Guard
    @UploadedFile() file: Express.Multer.File,
  ) {
    const usuarioId = req.user._id; // Sacamos el ID del Token de forma segura
    const imagenUrl = file ? `/uploads/publicaciones/${file.filename}` : undefined;
    
    return this.publicacionService.crear(createDto, usuarioId, imagenUrl);
  }

  @Get()
  obtenerTodas() {
    return this.publicacionService.obtenerTodas();
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
    const usuarioId = req.user._id;
    return this.publicacionService.eliminar(id, usuarioId);
  }

  @Put('/:id/like')
async darLike(@Param('id') id: string, @Req() req: any) {
  const usuarioId = req.user._id; // Extraído del token de forma segura
  return this.publicacionService.darLike(id, usuarioId);
}

@Put('/:id/dislike')
async darDislike(@Param('id') id: string, @Req() req: any) {
  const usuarioId = req.user._id;
  return this.publicacionService.darDislike(id, usuarioId);
}
}