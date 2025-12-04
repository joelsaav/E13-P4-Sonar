import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import { useAppDispatch } from "./useRedux";
import {
  updateUserProfile,
  changeUserPassword,
  deleteUserAccount,
} from "@/store/slices/authSlice";
import {
  updateNameSchema,
  changePasswordSchema,
} from "@/schemas/validationSchemas";
import { firstZodIssueMessage } from "@/lib/utils";

export function useSettings() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, signOut } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const email = user?.email;
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [currPass, setCurrPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);
  const [notifMsg, setNotifMsg] = useState<string | null>(null);
  const [deleteAccountMsg, setDeleteAccountMsg] = useState<string | null>(null);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);

    const validation = updateNameSchema.safeParse({ name });
    if (!validation.success) {
      setProfileMsg(firstZodIssueMessage(validation.error));
      return;
    }

    setSavingProfile(true);
    const result = await dispatch(
      updateUserProfile({ name: validation.data.name }),
    );
    setSavingProfile(false);

    if (updateUserProfile.fulfilled.match(result)) {
      setProfileMsg("Nombre actualizado correctamente.");
    } else {
      setProfileMsg(
        (result.payload as string) || "Error al actualizar el perfil.",
      );
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (user?.isGoogleAuthUser) {
      setPasswordMsg(
        "Los usuarios de Google no pueden cambiar contraseña aquí.",
      );
      return;
    }

    const validation = changePasswordSchema.safeParse({
      currentPassword: currPass,
      newPassword: newPass,
    });
    if (!validation.success) {
      setPasswordMsg(firstZodIssueMessage(validation.error));
      return;
    }

    setSavingPassword(true);
    const result = await dispatch(changeUserPassword(validation.data));
    setSavingPassword(false);

    if (changeUserPassword.fulfilled.match(result)) {
      setPasswordMsg("Contraseña actualizada correctamente.");
      setCurrPass("");
      setNewPass("");
    } else {
      setPasswordMsg(
        (result.payload as string) || "Error al actualizar la contraseña.",
      );
    }
  };

  const toggleEmailNotifications = async () => {
    const newValue = !user?.emailNotifications;
    setNotifMsg(null);
    const result = await dispatch(
      updateUserProfile({ emailNotifications: newValue }),
    );

    if (updateUserProfile.fulfilled.match(result)) {
      setNotifMsg(
        `Notificaciones por correo ${newValue ? "activadas" : "desactivadas"}.`,
      );
    } else {
      setNotifMsg(
        (result.payload as string) || "Error al cambiar notificaciones.",
      );
    }
  };

  const togglePushNotifications = async () => {
    const newValue = !user?.pushNotifications;
    setNotifMsg(null);

    const result = await dispatch(
      updateUserProfile({ pushNotifications: newValue }),
    );

    if (updateUserProfile.fulfilled.match(result)) {
      setNotifMsg(
        `Notificaciones push ${newValue ? "activadas" : "desactivadas"}.`,
      );
    } else {
      setNotifMsg(
        (result.payload as string) || "Error al cambiar notificaciones.",
      );
    }
  };

  const deleteAccount = async () => {
    if (
      !window.confirm(
        "Esta acción es irreversible. ¿Seguro que quieres eliminar tu cuenta?",
      )
    ) {
      return;
    }

    setDeleteAccountMsg(null);
    const result = await dispatch(deleteUserAccount());

    if (deleteUserAccount.fulfilled.match(result)) {
      signOut();
      navigate("/", { replace: true });
    } else {
      setDeleteAccountMsg(
        (result.payload as string) || "Error al eliminar la cuenta.",
      );
    }
  };

  return {
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
    isGoogleUser: user?.isGoogleAuthUser,
    emailNotifications: user?.emailNotifications ?? false,
    pushNotifications: user?.pushNotifications ?? false,
    toggleEmailNotifications,
    togglePushNotifications,
    notifMsg,
    deleteAccount,
    deleteAccountMsg,
  };
}
