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

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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
    const exists = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email: dto.email.toLowerCase() } },
    });
    if (exists) throw new ConflictException('Email ya usado en este negocio');

    const password = await bcrypt.hash(dto.password, 12);
    return this.prisma.user.create({
      data: {
        tenantId,
        name: dto.name,
        email: dto.email.toLowerCase(),
        password,
        role: dto.role,
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateUserDto, requestorRole: Role) {
    const user = await this.prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) throw new NotFoundException();

    // Solo OWNER puede cambiar roles
    if (dto.role && requestorRole !== Role.OWNER) {
      throw new ForbiddenException('Solo el dueño puede cambiar roles');
    }
    // No se puede desactivar al único OWNER activo
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
