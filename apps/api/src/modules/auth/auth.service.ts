import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

const DEFAULT_RUBROS = [
  { name: 'Alimentos', color: '#0d9f6e', order: 0 },
  { name: 'Bebidas', color: '#2f6fed', order: 1 },
  { name: 'Limpieza', color: '#06b6d4', order: 2 },
  { name: 'Chocolates', color: '#92400e', order: 3 },
  { name: 'Perfumería', color: '#d946a8', order: 4 },
  { name: 'Galletitas', color: '#d99a1c', order: 5 },
  { name: 'Congelados', color: '#3aa0d4', order: 6 },
  { name: 'Fiambrería', color: '#f0653e', order: 7 },
];

const DEFAULT_PAYMENT_METHODS = [
  'Efectivo',
  'Transferencia',
  'Tarjeta de débito',
  'Tarjeta de crédito',
  'Mercado Pago',
];

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) throw new ConflictException('Email ya registrado');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const baseSlug = this.toSlug(dto.businessName);
    const slugExists = await this.prisma.tenant.findUnique({ where: { slug: baseSlug } });
    const slug = slugExists ? `${baseSlug}-${Date.now()}` : baseSlug;
    const trialEndsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    const { tenant, user } = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({ data: { name: dto.businessName, slug } });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          name: dto.name,
          email: dto.email.toLowerCase(),
          password: passwordHash,
          role: Role.OWNER,
        },
      });

      await tx.subscription.create({
        data: { tenantId: tenant.id, plan: 'TRIAL', status: 'TRIAL', trialEndsAt },
      });

      await tx.rubro.createMany({
        data: DEFAULT_RUBROS.map((r) => ({ ...r, tenantId: tenant.id })),
      });

      await tx.paymentMethod.createMany({
        data: DEFAULT_PAYMENT_METHODS.map((name, i) => ({
          tenantId: tenant.id,
          name,
          isDefault: true,
          order: i,
        })),
      });

      return { tenant, user };
    });

    return this.issueTokens(user.id, tenant.id, Role.OWNER, user.email);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email.toLowerCase(), isActive: true },
      include: { tenant: true },
    });
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');

    return this.issueTokens(user.id, user.tenantId, user.role, user.email);
  }

  async refresh(rawToken: string) {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync(rawToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const tokenHash = this.hash(rawToken);
    const stored = await this.prisma.refreshToken.findFirst({
      where: { userId: payload.sub, tokenHash },
    });
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expirado');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user?.isActive) throw new UnauthorizedException();

    await this.prisma.refreshToken.delete({ where: { id: stored.id } });
    return this.issueTokens(user.id, user.tenantId, user.role, user.email);
  }

  async logout(userId: string, rawToken: string) {
    const tokenHash = this.hash(rawToken);
    await this.prisma.refreshToken.deleteMany({ where: { userId, tokenHash } });
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isSuperAdmin: true,
        createdAt: true,
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            subscription: {
              select: {
                plan: true,
                status: true,
                trialEndsAt: true,
                currentPeriodEnd: true,
              },
            },
          },
        },
      },
    });
  }

  private async issueTokens(userId: string, tenantId: string, role: Role, email: string) {
    const payload: JwtPayload = { sub: userId, tenantId, role, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRES_IN', '15m'),
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: this.hash(refreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  }

  private hash(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private toSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 50);
  }
}
