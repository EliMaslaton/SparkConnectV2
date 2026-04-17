import { TALENTS } from "@/lib/mock-data";
import { supabase } from "@/services/supabaseService";
import { AuthState, UserProfile } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Convert mock data (TALENTS) to UserProfile objects for authentication
 * This is used for demo purposes with password "test123"
 */
const mockUsers: UserProfile[] = TALENTS.map((talent) => ({
  id: talent.id,
  email: `${talent.name.toLowerCase().replace(" ", ".")}@sparkconnect.com`,
  password: "test123", // Solo para demo
  name: talent.name,
  role: "freelancer" as const,
  avatar: talent.avatar,
  tagline: talent.tagline,
  bio: talent.bio,
  location: talent.location,
  skills: talent.skills,
  createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
  updatedAt: new Date(),
}));

interface AuthStore extends AuthState {
  registeredUsers: UserProfile[];
  /** Authenticate user with email and password */
  login: (email: string, password: string) => void;
  /** Authenticate user with Google OAuth credentials */
  loginWithGoogle: (googleData: { name: string; email: string; avatar?: string }) => void;
  /** Create new user account */
  register: (userData: Omit<UserProfile, "id" | "createdAt" | "updatedAt">) => void;
  /** Clear authentication and current user */
  logout: () => void;
  /** Update current user profile information */
  updateProfile: (updates: Partial<UserProfile>) => void;
  /** Set error message for UI display */
  setError: (error: string | null) => void;
  /** Grant admin privileges to a user */
  promoteToAdmin: (userId: string) => void;
  /** Revoke admin privileges from a user */
  demoteFromAdmin: (userId: string) => void;
  /** Retrieve all registered users */
  getAllUsers: () => UserProfile[];
  /** Load users from Supabase (for admin panel) */
  loadUsersFromSupabase: () => Promise<UserProfile[]>;
  /** Update any user's profile (admin only) */
  updateUser: (userId: string, updates: Partial<UserProfile>) => void;
  /** Delete a user account (admin only) */
  deleteUser: (userId: string) => void;
  /** Check if current user has admin privileges */
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      // Solo mantener Valentina Reyes como usuario mock
      registeredUsers: [],

      login: (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        // Simular delay de red
        setTimeout(() => {
          const allUsers = [...mockUsers, ...get().registeredUsers];
          const user = allUsers.find((u) => u.email === email && u.password === password);
          
          if (user) {
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: "Email o contraseña inválidos",
            });
          }
        }, 500);
      },

      loginWithGoogle: (googleData) => {
        set({ isLoading: true, error: null });
        
        (async () => {
          try {
            const allUsers = [...mockUsers, ...get().registeredUsers];
            let user = allUsers.find((u) => u.email === googleData.email);
            
            // Solo elielmaslaton@gmail.com es admin
            const isAdmin = googleData.email === "elielmaslaton@gmail.com";
            const role = isAdmin ? "admin" : "freelancer";
            
            // Si el usuario no existe, crear uno nuevo
            if (!user) {
              user = {
                id: `user_${Date.now()}`,
                email: googleData.email,
                name: googleData.name,
                role: role as const,
                avatar: googleData.avatar,
                tagline: isAdmin ? "Administrador" : "Nuevo miembro de Spark Connect",
                bio: isAdmin ? "Gestor principal de la plataforma" : "Bienvenido a Spark Connect",
                location: "Por definir",
                skills: isAdmin ? ["administración", "gestión de usuarios"] : [],
                createdAt: new Date(),
                updatedAt: new Date(),
              };
              
              // Guardar en Supabase
              await supabase
                .from("users")
                .insert({
                  id: user.id,
                  email: user.email,
                  name: user.name,
                  role: user.role,
                  avatar: user.avatar,
                  tagline: user.tagline,
                  bio: user.bio,
                  location: user.location,
                  skills: user.skills,
                });
              
              set((state) => ({
                registeredUsers: [...state.registeredUsers, user as UserProfile],
              }));
            } else {
              // Si el usuario ya existe, actualizar su rol basado en el email
              user = {
                ...user,
                role: role as const,
              };
              
              // Actualizar en Supabase
              await supabase
                .from("users")
                .update({ role: user.role })
                .eq("email", googleData.email);
              
              set((state) => {
                const updatedRegisteredUsers = state.registeredUsers.map((u) =>
                  u.email === googleData.email ? { ...u, role: role as const } : u
                );
                return {
                  registeredUsers: updatedRegisteredUsers,
                };
              });
            }
            
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (error) {
            console.error("Error in Google login:", error);
            set({
              isLoading: false,
              error: "Error durante el login con Google",
            });
          }
        })();
      },

      register: (userData) => {
        set({ isLoading: true, error: null });
        
        (async () => {
          try {
            // Verificar que el email no existe en Supabase
            const { data: existingUser, error: checkError } = await supabase
              .from("users")
              .select("*")
              .eq("email", userData.email)
              .maybeSingle();

            if (checkError && checkError.code !== 'PGRST116') {
              throw checkError;
            }

            if (existingUser) {
              set({
                isLoading: false,
                error: "El email ya está registrado",
              });
              return;
            }

            // Crear nuevo usuario
            const newUser: UserProfile = {
              ...userData,
              id: `user_${Date.now()}`,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            // Guardar en Supabase
            console.log("[Auth] Saving new user to Supabase:", newUser.email);
            const { error: insertError } = await supabase
              .from("users")
              .insert({
                id: newUser.id,
                email: newUser.email,
                password: newUser.password || "",
                name: newUser.name,
                role: newUser.role,
                avatar: newUser.avatar,
                tagline: newUser.tagline,
                bio: newUser.bio,
                location: newUser.location,
                skills: newUser.skills || [],
              });

            if (insertError) {
              console.error("[Auth] Insert error:", insertError);
              throw insertError;
            }
            
            console.log("[Auth] User saved successfully:", newUser.email);

            set((state) => ({
              registeredUsers: [...state.registeredUsers, newUser],
              user: newUser,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            }));
          } catch (error) {
            console.error("[Auth] Register error:", error);
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : "Error al registrar el usuario",
            });
          }
        })();
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      updateProfile: (updates) => {
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                ...updates,
                updatedAt: new Date(),
              }
            : null,
        }));
      },

      setError: (error) => {
        set({ error });
      },

      promoteToAdmin: (userId: string) => {
        (async () => {
          try {
            // Actualizar en Supabase
            await supabase
              .from("users")
              .update({ role: "admin" })
              .eq("id", userId);

            // Actualizar en estado local
            set((state) => {
              const updatedRegisteredUsers = state.registeredUsers.map((u) =>
                u.id === userId ? { ...u, role: "admin" as const } : u
              );
              return {
                registeredUsers: updatedRegisteredUsers,
                user: state.user?.id === userId ? { ...state.user, role: "admin" as const } : state.user,
              };
            });
          } catch (error) {
            console.error("Error promoting user to admin:", error);
          }
        })();
      },

      demoteFromAdmin: (userId: string) => {
        (async () => {
          try {
            // Actualizar en Supabase
            await supabase
              .from("users")
              .update({ role: "freelancer" })
              .eq("id", userId);

            // Actualizar en estado local
            set((state) => {
              const updatedRegisteredUsers = state.registeredUsers.map((u) =>
                u.id === userId ? { ...u, role: "freelancer" as const } : u
              );
              return {
                registeredUsers: updatedRegisteredUsers,
                user: state.user?.id === userId ? { ...state.user, role: "freelancer" as const } : state.user,
              };
            });
          } catch (error) {
            console.error("Error demoting user from admin:", error);
          }
        })();
      },

      getAllUsers: () => {
        const state = get();
        return [...mockUsers, ...state.registeredUsers];
      },

      loadUsersFromSupabase: async () => {
        try {
          // Obtener usuarios registrados de Supabase
          const { data: supabaseUsers, error } = await supabase
            .from("users")
            .select("*");

          if (error) throw error;

          // Mapear datos de Supabase a UserProfile
          const mappedUsers: UserProfile[] = (supabaseUsers || []).map((user: any) => ({
            id: user.id,
            email: user.email,
            password: user.password,
            name: user.name,
            role: user.role as "admin" | "freelancer",
            avatar: user.avatar,
            tagline: user.tagline,
            bio: user.bio,
            location: user.location,
            skills: user.skills || [],
            createdAt: new Date(user.created_at),
            updatedAt: new Date(user.updated_at),
          }));

          // Actualizar estado local con usuarios de Supabase
          set((state) => ({
            registeredUsers: mappedUsers,
          }));

          // Retornar todos los usuarios (mock + Supabase)
          return [...mockUsers, ...mappedUsers];
        } catch (error) {
          console.error("Error loading users from Supabase:", error);
          return [...mockUsers];
        }
      },

      updateUser: (userId: string, updates) => {
        set((state) => {
          const updatedRegisteredUsers = state.registeredUsers.map((u) =>
            u.id === userId ? { ...u, ...updates, updatedAt: new Date() } : u
          );
          return {
            registeredUsers: updatedRegisteredUsers,
            user: state.user?.id === userId ? { ...state.user, ...updates, updatedAt: new Date() } : state.user,
          };
        });
      },

      deleteUser: (userId: string) => {
        (async () => {
          try {
            // Eliminar de Supabase
            await supabase
              .from("users")
              .delete()
              .eq("id", userId);

            // Eliminar del estado local
            set((state) => {
              const updatedRegisteredUsers = state.registeredUsers.filter((u) => u.id !== userId);
              return {
                registeredUsers: updatedRegisteredUsers,
                user: state.user?.id === userId ? null : state.user,
                isAuthenticated: state.user?.id === userId ? false : state.isAuthenticated,
              };
            });
          } catch (error) {
            console.error("Error deleting user:", error);
          }
        })();
      },

      isAdmin: () => {
        const state = get();
        return state.user?.role === "admin";
      },
    }),
    {
      name: "spark-auth", // LocalStorage key
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        registeredUsers: state.registeredUsers,
      }),
    }
  )
);
