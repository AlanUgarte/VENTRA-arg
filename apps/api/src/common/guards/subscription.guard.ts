import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SetMetadata } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

export const SKIP_SUBSCRIPTION = 'skipSubscription';
// SetMetadata en lugar de Reflect.metadata para compatibilidad con Reflector
export const SkipSubscription = () => SetMetadata(SKIP_SUBSCRIPTION, true);

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];

    // Endpoints @Public() nunca necesitan suscripción
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets);
    if (isPublic) return true;

    // Endpoints marcados explícitamente como @SkipSubscription()
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_SUBSCRIPTION, targets);
    if (skip) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user?.tenantId) return false;

    const sub = await this.prisma.subscription.findUnique({
      where: { tenantId: user.tenantId },
    });

    if (!sub) {
      throw new ForbiddenException('Sin suscripción activa. Contactá soporte.');
    }

    if (sub.status === 'CANCELLED') {
      throw new ForbiddenException('Tu suscripción fue cancelada.');
    }

    if (sub.status === 'PAST_DUE') {
      throw new ForbiddenException(
        'Tenés un pago pendiente. Regularizá tu suscripción para continuar.',
      );
    }

    if (sub.status === 'TRIAL' && sub.trialEndsAt < new Date()) {
      throw new ForbiddenException(
        'Tu período de prueba venció. Activá tu plan para seguir usando el sistema.',
      );
    }

    return true;
  }
}
