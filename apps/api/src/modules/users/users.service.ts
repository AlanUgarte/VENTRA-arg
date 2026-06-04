import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { MAX_USERS_BY_PLAN } from '../billing/plans.config';
import { EmailService } from '../email/email.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private email: EmailService,
  ) {}

  findAll(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(tenantId: string, dto: CreateUserDto) {
    // Check plan user limit
    const sub = await this.prisma.subscription.findUnique({ where: { tenantId } });
    const maxUsers = MAX_USERS_BY_PLAN[sub?.plan ?? 'TRIAL'] ?? 1;
    const currentCount = await this.prisma.user.count({
      where: { tenantId, isActive: true },
    });
    if (currentCount >= maxUsers) {
      const planName = sub?.plan === 'BASIC' ? 'Básico' : sub?.plan ?? 'actual';
      throw new ForbiddenException(
        `Tu plan ${planName} permite máximo ${maxUsers} usuario(s). Actualizá al Plan PRO para agregar empleados.`,
      );
    }

    const exists = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email: dto.email.toLowerCase() } },
    });
    if (exists) throw new ConflictException('Email ya usado en este negocio');

    const password = await bcrypt.hash(dto.password, 12);
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true } });

    const newUser = await this.prisma.user.create({
      data: {
        tenantId,
        name: dto.name,
        email: dto.email.toLowerCase(),
        password,
        role: dto.role ?? Role.CASHIER,
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    // Email al empleado con sus credenciales
    this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true } })
      .then(t => this.email.sendNewEmployee(newUser.email, newUser.name, t?.name ?? 'tu negocio', dto.password))
      .catch(() => {});

    return newUser;
  }

  async update(tenantId: string, id: string, dto: UpdateUserDto, requestorRole: Role) {
    const user = await this.prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) throw new NotFoundException();

    if (dto.role && requestorRole !== Role.OWNER) {
      throw new ForbiddenException('Solo el dueño puede cambiar roles');
    }
    if (dto.isActive === false && user.role === Role.OWNER) {
      const owners = await this.prisma.user.count({
        where: { tenantId, role: Role.OWNER, isActive: true },
      });
      if (owners <= 1) throw new ForbiddenException('No podés desactivar al único dueño');
    }

    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });
  }
}
