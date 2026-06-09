export const PLANS = {
  PRO: {
    id: 'PRO' as const,
    name: 'Plan Completo',
    description: 'Todo incluido para tu negocio',
    price: 24_990,
    currency: 'ARS',
    maxUsers: 3,
    features: [
      'Punto de venta con ticket y comprobante',
      'Inventario, stock y control de precios',
      'Clientes, fiados y cuenta corriente',
      'Proveedores con múltiples medios de pago',
      'Reportes, gráficos y respaldos',
      '1 dueño + hasta 2 cajeros simultáneos',
      'Acceso desde compu, tablet y celular',
      'Ganancia visible solo para el dueño',
    ],
  },
} as const;

export type PlanId = keyof typeof PLANS;
export const PLAN_IDS = Object.keys(PLANS) as PlanId[];

export const MAX_USERS_BY_PLAN: Record<string, number> = {
  TRIAL:      1,
  BASIC:      1,
  PRO:        3,
  ENTERPRISE: 999,
};
