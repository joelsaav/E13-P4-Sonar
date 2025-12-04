/**
 * @file RegisterPage.tsx
 * @description Página de registro que utiliza Redux para autenticación.
 */
import { LoginForm } from "@/components/loginForm";

export default function RegisterPage() {
  return <LoginForm forceMode="register" linkTo="/login" />;
}
