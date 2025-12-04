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
  align?: "start" | "end" | "center";
}

export function ItemActionsMenu({
  onEdit,
  onShare,
  onDelete,
  align = "start",
}: ItemActionsMenuProps) {
  const { t } = useTranslation();
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
        {(onShare || onEdit) && onDelete && <DropdownMenuSeparator />}
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
