'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  businessName: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const { data: tokens } = await api.post('/auth/register', values);
      useAuthStore.setState({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
      const { data: user } = await api.get('/auth/me');
      setAuth(user, tokens.accessToken, tokens.refreshToken);
      toast.success('¡Bienvenido! Tu cuenta está lista.');
      router.push(user.isSuperAdmin ? '/admin' : '/pos');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : (msg ?? 'Error al registrarse'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-400 text-2xl font-black text-emerald-900 shadow-lg shadow-primary/30">
          A
        </div>
        <CardTitle className="text-2xl font-serif">Probá gratis 3 días</CardTitle>
        <p className="text-sm text-muted-foreground">Sin tarjeta. Cancelás cuando quieras.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="name">Tu nombre</Label>
            <Input id="name" placeholder="Nombre y apellido" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="businessName">Nombre del negocio</Label>
            <Input id="businessName" placeholder="Ej: Kiosco La Esquina" {...register('businessName')} />
            {errors.businessName && <p className="text-xs text-destructive">{errors.businessName.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="tucorreo@email.com" {...register('email')} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" placeholder="Mínimo 6 caracteres" {...register('password')} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Creando cuenta…' : 'Crear cuenta y empezar'}
          </Button>
        </form>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Al registrarte aceptás los{' '}
          <Link href="/terms" className="text-primary hover:underline">Términos</Link>
          {' '}y la{' '}
          <Link href="/privacy" className="text-primary hover:underline">Política de privacidad</Link>
        </p>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
