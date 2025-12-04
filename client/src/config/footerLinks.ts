/**
 * Enlaces de navegación para el footer.
 * Proporciona enlaces rápidos a diferentes secciones de la aplicación.
 */

export const getFooterLinks = () => {
  const isAuthed =
    typeof localStorage !== "undefined" && !!localStorage.getItem("token");

  return [
    {
      to: isAuthed ? "/dashboard" : "/",
      label: "Inicio",
      icon: "IconMap",
      ariaLabel: "Inicio",
    },
    {
      to: "/contacts",
      label: "Contacto",
      icon: "IconUser",
      ariaLabel: "Contacto",
    },
    {
      to: "/settings",
      label: "Ajustes",
      icon: "IconSettings",
      ariaLabel: "Ajustes",
    },
  ];
};
