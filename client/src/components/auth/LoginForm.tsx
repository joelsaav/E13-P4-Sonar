import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/shared/Field";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import type { AuthenticateMode } from "@/types/components";
import type { LoginFormProps } from "@/types/components";
import { firstZodIssueMessage } from "@/lib/utils";
import {
  googleAuthSchema,
  loginSchema,
  registerSchema,
} from "@/schemas/validationSchemas";

function getGis() {
  return window.google?.accounts?.id;
}

export function LoginForm({ forceMode, linkTo }: LoginFormProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<AuthenticateMode>(forceMode ?? "login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const googleClientId =
    (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ?? undefined;
  const [gisReady, setGisReady] = useState(false);
  const [googleBtnRendered, setGoogleBtnRendered] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement | null>(null);

  const navigate = useNavigate();

  const {
    isAuthenticated,
    isLoading,
    error: authError,
    loginWithGoogle,
    login,
    register,
  } = useAuth();

  const error = localError || authError;

  useEffect(() => {
    if (isAuthenticated) {
      if (import.meta.env.DEV)
        console.log("Usuario autenticado, redirigiendo al dashboard...");
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (forceMode) setMode(forceMode);
    setLocalError(null);
    setGoogleBtnRendered(false);
  }, [forceMode]);

  useEffect(() => {
    const checkGisLoaded = () => {
      const gis = getGis();
      if (gis) {
        setGisReady(true);
        return true;
      }
      return false;
    };
    if (!checkGisLoaded()) {
      const i = window.setInterval(() => {
        if (checkGisLoaded()) {
          window.clearInterval(i);
        }
      }, 300);
      return () => window.clearInterval(i);
    }
    return;
  }, []);

  useEffect(() => {
    const apiG = getGis();
    if (!apiG || !googleBtnRef.current) return;
    if (!googleClientId) {
      if (import.meta.env.DEV) console.error("Google Client ID no configurado");
      setLocalError(t("auth.googleClientIdError"));
      return;
    }
    if (!gisReady || googleBtnRendered) return;

    googleBtnRef.current.innerHTML = "";
    try {
      apiG.initialize({
        client_id: googleClientId,
        callback: (resp) => {
          void (async () => {
            const idToken = resp?.credential;
            if (!idToken) {
              setLocalError(t("auth.googleAuthError"));
              return;
            }

            const tokenValidation = googleAuthSchema.safeParse({ idToken });
            if (!tokenValidation.success) {
              setLocalError(firstZodIssueMessage(tokenValidation.error));
              return;
            }
            const result = await loginWithGoogle(tokenValidation.data.idToken);
            if (result.success) {
              setOk(t("auth.googleLoginSuccess"));
            } else {
              setLocalError(result.error || t("auth.googleLoginError"));
            }
          })();
        },
        ux_mode: "popup",
        use_fedcm_for_prompt: false,
      });

      apiG.renderButton(googleBtnRef.current, {
        type: "standard",
        size: "large",
        width: 240,
        theme: "outline",
        text: "signin_with",
        shape: "rectangular",
        locale: "es",
      });

      setGoogleBtnRendered(true);
    } catch (error) {
      if (import.meta.env.DEV)
        console.error("Error al inicializar Google Sign-In:", error);
      setLocalError(t("auth.googleInitError"));
    }
  }, [googleClientId, gisReady, googleBtnRendered, loginWithGoogle, t]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);
    setOk(null);

    if (mode === "register") {
      const parsed = registerSchema.safeParse({ name, email, password });
      if (!parsed.success) {
        setLocalError(firstZodIssueMessage(parsed.error));
        return;
      }
      const result = await register(
        parsed.data.name,
        parsed.data.email,
        parsed.data.password,
      );
      if (result.success) {
        setOk(t("auth.registerSuccess"));
      } else {
        setLocalError(result.error || t("auth.authError"));
      }
      return;
    }

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setLocalError(firstZodIssueMessage(parsed.error));
      return;
    }

    const result = await login(parsed.data.email, parsed.data.password);
    if (result.success) {
      setOk(t("auth.loginSuccess"));
    } else {
      setLocalError(result.error || t("auth.authError"));
    }
  }
  const otherHref = linkTo ?? (mode === "login" ? "/register" : "/login");
  return (
    <div className="flex flex-col items-center justify-center p-6 md:p-10">
      <div className="mx-auto w-full max-w-sm md:max-w-md">
        <Card className="shadow-lg border-border/50 bg-card/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl tracking-tight">
              {mode === "login" ? t("auth.login") : t("auth.register")}
            </CardTitle>
            <CardDescription>{t("auth.welcomeTo")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <FieldGroup>
                {mode === "register" && (
                  <Field>
                    <FieldLabel>{t("auth.name")}</FieldLabel>
                    <Input
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      disabled={isLoading}
                    />
                  </Field>
                )}

                <Field>
                  <FieldLabel>{t("auth.email")}</FieldLabel>
                  <Input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="JohnDoe@example.com"
                    disabled={isLoading}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel>{t("auth.password")}</FieldLabel>
                  <Input
                    type="password"
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLoading}
                    required
                  />
                </Field>
                {error && (
                  <FieldDescription className="text-center text-destructive">
                    {error}
                  </FieldDescription>
                )}
                {ok && (
                  <FieldDescription className="text-center text-green-600 dark:text-green-400">
                    {ok}
                  </FieldDescription>
                )}
                {(() => {
                  const buttonText = isLoading
                    ? t("auth.loading")
                    : mode === "login"
                      ? t("auth.enter")
                      : t("auth.registerMe");
                  return (
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full"
                    >
                      {buttonText}
                    </Button>
                  );
                })()}
                {forceMode ? (
                  <Link
                    to={otherHref}
                    className="inline-flex w-full items-center justify-center rounded-md border px-3 py-2 text-sm hover:text-foreground"
                  >
                    {mode === "login"
                      ? t("auth.createAccount")
                      : t("auth.haveAccount")}
                  </Link>
                ) : (
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      setMode(mode === "login" ? "register" : "login");
                    }}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {mode === "login"
                      ? t("auth.createAccount")
                      : t("auth.haveAccount")}
                  </Button>
                )}
                <div className="w-full flex justify-center h-11 relative">
                  {!googleBtnRendered && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-60 h-11 bg-muted/50 animate-pulse rounded-md" />
                    </div>
                  )}
                  <div
                    ref={googleBtnRef}
                    className={`w-full flex justify-center ${googleBtnRendered ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
                  />
                </div>
                <FieldDescription className="text-center text-xs text-muted-foreground">
                  {t("auth.termsAndPrivacy")}
                </FieldDescription>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
