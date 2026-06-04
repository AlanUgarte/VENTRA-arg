'use client';
import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';
import { CheckCircle } from 'lucide-react';

function ResetForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error('Mínimo 6 caracteres'); return; }
    if (password !== confirm) { toast.error('Las contraseñas no coinciden'); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setDone(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Token inválido o expirado');
    } finally { setLoading(false); }
  };

  if (!token) return (
    <p className="text-center text-sm text-muted-foreground">
      Link inválido.{' '}
      <Link href="/forgot-password" className="text-primary hover:underline">Solicitá uno nuevo</Link>
    </p>
  );

  return done ? (
    <div className="text-center space-y-3 py-2">
      <div className="flex justify-center"><CheckCircle className="h-12 w-12 text-primary" /></div>
      <p className="font-semibold">¡Contraseña actualizada!</p>
      <p className="text-sm text-muted-foreground">Te redirigimos al inicio en unos segundos…</p>
    </div>
  ) : (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="pw">Nueva contraseña</Label>
        <Input id="pw" type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cf">Confirmar contraseña</Label>
        <Input id="cf" type="password" placeholder="Repetí la contraseña" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? 'Guardando…' : 'Guardar nueva contraseña'}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-400 text-2xl font-black text-emerald-900 shadow-lg shadow-primary/30">A</div>
        <CardTitle className="text-2xl font-serif">Nueva contraseña</CardTitle>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<div className="text-center text-muted-foreground text-sm py-4">Cargando…</div>}>
          <ResetForm />
        </Suspense>
      </CardContent>
    </Card>
  );
}
