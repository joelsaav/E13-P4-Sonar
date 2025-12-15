import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";

interface ItemActionsMenuProps {
  onEdit?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  onUnshare?: () => void;
  align?: "start" | "end" | "center";
}

export function ItemActionsMenu({
  onEdit,
  onShare,
  onDelete,
  onUnshare,
  align = "start",
}: Readonly<ItemActionsMenuProps>) {
  const { t } = useTranslation();

  if (!onEdit && !onShare && !onDelete && !onUnshare) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" leftIcon={"IconDotsVertical"} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        {onShare && (
          <DropdownMenuItem onClick={onShare}>
            <Icon as="IconShare" ariaLabel={t("common.share")} />
            {t("common.share")}
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <Icon as="IconEdit" ariaLabel={t("common.edit")} />
            {t("common.edit")}
          </DropdownMenuItem>
        )}
        {(onShare || onEdit || onUnshare) && onDelete && (
          <DropdownMenuSeparator />
        )}
        {onUnshare && (
          <DropdownMenuItem
            variant="destructive"
            onClick={onUnshare}
            className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-100 dark:focus:bg-red-900/20"
          >
            <Icon
              as="IconTrash"
              ariaLabel={t("common.leave")}
              className="bg-red-500/10 text-red-600 dark:text-red-400 [&_svg]:stroke-red-600 dark:[&_svg]:stroke-red-400"
            />
            {t("common.leave")}
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem variant="destructive" onClick={onDelete}>
            <Icon
              as="IconTrash"
              ariaLabel={t("common.delete")}
              className="bg-red-500/10 text-red-600 dark:text-red-400 [&_svg]:stroke-red-600 dark:[&_svg]:stroke-red-400"
            />
            {t("common.delete")}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
