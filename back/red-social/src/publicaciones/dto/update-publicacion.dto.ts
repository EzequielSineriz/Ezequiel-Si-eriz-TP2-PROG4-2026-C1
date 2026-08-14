import { PartialType } from '@nestjs/swagger'; // 👈 antes era de @nestjs/mapped-types
import { CreatePublicacionDto } from "./create-publicacion.dto";

export class UpdatePublicacionDto extends PartialType(CreatePublicacionDto) {}