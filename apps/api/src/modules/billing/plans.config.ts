export const PLANS = {
  BASIC: {
    id: 'BASIC' as const,
    name: 'Plan Básico',
    description: 'Para kioscos pequeños',
    price: 15_000,
    currency: 'ARS',
    maxUsers: 2,
    features: [
      'Punto de venta con ticket',
      'Inventario y stock',
      'Clientes y fiados',
      'Hasta 2 usuarios',
      'Exportación de respaldos',
    ],
  },
  PRO: {
    id: 'PRO' as const,
    name: 'Plan Profesional',
    description: 'Para almacenes con empleados',
    price: 30_000,
    currency: 'ARS',
    maxUsers: null,
    features: [
      'Todo del Plan Básico',
      'Usuarios ilimitados',
      'Proveedores y facturas',
      'Reportes y gráficos completos',
      'Acceso simultáneo desde varias cajas',
    ],
  },
  ENTERPRISE: {
    id: 'ENTERPRISE' as const,
    name: 'Plan Enterprise',
    description: 'Para cadenas y locales múltiples',
    price: 75_000,
    currency: 'ARS',
    maxUsers: null,
    features: [
      'Todo del Plan Pro',
      'Soporte prioritario',
      'Configuración personalizada',
      'API access',
      'SLA garantizado',
    ],
  },
} as const;

export type PlanId = keyof typeof PLANS;
export const PLAN_IDS = Object.keys(PLANS) as PlanId[];
