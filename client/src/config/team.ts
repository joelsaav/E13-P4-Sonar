/**
 * @file team.ts
 * @description Configuración del equipo de desarrollo.
 * Define los miembros del equipo con toda su información de contacto.
 */

import { TeamMember } from "@/types/team";

export const team: TeamMember[] = [
  {
    name: "Laura Álvarez Zamora",
    email: "alu0101349824@ull.edu.es",
    url: "https://campusvirtual.ull.es/2526/ingenieriaytecnologia/user/profile.php",
    avatarUrl: "https://cdn-icons-png.flaticon.com/512/6997/6997662.png",
    ringClass: "ring-fuchsia-400/40 dark:ring-fuchsia-500/30",
  },
  {
    name: "Tomás Pino Pérez",
    email: "alu0101474311@ull.edu.es",
    url: "https://campusvirtual.ull.es/2526/ingenieriaytecnologia/user/profile.php?id=25260100799",
    avatarUrl:
      "https://www.svgrepo.com/show/382101/male-avatar-boy-face-man-user.svg",
    ringClass: "ring-sky-400/40 dark:ring-sky-500/30",
  },
  {
    name: "Joel Saavedra Paez",
    email: "alu0101437415@ull.edu.es",
    url: "https://campusvirtual.ull.es/2526/ingenieriaytecnologia/user/profile.php?id=25260100740",
    avatarUrl:
      "https://mediaworkx.b-cdn.net/wp-content/uploads/2016/01/Avators-3.png",
    ringClass: "ring-red-400/40 dark:ring-red-500/30",
  },
];
