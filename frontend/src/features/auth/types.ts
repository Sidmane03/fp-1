// Auth-specific types

export interface User {
  _id: string;
  name: string;
  email: string;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  gender: string;
  age: number;
  height: number;
  weight: number;
  activityLevel: string;
  goal: string;
  targetWeight?: number;
  timeframeWeeks?: number;
}