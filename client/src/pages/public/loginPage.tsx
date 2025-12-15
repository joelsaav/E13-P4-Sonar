import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return <LoginForm forceMode="login" linkTo="/register" />;
}
