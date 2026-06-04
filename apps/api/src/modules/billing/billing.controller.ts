import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
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

  // Tenant notifica que transfirió → email al admin para activar manualmente
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
