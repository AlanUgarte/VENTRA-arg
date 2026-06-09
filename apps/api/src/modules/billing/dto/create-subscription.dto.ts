import { IsIn } from 'class-validator';
import { PLAN_IDS, type PlanId } from '../plans.config';

export class CreateSubscriptionDto {
  @IsIn(PLAN_IDS, { message: 'Plan inválido. Opción disponible: PRO' })
  plan: PlanId;
}
