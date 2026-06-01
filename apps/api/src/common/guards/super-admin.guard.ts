import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user } = context.switchToHttp().getRequest();
    if (!user?.sub) throw new ForbiddenException('Acceso denegado');

    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.sub },
      select: { isSuperAdmin: true, isActive: true },
    });

    if (!dbUser?.isSuperAdmin || !dbUser.isActive) {
      throw new ForbiddenException('Se requiere acceso de super administrador');
    }
    return true;
  }
}
