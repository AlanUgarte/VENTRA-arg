import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { SkipSubscription } from '../../common/guards/subscription.guard';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(private billing: BillingService) {}

  @Public()
  @SkipSubscription()
  @Get('plans')
  getPlans() {
    return this.billing.getPlans();
  }

  @ApiBearerAuth()
  @SkipSubscription()
  @Get('subscription')
  getSubscription(@CurrentUser() user: JwtPayload) {
    return this.billing.getSubscription(user.tenantId);
  }

  // Crea PreApproval de MP y devuelve init_point para redirigir al usuario
  @ApiBearerAuth()
  @SkipSubscription()
  @Roles('OWNER')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('subscribe')
  subscribe(@CurrentUser() user: JwtPayload, @Body() dto: CreateSubscriptionDto) {
    return this.billing.createPreapproval(user.tenantId, user.sub, dto.plan);
  }

  // Cancela la suscripción en MP
  @ApiBearerAuth()
  @SkipSubscription()
  @Roles('OWNER')
  @Post('cancel')
  @HttpCode(HttpStatus.OK)
  cancel(@CurrentUser() user: JwtPayload) {
    return this.billing.cancelSubscription(user.tenantId, user.sub);
  }

  // Webhook de MP — notificaciones automáticas de pago/estado
  @Public()
  @SkipSubscription()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  webhook(
    @Body() body: Record<string, any>,
    @Headers('x-signature') xSignature: string,
    @Headers('x-request-id') xRequestId: string,
  ) {
    return this.billing.handleWebhook(body, xSignature ?? '', xRequestId ?? '');
  }

  // Notificación manual de transferencia bancaria (fallback)
  @ApiBearerAuth()
  @SkipSubscription()
  @Roles('OWNER')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('notify-payment')
  @HttpCode(HttpStatus.OK)
  notifyPayment(@CurrentUser() user: JwtPayload, @Body() dto: CreateSubscriptionDto) {
    return this.billing.notifyPayment(user.tenantId, user.sub, dto.plan);
  }
}
