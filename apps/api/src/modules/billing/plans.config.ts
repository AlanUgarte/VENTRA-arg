export const PLANS = {
  BASIC: {
    id: 'BASIC' as const,
    name: 'Plan Básico',
    description: 'Para kioscos pequeños',
    price: 20_000,
    currency: 'ARS',
    maxUsers: 1,
    features: [
      'Punto de venta con ticket',
      'Inventario y stock',
      'Clientes y fiados',
      'Proveedores con medios de pago',
      'Reportes y gráficos',
      'Solo 1 usuario (el dueño)',
      'Exportación de respaldos',
    ],
  },
  PRO: {
    id: 'PRO' as const,
    name: 'Plan Profesional',
    description: 'Para almacenes con empleados',
    price: 30_000,
    currency: 'ARS',
    maxUsers: 3,
    features: [
      'Todo del Plan Básico',
      'Hasta 3 usuarios simultáneos',
      'Empleados con permisos restringidos',
      'Reportes y gráficos completos',
      'Acceso simultáneo desde varias cajas',
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
