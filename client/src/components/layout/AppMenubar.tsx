import Logo from "@/assets/Logo";
import DropdownMenuWithIcon from "@/components/layout/UserMenu";
import NavigationMenuWithActiveItem from "@/components/layout/NavigationMenu";
import ThemeToggle from "@/components/layout/ThemeToggle";
import LanguageSelector from "@/components/layout/LanguageSelector";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { navigationItems } from "@/config/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function AppMenubar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    signOut();
    navigate("/", { replace: true });
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 max-w-6xl mx-auto px-2 sm:px-6 md:px-8 mt-2 sm:mt-4">
      <nav className="flex items-center justify-between w-full py-2 border border-border bg-card rounded-lg px-4 sm:px-6 md:px-8">
        <Link to="/" className="flex items-center gap-2 min-w-0">
          <Logo
            width={28}
            height={28}
            className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 primary"
          />
          <span className="text-base sm:text-lg md:text-xl font-semibold truncate max-w-[120px] sm:max-w-none">
            {t("app.name")}
          </span>
        </Link>

        <div className="hidden md:block">
          {isAuthenticated && <NavigationMenuWithActiveItem />}
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <>
              <NotificationBell />

              <div className="hidden md:flex md:items-center">
                <DropdownMenuWithIcon
                  onLogout={handleLogout}
                  userName={user?.name}
                  userEmail={user?.email}
                  userInitial={
                    user?.image
                      ? undefined
                      : user?.name && user.name.charAt(0).toUpperCase()
                  }
                  userImage={user?.image}
                  onSettings={() => navigate("/settings")}
                />
              </div>

              <div className="md:hidden">
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      leftIcon={"IconMenu2"}
                    />
                  </SheetTrigger>
                  <SheetContent side="right">
                    <SheetHeader>
                      <SheetTitle>{t("nav.menu")}</SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col gap-2 mt-6">
                      <div className="flex items-center gap-3 p-3 rounded-lg">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user?.image} alt={user?.name} />
                          <AvatarFallback>
                            {user?.name && user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{user?.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {navigationItems.map((item) => (
                          <Button
                            key={item.href}
                            variant="ghost"
                            className="justify-start"
                            leftIcon={item.icon}
                            onClick={() => {
                              navigate(item.href);
                              setMobileMenuOpen(false);
                            }}
                            text={t(item.title)}
                          />
                        ))}
                        <div className="border-t pt-4 flex flex-col gap-2">
                          <LanguageSelector variant="button" />
                          <Button
                            variant="ghost"
                            className="justify-start"
                            leftIcon="IconSettings"
                            onClick={() => {
                              navigate("/settings");
                              setMobileMenuOpen(false);
                            }}
                            text={t("nav.settings")}
                          />
                          <Button
                            variant="ghost"
                            className="justify-start text-destructive"
                            leftIcon="IconLogout"
                            onClick={handleLogout}
                            text={t("auth.logout")}
                          />
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </>
          )}
          {!isAuthenticated && <LanguageSelector variant="button" />}
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
