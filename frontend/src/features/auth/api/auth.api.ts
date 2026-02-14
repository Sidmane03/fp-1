import { api } from "../../../lib/axios";
import { tokenStorage } from "../../../lib/storage";
import type { LoginCredentials, RegisterData, User } from "../types";

export const authApi = {
  async login(credentials: LoginCredentials): Promise<User> {
    const { data: res } = await api.post("/api/users/login", credentials);
    const user = res.data;
    tokenStorage.set(user.token);
    return user;
  },

  async register(payload: RegisterData): Promise<User> {
    const { data: res } = await api.post("/api/users/register", payload);
    const user = res.data;
    tokenStorage.set(user.token);
    return user;
  },

  async getProfile(): Promise<User> {
    const { data: res } = await api.get("/api/users/profile");
    return res.data;
  },

  logout() {
    tokenStorage.clear();
  },
};