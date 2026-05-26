import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { sign } from "jsonwebtoken";
import { Model } from "mongoose";
import { UserRegisterDto } from "src/usuarios/dto/create-user.dto";
import { UsuarioLoginDTO } from "src/usuarios/dto/log-in.dto";
import { Usuario } from "src/usuarios/usuario.schema";
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(@InjectModel(Usuario.name) private UsuarioModel: Model<Usuario>) {

    }
    async registrar(usuarioDto: UserRegisterDto, avatarUrl?: string) {
    const { email, nombreUsuario, password } = usuarioDto;

    // 1. Verificar si el correo o usuario ya existen.
    const existeUsuario = await this.UsuarioModel.findOne({
      $or: [{ email }, { nombreUsuario }]
    });

    if (existeUsuario) {
      throw new BadRequestException('El correo o el nombre de usuario ya están registrados.');
    }

    // 2. Encriptar o Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordEncriptada = await bcrypt.hash(password, salt);

    // 3. Crear el usuario en la base de datos
    // Pasamos todas las propiedades, pisamos la contraseña por la encriptada y agregamos la URL de la imagen
    const nuevoUsuario = new this.UsuarioModel({
      ...usuarioDto,
      password: passwordEncriptada,
      avatarUrl: avatarUrl || '', // Viene del controlador (Multer)
    });

    const usuarioCreado = await nuevoUsuario.save();

    // 4. Generar el Token JWT con los CLAIMS solicitados (Sprint 1 y 3)
    const payload = {
      _id: usuarioCreado._id,
      email: usuarioCreado.email,
      nombreUsuario: usuarioCreado.nombreUsuario,
      perfil: usuarioCreado.perfil, // ¡Clave para el Sprint 4 (Admin/Usuario)!
    };

    const token = sign(payload, process.env.CLAVE_SUPERSECRETA || 'paranoiac_secret_key', {
      algorithm: 'HS256',
      expiresIn: '15m', 
    });

    //  Devuelve los datos del usuario (o el token)
    return {
      token,
      user: {
        _id: usuarioCreado._id,
        nombre: usuarioCreado.nombre,
        apellido: usuarioCreado.apellido,
        email: usuarioCreado.email,
        nombreUsuario: usuarioCreado.nombreUsuario,
        perfil: usuarioCreado.perfil,
        avatarUrl: usuarioCreado.avatarUrl
      }
    };
  }

  async ingresar(loginDto: UsuarioLoginDTO) {
    const { loginIdentifier, password } = loginDto;
    // Nota: 'loginIdentifier' es el email unico

    // 1. Buscar al usuario por email o nombre de usuario (ambos únicos)
    const usuario = await this.UsuarioModel.findOne({
      $or: [{ email: loginIdentifier }, { nombreUsuario: loginIdentifier }]
    });

    // Si no existe el usuario, tiramos 401 Unauthorized de una
    if (!usuario) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }

    // 2. Verificar contraseña encriptada (Dos pasos)
    const esPasswordValida = await bcrypt.compare(password, usuario.password);
    
    if (!esPasswordValida) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }

    // 3. Si es válido, generamos su token de acceso por 15 minutos
    const payload = {
      _id: usuario._id,
      email: usuario.email,
      nombreUsuario: usuario.nombreUsuario,
      perfil: usuario.perfil,
    };

    const token = sign(payload, process.env.CLAVE_SUPERSECRETA || 'paranoiac_secret_key', {
      algorithm: 'HS256',
      expiresIn: '15m',
    });

    // Retornamos token y datos solicitados por la consigna
    return {
      token,
      user: {
        _id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        nombreUsuario: usuario.nombreUsuario,
        perfil: usuario.perfil,
        avatarUrl: usuario.avatarUrl
      }
    };
  }

}