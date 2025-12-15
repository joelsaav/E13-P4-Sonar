import { LoginForm } from "@/components/auth/LoginForm";

export default function RegisterPage() {
  return <LoginForm forceMode="register" linkTo="/login" />;
}
