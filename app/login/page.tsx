"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        toast({
          title: "Inicio de sesión exitoso",
          description: "Redirigiendo al dashboard...",
        });
        router.push("/dashboard/titulares");
      } else {
        const data = await response.json();
        toast({
          title: "Error de inicio de sesión",
          description: data.message || "Credenciales inválidas.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-[30rem] shadow-lg border-border">
        <CardHeader className="text-left space-y-2">
          <h1 className="text-3xl pb-6">
            <span className="font-semibold">CGM </span>
            <span className="text-primary">Sistema</span>
          </h1>
          <CardTitle>Iniciar sesión</CardTitle>
          <CardDescription>
            Introduzca sus credenciales para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-lg font-semibold">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                className="rounded-lg py-6 px-3"
                placeholder="micorreo@ejemplo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2 text-lg pb-2">
              <Label htmlFor="password" className="text-lg font-semibold">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                className="rounded-lg py-6 px-3"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="text-right">
                <a href="#" className="text-md text-primary hover:underline">
                  ¿Olvidó su contraseña?
                </a>
              </div>
            </div>
            <Button type="submit" className="w-full " disabled={loading}>
              {loading ? "Iniciando sesión..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-primary text-md">
          © 2024 CGM Sistema
        </CardFooter>
      </Card>
    </div>
  );
}
