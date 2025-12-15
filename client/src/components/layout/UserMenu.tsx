import LanguageSelector from "@/components/layout/LanguageSelector";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Icon from "@/components/ui/icon";
import { useTranslation } from "react-i18next";

type Props = {
  onProfile?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
  userName?: string;
  userEmail?: string;
  userInitial?: string;
  userImage?: string;
};

export default function DropdownMenuWithIcon({
  onProfile,
  onSettings,
  userName,
  userEmail,
  onLogout,
  userInitial = "A",
  userImage,
}: Readonly<Props>) {
  const { t } = useTranslation();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-primary rounded-full">
        <Avatar>
          {userImage && <AvatarImage src={userImage} alt={userName} />}
          <AvatarFallback>{userInitial}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{userName || t("auth.myAccount")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {userEmail && (
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            ({userEmail})
          </DropdownMenuLabel>
        )}
        {onProfile && (
          <DropdownMenuItem onClick={onProfile}>
            <Icon as="IconUser" /> {t("auth.profile")}
          </DropdownMenuItem>
        )}
        <LanguageSelector />
        <DropdownMenuItem onClick={onSettings}>
          <Icon as="IconSettings" /> {t("nav.settings")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive" onClick={onLogout}>
          <Icon as="IconLogout" /> {t("auth.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
