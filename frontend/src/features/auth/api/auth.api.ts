import { api } from "../../../lib/axios";
import type { LoginCredentials, RegisterData, User } from "../types";

export const authApi = {
  async login(credentials: LoginCredentials): Promise<User> {
    const { data: res } = await api.post("/api/users/login", credentials);
    return res.data;
  },

  async register(payload: RegisterData): Promise<User> {
    const { data: res } = await api.post("/api/users/register", payload);
    return res.data;
  },

  async getProfile(): Promise<User> {
    const { data: res } = await api.get("/api/users/profile");
    return res.data;
  },

  logout() {
    // Token clearing is handled by AuthContext
  },
};