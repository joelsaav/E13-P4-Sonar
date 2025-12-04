import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "./useRedux";
import {
  loginUser,
  registerUser,
  loginWithGoogleUser,
  logout,
  selectUser,
  selectIsAuthenticated,
  selectToken,
  selectAuthLoading,
  selectAuthError,
} from "@/store/slices/authSlice";

export function useAuth() {
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const token = useAppSelector(selectToken);
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        await dispatch(loginUser({ email, password })).unwrap();
        return { success: true };
      } catch (err) {
        return { success: false, error: err as string };
      }
    },
    [dispatch],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      try {
        await dispatch(registerUser({ name, email, password })).unwrap();
        return { success: true };
      } catch (err) {
        return { success: false, error: err as string };
      }
    },
    [dispatch],
  );

  const loginWithGoogle = useCallback(
    async (idToken: string) => {
      try {
        await dispatch(loginWithGoogleUser(idToken)).unwrap();
        return { success: true };
      } catch (err) {
        return { success: false, error: err as string };
      }
    },
    [dispatch],
  );

  const signOut = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    token,
    isLoading,
    error,
    login,
    register,
    loginWithGoogle,
    signOut,
  };
}
