'use client';
import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Loader2, CheckCircle, KeyRound, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';

function PasswordInput({ id, value, onChange, placeholder, required }: {
  id: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setShow(v => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        tabIndex={-1}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export default function ForgotPasswordPage() {
  const [email,    setEmail]    = useState('');
  const [current,  setCurrent]  = useState('');
  const [pass,     setPass]     = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pass !== confirm) { toast.error('Las contraseñas nuevas no coinciden'); return; }
    if (pass.length < 6)  { toast.error('La nueva contraseña debe tener al menos 6 caracteres'); return; }

    setLoading(true);
    try {
      await api.post('/auth/reset-direct', {
        email,
        currentPassword: current,
        newPassword: pass,
      });
      setDone(true);
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Email o contraseña actual incorrectos');
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
        <CardTitle className="text-2xl font-serif">Cambiar contraseña</CardTitle>
      </CardHeader>
      <CardContent>
        {done ? (
          <div className="text-center space-y-3 py-4">
            <CheckCircle className="h-12 w-12 text-primary mx-auto" />
            <p className="font-bold text-lg">¡Contraseña actualizada!</p>
            <p className="text-sm text-muted-foreground">
              Ya podés iniciar sesión con tu nueva contraseña.
            </p>
            <Button asChild className="w-full mt-2">
              <Link href="/login">Ir al inicio de sesión</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ingresá tu email y contraseña actual para establecer una nueva.
            </p>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email de tu cuenta</Label>
              <Input
                id="email"
                type="email"
                placeholder="tucorreo@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="current">Contraseña actual</Label>
              <PasswordInput
                id="current"
                value={current}
                onChange={setCurrent}
                placeholder="Tu contraseña actual"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pass">Nueva contraseña</Label>
              <PasswordInput
                id="pass"
                value={pass}
                onChange={setPass}
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirmar nueva contraseña</Label>
              <PasswordInput
                id="confirm"
                value={confirm}
                onChange={setConfirm}
                placeholder="Repetí la nueva contraseña"
                required
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Actualizando...</>
                : <><KeyRound className="mr-2 h-4 w-4" />Cambiar contraseña</>
              }
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Volver al inicio de sesión
              </Link>
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
