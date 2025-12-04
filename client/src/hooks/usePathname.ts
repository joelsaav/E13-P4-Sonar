/**
 * @file usePathname.ts
 * @description Hook personalizado para obtener la ruta actual del navegador.
 * Escucha los cambios en la URL y actualiza el valor retornado en consecuencia.
 */

import { useEffect, useState } from "react";

export function usePathname(): string {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const onChange = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onChange);
    window.addEventListener("hashchange", onChange);
    return () => {
      window.removeEventListener("popstate", onChange);
      window.removeEventListener("hashchange", onChange);
    };
  }, []);
  return path;
}
