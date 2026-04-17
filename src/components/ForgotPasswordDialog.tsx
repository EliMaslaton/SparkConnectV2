import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/services/supabaseService";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";
import { useState } from "react";

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ForgotPasswordDialog = ({ open, onOpenChange }: ForgotPasswordDialogProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resetLink, setResetLink] = useState("");
  const isDev = import.meta.env.DEV;

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError("Por favor ingresa tu email");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // En desarrollo, simular envío de email de confirmación
      if (isDev) {
        console.log("📧 DEV MODE: Generando email de confirmación...");
        
        // Generar token de confirmación (30 minutos de validez)
        const timestamp = Date.now();
        const expiresAt = timestamp + (30 * 60 * 1000);
        const confirmationData = { 
          email, 
          timestamp, 
          expiresAt,
          type: "confirmation"
        };
        const confirmToken = btoa(JSON.stringify(confirmationData));
        
        // Guardar en sessionStorage
        sessionStorage.setItem(`confirm_token_${confirmToken}`, JSON.stringify(confirmationData));
        
        // Generar link de confirmación
        const confirmLink = `${window.location.origin}/confirm-reset?token=${confirmToken}`;
        
        console.log(`✉️ Email de confirmación:`);
        console.log(`Para: ${email}`);
        console.log(`Link: ${confirmLink}`);
        console.log(`Válido por: 30 minutos`);
        
        // Mostrar el link en la interfaz (solo en DEV)
        setResetLink(confirmLink);
        setSuccess(true);
        setEmail("");
        setIsLoading(false);
        return;
      }

      // En producción, enviar email real via Supabase + Resend
      // Por ahora seguimos con Supabase nativo
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/confirm-reset`,
      });

      if (resetError) {
        setError("Email no encontrado o error al enviar");
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setEmail("");
      
      // Cerrar el modal después de 4 segundos
      setTimeout(() => {
        onOpenChange(false);
        setSuccess(false);
      }, 4000);
      
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || "Error al procesar la solicitud");
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      onOpenChange(newOpen);
      // Limpiar estados al cerrar
      if (!newOpen) {
        setEmail("");
        setError("");
        setSuccess(false);
        setResetLink("");
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(resetLink);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg">Recuperar Contraseña</AlertDialogTitle>
          <AlertDialogDescription>
            Te enviaremos un email con un link para resetear tu contraseña
          </AlertDialogDescription>
        </AlertDialogHeader>

        {success ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-700">¡Éxito!</p>
                <p className="text-sm text-green-600">
                  Revisa tu email de confirmación para cambiar tu contraseña
                </p>
              </div>
            </div>

            {isDev && resetLink && (
              <div className="space-y-2 bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-xs font-medium text-blue-800">
                  🔧 DEV - Simular Email de Confirmación:
                </p>
                <button
                  onClick={() => window.open(resetLink, "_blank")}
                  className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                >
                  Abrir Link de Confirmación
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {error && (
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reset-email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="rounded-lg"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !isLoading) {
                    handleResetPassword();
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                Ingresa el email asociado a tu cuenta
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          {!success && (
            <AlertDialogCancel disabled={isLoading}>
              Cancelar
            </AlertDialogCancel>
          )}
          {!success && (
            <AlertDialogAction
              onClick={handleResetPassword}
              disabled={isLoading || !email.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Email"
              )}
            </AlertDialogAction>
          )}
          {success && (
            <AlertDialogAction className="bg-green-600 hover:bg-green-700">
              Cerrar
            </AlertDialogAction>
          )}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
