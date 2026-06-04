'use client';
import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';
import { CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      toast.error('Error al enviar. Intentá de nuevo.');
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
        <CardTitle className="text-2xl font-serif">Recuperar contraseña</CardTitle>
      </CardHeader>
      <CardContent>
        {sent ? (
          <div className="text-center space-y-3 py-2">
            <div className="flex justify-center">
              <CheckCircle className="h-12 w-12 text-primary" />
            </div>
            <p className="font-semibold">¡Email enviado!</p>
            <p className="text-sm text-muted-foreground">
              Si el email existe, recibirás un link para restablecer tu contraseña. Revisá también el spam.
            </p>
            <Link href="/login" className="block text-sm text-primary font-semibold hover:underline mt-2">
              Volver al inicio
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Ingresá tu email y te enviamos un link para restablecer tu contraseña.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tucorreo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Enviando…' : 'Enviar link de recuperación'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Volver al inicio
              </Link>
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
