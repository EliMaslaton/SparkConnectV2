import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/services/supabaseService";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

interface TokenData {
  email: string;
  timestamp: number;
  expiresAt: number;
}

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [sessionError, setSessionError] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const isDev = import.meta.env.DEV;

  // Verificar token en URL
  useEffect(() => {
    const checkToken = async () => {
      const type = searchParams.get("type");
      const token = searchParams.get("token");

      if (type !== "recovery" || !token) {
        setSessionError(true);
        return;
      }

      // En desarrollo, validar token de sessionStorage
      if (isDev) {
        try {
          const tokenKey = `reset_token_${token}`;
          const storedData = sessionStorage.getItem(tokenKey);
          
          if (!storedData) {
            console.error("❌ Token no válido o expirado");
            setSessionError(true);
            return;
          }
          
          const tokenData: TokenData = JSON.parse(storedData);
          
          // Validar expiración (15 minutos)
          if (Date.now() > tokenData.expiresAt) {
            console.error("❌ Token expirado");
            setSessionError(true);
            return;
          }
          
          console.log("✅ Token válido para email:", tokenData.email);
          setUserEmail(tokenData.email);
          return;
        } catch (err) {
          console.error("❌ Error validando token:", err);
          setSessionError(true);
          return;
        }
      }

      // En producción, verificar con Supabase
      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "recovery",
        });

        if (error) {
          setSessionError(true);
        }
      } catch (err) {
        setSessionError(true);
      }
    };

    checkToken();
  }, [searchParams, isDev]);

  const handleResetPassword = async () => {
    // Validaciones
    if (!password || !confirmPassword) {
      setError("Por favor completa todos los campos");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // En desarrollo, validar y resetear solo del email del token
      if (isDev) {
        if (!userEmail) {
          setError("Token inválido o expirado");
          setIsLoading(false);
          return;
        }

        console.log("🔧 DEV MODE: Reseteando contraseña de", userEmail);
        
        // Validar que el user existe y actualizar su contraseña
        const users = JSON.parse(localStorage.getItem("auth_users") || "[]");
        const userIndex = users.findIndex((u: any) => u.email === userEmail);
        
        if (userIndex === -1) {
          setError("Usuario no encontrado");
          setIsLoading(false);
          return;
        }
        
        // Actualizar contraseña
        users[userIndex].password = password;
        localStorage.setItem("auth_users", JSON.stringify(users));
        console.log("✅ Contraseña actualizada para:", userEmail);
        
        setSuccess(true);
        setTimeout(() => navigate("/login"), 2000);
        setIsLoading(false);
        return;
      }

      // En producción, usar Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message || "Error al actualizar la contraseña");
        return;
      }

      setSuccess(true);

      // Redirigir a login después de 2 segundos
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Error procesando la solicitud");
    } finally {
      setIsLoading(false);
    }
  };

  if (sessionError) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-md py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-8 border space-y-4"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <h2 className="font-bold text-lg text-red-700">Link Inválido</h2>
                <p className="text-sm text-red-600 mt-1">
                  El link de recuperación ha expirado o es inválido
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate("/login")}
              className="w-full gradient-primary text-primary-foreground rounded-xl"
            >
              Ir a Login
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-md py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-8 border space-y-6"
        >
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Nueva Contraseña
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Ingresa una nueva contraseña para tu cuenta
            </p>
          </div>

          {success ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-700">¡Éxito!</p>
                  <p className="text-sm text-green-600">
                    Tu contraseña ha sido actualizada
                  </p>
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Redirigiendo al login...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Nueva Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Al menos 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-sm font-medium">
                  Confirmar Contraseña
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirma tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="rounded-lg"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !isLoading) {
                      handleResetPassword();
                    }
                  }}
                />
              </div>

              <Button
                onClick={handleResetPassword}
                disabled={isLoading || !password || !confirmPassword}
                className="w-full gradient-primary text-primary-foreground rounded-lg h-11 mt-6"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  "Actualizar Contraseña"
                )}
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;
