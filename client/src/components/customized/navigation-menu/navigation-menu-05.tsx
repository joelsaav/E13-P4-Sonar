import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { navigationItems } from "@/config/navigation";
import { useTranslation } from "react-i18next";

export default function NavigationMenuWithActiveItem() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <NavigationMenu>
      <NavigationMenuList className="space-x-2">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.href;

          return (
            <NavigationMenuItem key={item.title}>
              <NavigationMenuLink
                className={cn(
                  "relative group inline-flex h-9 w-max items-center justify-center px-0.5 py-2 text-sm font-medium",
                  "before:absolute before:bottom-0 before:inset-x-0 before:h-[2px] before:bg-primary before:scale-x-0 before:transition-transform",
                  "hover:before:scale-x-100 hover:text-accent-foreground hover:bg-transparent",
                  "focus:before:scale-x-100 focus:text-accent-foreground focus:outline-hidden focus:bg-transparent",
                  "disabled:pointer-events-none disabled:opacity-50",
                  isActive && "before:scale-x-100",
                )}
                asChild
              >
                <Button
                  variant="ghost"
                  leftIcon={item.icon}
                  iconSize={20}
                  className="flex-row items-center gap-2.5 inline-flex p-0 hover:bg-transparent focus:bg-transparent active:bg-transparent"
                  onClick={() => navigate(item.href)}
                >
                  {t(item.title)}
                </Button>
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
