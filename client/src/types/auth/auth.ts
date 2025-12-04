export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  isGoogleAuthUser?: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitializing: boolean;
}
