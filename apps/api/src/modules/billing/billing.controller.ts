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

  // ── Public: list plans (no auth needed) ──────────────────────────────────
  @Public()
  @SkipSubscription()
  @Get('plans')
  getPlans() {
    return this.billing.getPlans();
  }

  // ── Authenticated: get own subscription ──────────────────────────────────
  @ApiBearerAuth()
  @SkipSubscription()
  @Get('subscription')
  getSubscription(@CurrentUser() user: JwtPayload) {
    return this.billing.getSubscription(user.tenantId);
  }

  // ── OWNER only: start subscription flow ──────────────────────────────────
  @ApiBearerAuth()
  @SkipSubscription()
  @Roles('OWNER')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('subscribe')
  subscribe(@CurrentUser() user: JwtPayload, @Body() dto: CreateSubscriptionDto) {
    return this.billing.createPreapproval(user.tenantId, user.sub, dto.plan);
  }

  // ── OWNER only: cancel subscription ──────────────────────────────────────
  @ApiBearerAuth()
  @SkipSubscription()
  @Roles('OWNER')
  @Post('cancel')
  @HttpCode(HttpStatus.OK)
  cancel(@CurrentUser() user: JwtPayload) {
    return this.billing.cancelSubscription(user.tenantId, user.sub);
  }

  // ── MP Webhook: no auth, signature verified in service ───────────────────
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
}
