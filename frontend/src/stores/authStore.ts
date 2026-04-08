import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Clinic { id: string; name: string; owner_name: string; is_active: boolean; }
interface AuthState {
  token: string | null;
  clinic: Clinic | null;
  setAuth: (token: string, clinic: Clinic) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      clinic: null,
      setAuth: (token, clinic) => set({ token, clinic }),
      logout: () => set({ token: null, clinic: null }),
    }),
    { name: "clinic-auth" }
  )
);
