import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { sign } from 'jsonwebtoken';
import { UserRegisterDto } from '../usuarios/dto/create-user.dto';
import { UsuarioLoginDTO } from '../usuarios/dto/log-in.dto';
import { UsuariosService } from '../usuarios/usuario.service';

@Injectable()
export class AuthService {
  constructor(private readonly usuariosService: UsuariosService) {}

  async registrar(usuarioDto: UserRegisterDto, avatarUrl?: string) {
    const usuarioCreado = await this.usuariosService.registrarPublico(usuarioDto, avatarUrl);

    const payload = {
      email: usuarioCreado.email,
      nombreUsuario: usuarioCreado.nombreUsuario,
      perfil: usuarioCreado.perfil,
    };

    const token = sign(payload, process.env.CLAVE_SUPERSECRETA!, {
      algorithm: 'HS256',
      expiresIn: '30m',
    });

    return {
      token,
      user: {
        nombre: usuarioCreado.nombre,
        apellido: usuarioCreado.apellido,
        email: usuarioCreado.email,
        nombreUsuario: usuarioCreado.nombreUsuario,
        perfil: usuarioCreado.perfil,
        avatarUrl: usuarioCreado.avatarUrl,
      },
    };
  }

  async ingresar(loginDto: UsuarioLoginDTO) {
    const { loginIdentifier, password } = loginDto;

    const usuario = await this.usuariosService.buscarPorEmailOUsername(loginIdentifier);

    if (!usuario) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }
    if (!usuario.activo) {
      throw new UnauthorizedException('Tu cuenta ha sido deshabilitada. Contactá al administrador.');
    }

    const bcrypt = await import('bcrypt');
    const esPasswordValida = await bcrypt.compare(password, usuario.password);

    if (!esPasswordValida) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }

    const payload = {
      _id: usuario._id.toString(),
      email: usuario.email,
      nombreUsuario: usuario.nombreUsuario,
      perfil: usuario.perfil,
    };

    const token = sign(payload, process.env.CLAVE_SUPERSECRETA!, {
      algorithm: 'HS256',
      expiresIn: '30m',
    });

    return {
      token,
      user: {
        _id: usuario._id.toString(),
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        nombreUsuario: usuario.nombreUsuario,
        perfil: usuario.perfil,
        avatarUrl: usuario.avatarUrl,
      },
    };
  }

  findByEmail(email: string) {
    return this.usuariosService.findByEmail(email);
  }

  async generarTokenDeRefresco(payloadTokenAnterior: any) {
    const userId = payloadTokenAnterior?._id;
    const email = payloadTokenAnterior?.email;
    const nombreUsuario = payloadTokenAnterior?.nombreUsuario;
    const perfil = payloadTokenAnterior?.perfil;

    if (!userId) {
      throw new BadRequestException('No se pudo renovar la sesión. Volvé a iniciar sesión.');
    }

    const payload = {
      _id: userId.toString(),
      email: email || '',
      nombreUsuario: nombreUsuario || '',
      perfil: perfil || 'usuario',
    };

    const nuevoToken = sign(payload, process.env.CLAVE_SUPERSECRETA!, {
      algorithm: 'HS256',
      expiresIn: '30m',
    });

    return { token: nuevoToken };
  }
}