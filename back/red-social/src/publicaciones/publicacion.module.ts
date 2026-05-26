import { Module } from '@nestjs/common';
import {  PublicacionService } from './publicacion.service';
import { PublicacionController } from './publicacion.controller';
import { Publicacion, PublicacionSchema } from './publicacion.schema';
import { MongooseModule } from '@nestjs/mongoose';



@Module({
    imports: [
        MongooseModule.forFeature([{ name: Publicacion.name, schema: PublicacionSchema }]),
    ],
    exports: [],
    controllers: [PublicacionController],
    providers: [PublicacionService],
})
export class PublicacionModule { }
