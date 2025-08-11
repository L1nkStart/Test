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
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpiar errores previos
    setErrors({ email: "", password: "" });
    
    // Validaciones adicionales en el frontend
    const newErrors = { email: "", password: "" };
    
    if (!email.trim()) {
      newErrors.email = "El correo electrónico es requerido";
      toast({
        title: "Campo requerido",
        description: "Por favor ingrese su correo electrónico.",
        variant: "destructive",
      });
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      newErrors.email = "El correo electrónico no tiene formato válido";
      toast({
        title: "Formato inválido",
        description: "Por favor ingrese un correo electrónico válido.",
        variant: "destructive",
      });
    }
    
    if (!password.trim()) {
      newErrors.password = "La contraseña es requerida";
      toast({
        title: "Campo requerido",
        description: "Por favor ingrese su contraseña.",
        variant: "destructive",
      });
    } else if (password.length < 4) {
      newErrors.password = "La contraseña debe tener al menos 4 caracteres";
      toast({
        title: "Contraseña muy corta",
        description: "La contraseña debe tener al menos 4 caracteres.",
        variant: "destructive",
      });
    }
    
    if (newErrors.email || newErrors.password) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      const loginData = { email: email.trim(), password: password.trim() };
      
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Verificar que la respuesta contenga información válida de usuario
        if (data.user && data.user.email) {
          toast({
            title: "¡Bienvenido!",
            description: "Inicio de sesión exitoso. Redirigiendo...",
            variant: "success",
          });
          
          // Esperar un poco para que la cookie se establezca antes de redirigir
          setTimeout(() => {
            window.location.href = "/dashboard/titulares";
          }, 500);
        } else {
          toast({
            title: "Error de autenticación",
            description: "No se pudo procesar la solicitud. Intente nuevamente.",
            variant: "destructive",
          });
        }
      } else {
        const data = await response.json();
        toast({
          title: "Acceso denegado",
          description: "Las credenciales ingresadas no son válidas. Revise su correo y contraseña.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar al servidor. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-0 py-8">
      <Card className="w-full max-w-[30rem] shadow-lg border-border">
        <CardHeader className="text-left space-y-2 px-5 sm:px-6">
          <h1 className="text-3xl pb-6">
            <span className="font-semibold">CGM </span>
            <span className="text-primary">Sistema</span>
          </h1>
          <CardTitle>Iniciar sesión</CardTitle>
          <CardDescription>
            Introduzca sus credenciales para continuar
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8 px-5 sm:px-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-lg font-semibold">
                Correo Electrónico
              </Label>
              <Input
                id="email"
                type="email"
                className={`rounded-lg py-6 px-3 ${errors.email ? 'border-red-500' : ''}`}
                placeholder="micorreo@ejemplo.com"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
                }}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2 text-lg pb-2">
              <Label htmlFor="password" className="text-lg font-semibold">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={`rounded-lg py-6 px-3 pr-12 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: "" }));
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  </span>
                </Button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
              {!errors.password && password.length > 0 && password.length < 4 && (
                <p className="text-yellow-600 text-sm mt-1">
                  Mínimo 4 caracteres requeridos
                </p>
              )}
              <div className="text-right">
                <a href="#" className="text-sm text-primary hover:underline">
                  ¿Olvidó su contraseña?
                </a>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !email.trim() || !password.trim() || password.length < 4}
            >
              {loading ? "Iniciando sesión..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-primary text-md px-5 sm:px-6">
          © 2024 CGM Sistema
        </CardFooter>
      </Card>
    </div>
  );
}
