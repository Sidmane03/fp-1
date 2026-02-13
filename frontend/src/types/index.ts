// 1. User Profile (Database Shape)
export interface User {
  _id: string;
  name: string;
  email: string;
  token: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  height: number;
  weight: number;
  goal: 'lose_weight' | 'maintain' | 'gain_muscle';
  activityLevel: string;
  bmi?: number;
}

// 2. Auth Context State
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isError: boolean;
  message: string;
}

// 3. Login Data Shape
export interface LoginCredentials {
  email: string;
  password: string;
}

// 4. Registration Data Shape
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  gender: string;
  age: number;
  height: number;
  weight: number;
  goal: string;
  activityLevel: string;
}
