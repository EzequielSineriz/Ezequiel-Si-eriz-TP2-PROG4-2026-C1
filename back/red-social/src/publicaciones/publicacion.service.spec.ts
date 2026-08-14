import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ForbiddenException } from '@nestjs/common';
import { PublicacionService } from './publicacion.service';
import { Publicacion } from './publicacion.schema'; // Ajustado a tu ruta actual

describe('PublicacionService', () => {
  let service: PublicacionService;
  let publicacionModel: any;

  const mockPublicacion = {
    _id: 'post123',
    titulo: 'Post de prueba',
    autorId: 'user123',
  };

  const mockPublicacionModel = {
    findByIdAndUpdate: jest.fn(),
    exec: jest.fn(),
  };

  const mockUsuarioModel = {
    findById: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublicacionService,
        {
          provide: getModelToken(Publicacion.name),
          useValue: mockPublicacionModel,
        },
        {
          provide: getModelToken('Usuario'), // 👈 Usamos el string 'Usuario' directamente
          useValue: mockUsuarioModel,
        },
      ],
    }).compile();

    service = module.get<PublicacionService>(PublicacionService);
    publicacionModel = module.get(getModelToken(Publicacion.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('eliminar', () => {
    it('debería permitir eliminar si el usuario es el DUEÑO de la publicación', async () => {
      jest.spyOn(service, 'obtenerPorId').mockResolvedValue(mockPublicacion as any);

      mockPublicacionModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(true),
      });

      const usuarioLogueado = { _id: 'user123', perfil: 'user' };

      const resultado = await service.eliminar('post123', usuarioLogueado);

      expect(resultado).toEqual({ mensaje: 'Publicación eliminada con éxito.' });
      expect(mockPublicacionModel.findByIdAndUpdate).toHaveBeenCalledWith('post123', { eliminada: true });
    });

    it('debería permitir eliminar si el usuario es ADMIN (aunque no sea el dueño)', async () => {
      jest.spyOn(service, 'obtenerPorId').mockResolvedValue(mockPublicacion as any);

      mockPublicacionModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(true),
      });

      const adminLogueado = { _id: 'admin999', perfil: 'admin' };

      const resultado = await service.eliminar('post123', adminLogueado);

      expect(resultado).toEqual({ mensaje: 'Publicación eliminada con éxito.' });
    });

    it('debería lanzar ForbiddenException si NO es dueño ni ADMIN', async () => {
      jest.spyOn(service, 'obtenerPorId').mockResolvedValue(mockPublicacion as any);

      const terceroLogueado = { _id: 'hacker456', perfil: 'user' };

      await expect(service.eliminar('post123', terceroLogueado)).rejects.toThrow(ForbiddenException);
    });
  });
});