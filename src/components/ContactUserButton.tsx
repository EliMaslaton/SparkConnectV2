import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useMessagesStore } from "@/store/messagesStore";
import { UserProfile } from "@/types";
import { MessageSquare } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface ContactUserButtonProps {
  user: UserProfile;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
  showIcon?: boolean;
}

/**
 * Botón para iniciar una conversación con otro usuario
 * Se puede usar en perfiles, tarjetas de servicio, etc.
 */
export const ContactUserButton = ({
  user,
  variant = "default",
  size = "default",
  className = "",
  showIcon = true,
}: ContactUserButtonProps) => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const startConversation = useMessagesStore((state) => state.startConversation);
  const [isLoading, setIsLoading] = useState(false);

  const handleContact = async () => {
    if (!currentUser?.id) {
      // Redirigir a login si no está autenticado
      navigate("/login");
      return;
    }

    if (currentUser.id === user.id) {
      // No puede enviarse un mensaje a sí mismo
      return;
    }

    try {
      setIsLoading(true);
      await startConversation(currentUser.id, user.id, user);
      // Redirigir a la página de mensajes
      navigate("/mensajes");
    } catch (error) {
      console.error("Error starting conversation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // No mostrar botón si es el usuario actual
  if (currentUser?.id === user.id) {
    return null;
  }

  return (
    <Button
      onClick={handleContact}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={className}
    >
      {showIcon && <MessageSquare className="w-4 h-4 mr-2" />}
      {isLoading ? "Iniciando..." : "Contactar"}
    </Button>
  );
};

export default ContactUserButton;
