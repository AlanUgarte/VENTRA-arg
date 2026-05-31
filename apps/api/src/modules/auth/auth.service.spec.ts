import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { createPrismaMock } from '../../test/prisma.mock';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');
const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let prisma: ReturnType<typeof createPrismaMock>;
  let jwtService: jest.Mocked<JwtService>;

  const mockTokens = { accessToken: 'access', refreshToken: 'refresh' };

  beforeEach(async () => {
    prisma = createPrismaMock();

    const jwtMock = {
      signAsync: jest.fn().mockResolvedValue('mocked_token'),
      verifyAsync: jest.fn(),
    };

    const configMock = {
      get: jest.fn((key: string, def?: any) => {
        const map: Record<string, string> = {
          JWT_SECRET: 'test_secret',
          JWT_REFRESH_SECRET: 'test_refresh',
          JWT_EXPIRES_IN: '15m',
          JWT_REFRESH_EXPIRES_IN: '7d',
        };
        return map[key] ?? def;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtMock },
        { provide: ConfigService, useValue: configMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => jest.clearAllMocks());

  // ── register ──────────────────────────────────────────────────────────────

  describe('register', () => {
    const dto = {
      name: 'Juan Pérez',
      businessName: 'Kiosco La Esquina',
      email: 'juan@test.com',
      password: 'pass1234',
    };

    it('lanza ConflictException si el email ya existe', async () => {
      (prisma.user!.findFirst as jest.Mock).mockResolvedValueOnce({ id: 'existing' });
      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });

    it('registra correctamente y devuelve tokens', async () => {
      (prisma.user!.findFirst as jest.Mock).mockResolvedValueOnce(null);
      (prisma.tenant!.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (bcryptMock.hash as jest.Mock).mockResolvedValue('hashed_pass');

      const fakeTenant = { id: 'tenant1', name: dto.businessName, slug: 'kiosco-la-esquina' };
      const fakeUser = { id: 'user1', tenantId: 'tenant1', email: dto.email, role: Role.OWNER };

      (prisma.$transaction as jest.Mock).mockImplementationOnce(async (cb) => {
        return cb({
          tenant: { create: jest.fn().mockResolvedValue(fakeTenant) },
          user: { create: jest.fn().mockResolvedValue(fakeUser) },
          subscription: { create: jest.fn().mockResolvedValue({}) },
          rubro: { createMany: jest.fn().mockResolvedValue({}) },
          paymentMethod: { createMany: jest.fn().mockResolvedValue({}) },
        });
      });

      (prisma.refreshToken!.create as jest.Mock).mockResolvedValue({});

      const result = await service.register(dto);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });

  // ── login ────────────────────────────────────────────────────────────────

  describe('login', () => {
    const dto = { email: 'juan@test.com', password: 'pass1234' };

    it('lanza UnauthorizedException si el usuario no existe', async () => {
      (prisma.user!.findFirst as jest.Mock).mockResolvedValueOnce(null);
      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('lanza UnauthorizedException si la contraseña es incorrecta', async () => {
      (prisma.user!.findFirst as jest.Mock).mockResolvedValueOnce({
        id: 'u1', password: 'hashed', tenantId: 't1', role: Role.OWNER, email: dto.email,
      });
      (bcryptMock.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('devuelve tokens si las credenciales son correctas', async () => {
      (prisma.user!.findFirst as jest.Mock).mockResolvedValueOnce({
        id: 'u1', password: 'hashed', tenantId: 't1', role: Role.OWNER, email: dto.email, tenant: {},
      });
      (bcryptMock.compare as jest.Mock).mockResolvedValue(true);
      (prisma.refreshToken!.create as jest.Mock).mockResolvedValue({});

      const result = await service.login(dto);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });

  // ── refresh ──────────────────────────────────────────────────────────────

  describe('refresh', () => {
    it('lanza UnauthorizedException si el token es inválido', async () => {
      (jwtService.verifyAsync as jest.Mock).mockRejectedValueOnce(new Error('invalid'));
      await expect(service.refresh('bad_token')).rejects.toThrow(UnauthorizedException);
    });

    it('lanza UnauthorizedException si el token no está en DB', async () => {
      (jwtService.verifyAsync as jest.Mock).mockResolvedValueOnce({ sub: 'u1', tenantId: 't1', role: Role.OWNER, email: 'x' });
      (prisma.refreshToken!.findFirst as jest.Mock).mockResolvedValueOnce(null);
      await expect(service.refresh('token')).rejects.toThrow(UnauthorizedException);
    });

    it('rota el token correctamente', async () => {
      const payload = { sub: 'u1', tenantId: 't1', role: Role.OWNER, email: 'x@x.com' };
      (jwtService.verifyAsync as jest.Mock).mockResolvedValueOnce(payload);
      (prisma.refreshToken!.findFirst as jest.Mock).mockResolvedValueOnce({
        id: 'rt1', userId: 'u1', expiresAt: new Date(Date.now() + 86400000),
      });
      (prisma.user!.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'u1', isActive: true, tenantId: 't1', role: Role.OWNER, email: 'x@x.com',
      });
      (prisma.refreshToken!.delete as jest.Mock).mockResolvedValue({});
      (prisma.refreshToken!.create as jest.Mock).mockResolvedValue({});

      const result = await service.refresh('valid_token');
      expect(result).toHaveProperty('accessToken');
      expect(prisma.refreshToken!.delete).toHaveBeenCalledWith({ where: { id: 'rt1' } });
    });
  });
});
