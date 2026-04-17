import { GoogleOAuthProvider } from "@react-oauth/google";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE";

// Limpiar localStorage si está lleno (evitar QuotaExceeded)
try {
  localStorage.setItem("__test", "1");
  localStorage.removeItem("__test");
} catch (e) {
  console.warn("⚠️ localStorage lleno, limpiando imágenes grandes...");
  // Si localStorage está lleno, limpiar datos no esenciales
  const keysToDelete = Object.keys(localStorage).filter(
    (key) => key.startsWith("service_images_") || key === "service-store"
  );
  keysToDelete.forEach((key) => localStorage.removeItem(key));
  console.log(`🧹 Removed ${keysToDelete.length} cache items`);
}

// Limpiar usuarios registrados (mantener solo Valentina Reyes)
try {
  const authStorageKey = "auth-storage";
  const authData = localStorage.getItem(authStorageKey);
  if (authData) {
    const parsed = JSON.parse(authData);
    // Si hay usuarios registrados que no sean Valentina, limpiar
    if (parsed.state?.registeredUsers && parsed.state.registeredUsers.length > 0) {
      console.log("🧹 Limpiando usuarios registrados (manteniendo solo Valentina Reyes)");
      parsed.state.registeredUsers = [];
      localStorage.setItem(authStorageKey, JSON.stringify(parsed));
    }
  }
} catch (e) {
  console.warn("No hay datos previos para limpiar");
}

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>
);
