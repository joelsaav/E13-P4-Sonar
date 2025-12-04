/**
 * @file SettingsPage.tsx
 * @description Página de ajustes donde los usuarios pueden modificar su perfil,
 * preferencias, notificaciones y privacidad.
 */

import {
  Save,
  User,
  Mail,
  KeyRound,
  Bell,
  Palette,
  Shield,
  Trash2,
  Languages,
} from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useTheme } from "@/hooks/useTheme";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUI } from "@/hooks/useUI";
import { SidebarWidth } from "@/store/slices/uiSlice";

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const {
    name,
    setName,
    email,
    saveProfile,
    profileMsg,
    savingProfile,
    currPass,
    setCurrPass,
    newPass,
    setNewPass,
    savePassword,
    passwordMsg,
    savingPassword,
    isGoogleUser,
    emailNotifications,
    pushNotifications,
    toggleEmailNotifications,
    togglePushNotifications,
    notifMsg,
    deleteAccount,
    deleteAccountMsg,
  } = useSettings();

  const { sidebarWidth, setSidebarWidth } = useUI();

  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const passwordHelperText = isGoogleUser
    ? t("settings.profile.googleUserPasswordInfo")
    : passwordMsg;

  // Cambiar tema (oscuro/claro)
  function handleToggleTheme() {
    setTheme(isDark ? "light" : "dark");
  }

  // Cambiar idioma
  function handleLanguageChange(lng: string) {
    i18n.changeLanguage(lng);
  }

  return (
    <div className="mx-auto w-full max-w-7xl p-6 space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("settings.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("settings.subtitle")}
        </p>
      </header>

      {/* Grid de tarjetas de configuración */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {/* Perfil - ocupa toda la fila en desktop */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" /> {t("settings.profile.title")}
            </CardTitle>
            <CardDescription>
              {t("settings.profile.description")}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Nombre y email */}
            <form onSubmit={saveProfile} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">{t("settings.profile.name")}</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("settings.profile.namePlaceholder")}
                  disabled={savingProfile}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="inline-flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" /> {t("settings.profile.email")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  readOnly
                />
              </div>

              <div className="sm:col-span-2 flex items-center justify-between gap-4 pt-2">
                <div className="text-sm text-muted-foreground">
                  {profileMsg}
                </div>
                <Button
                  type="submit"
                  className="inline-flex items-center gap-2"
                  disabled={savingProfile}
                >
                  <Save className="h-4 w-4" />
                  {savingProfile
                    ? t("settings.profile.saving")
                    : t("settings.profile.saveChanges")}
                </Button>
              </div>
            </form>

            {!isGoogleUser && <Separator />}

            {/* Contraseña */}
            {!isGoogleUser && (
              <form
                onSubmit={savePassword}
                className="grid gap-4 sm:grid-cols-2"
              >
                <div className="space-y-2">
                  <Label htmlFor="curr">
                    {t("settings.profile.currentPassword")}
                  </Label>
                  <Input
                    id="curr"
                    type="password"
                    value={currPass}
                    onChange={(e) => setCurrPass(e.target.value)}
                    disabled={isGoogleUser || savingPassword}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="new"
                    className="inline-flex items-center gap-2"
                  >
                    <KeyRound className="h-4 w-4" />{" "}
                    {t("settings.profile.newPassword")}
                  </Label>
                  <Input
                    id="new"
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    disabled={isGoogleUser || savingPassword}
                  />
                </div>

                <div className="sm:col-span-2 flex items-center justify-between gap-4 pt-2">
                  <div className="text-sm text-muted-foreground">
                    {passwordHelperText}
                  </div>
                  <Button
                    type="submit"
                    disabled={isGoogleUser || savingPassword}
                    className="inline-flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {savingPassword
                      ? t("settings.profile.saving")
                      : t("settings.profile.saveChanges")}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* PREFERENCIAS: tema e idioma */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" /> {t("settings.preferences.title")}
            </CardTitle>
            <CardDescription>
              {t("settings.preferences.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">
                  {t("settings.preferences.darkTheme")}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("settings.preferences.darkThemeDescription")}
                </div>
              </div>
              <Switch checked={isDark} onCheckedChange={handleToggleTheme} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  {t("settings.preferences.language")}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("settings.preferences.languageDescription")}
                </div>
              </div>
              <Select
                value={i18n.language}
                onValueChange={handleLanguageChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue
                    placeholder={t("settings.preferences.selectSize")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(i18n.options.supportedLngs)
                    ? (i18n.options.supportedLngs as string[])
                        .filter((lng: string) => lng && lng !== "cimode")
                        .map((lng: string) => {
                          const resources = i18n.getResourceBundle(
                            lng,
                            "translation",
                          );
                          const languageName = resources?.language?.name || lng;
                          const flag = resources?.language?.flag || "🌐";
                          return (
                            <SelectItem key={lng} value={lng}>
                              <span className="mr-1">{flag}</span>
                              {languageName}
                            </SelectItem>
                          );
                        })
                    : null}
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">
                  {t("settings.preferences.sidebarWidth")}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("settings.preferences.sidebarWidthDescription")}
                </div>
              </div>
              <Select
                value={sidebarWidth}
                onValueChange={(value) =>
                  setSidebarWidth(value as SidebarWidth)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue
                    placeholder={t("settings.preferences.selectSize")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">
                    {t("settings.preferences.compact")}
                  </SelectItem>
                  <SelectItem value="normal">
                    {t("settings.preferences.normal")}
                  </SelectItem>
                  <SelectItem value="wide">
                    {t("settings.preferences.wide")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* NOTIFICACIONES: persistentes */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" /> {t("settings.notifications.title")}
            </CardTitle>
            <CardDescription>
              {t("settings.notifications.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">
                  {t("settings.notifications.email")}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("settings.notifications.emailDescription")}
                </div>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={toggleEmailNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">
                  {t("settings.notifications.push")}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("settings.notifications.pushDescription")}
                </div>
              </div>
              <Switch
                checked={pushNotifications}
                onCheckedChange={togglePushNotifications}
              />
            </div>
            {notifMsg && (
              <div className="text-sm text-muted-foreground">{notifMsg}</div>
            )}
          </CardContent>
        </Card>

        {/* PRIVACIDAD: eliminar cuenta */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" /> {t("settings.privacy.title")}
            </CardTitle>
            <CardDescription>
              {t("settings.privacy.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {deleteAccountMsg && (
              <div className="text-sm text-muted-foreground">
                {deleteAccountMsg}
              </div>
            )}
            <Button
              variant="destructive"
              className="inline-flex items-center gap-2"
              onClick={deleteAccount}
            >
              <Trash2 className="h-4 w-4" />
              {t("settings.privacy.deleteAccount")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
