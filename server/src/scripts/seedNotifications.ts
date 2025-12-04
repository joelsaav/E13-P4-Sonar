import { PrismaClient } from "@prisma/client";
import { createNotification } from "../controllers/notificationsController.js";

// Crear una nueva instancia de Prisma para este script
const prisma = new PrismaClient();

/**
 * Script de ejemplo para insertar notificaciones de prueba
 * Ejecutar con: tsx src/scripts/seedNotifications.ts
 */
async function seedNotifications() {
  try {
    const userEmails = [
      "alu0101349824@ull.edu.es",
      // "alu0101437415@ull.edu.es",
      // "alu0101474311@ull.edu.es",
    ];

    let totalNotifications = 0;

    for (const email of userEmails) {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        console.log(`⚠️ Usuario no encontrado: ${email}`);
        continue;
      }

      console.log(`Creando notificaciones para: ${user.email}`);

      // Crear notificaciones usando la función createNotification
      // que automáticamente enviará emails si el usuario los tiene activados
      const notificationData = [
        {
          type: "GENERAL" as const,
          title: "Bienvenido a TaskGrid",
          description: "Tu cuenta ha sido creada exitosamente",
          actorName: "Sistema",
        },
        {
          type: "FILE" as const,
          title: "Compartió archivos",
          description: "alu0101xxxxx1 compartió 2 archivos en TaskGrid",
          actorName: "alu0101xxxxx1",
        },
        {
          type: "MENTION" as const,
          title: "Nueva mención",
          description: "alu0101xxxxx2 comentó y te mencionó en una tarea",
          actorName: "alu0101xxxxx2",
        },
        {
          type: "INBOX" as const,
          title: "Solicitud de acceso",
          description: "alu0101xxxxx3 pidió acceso a una lista en TaskGrid",
          actorName: "alu0101xxxxx3",
        },
      ];

      // Crear notificaciones una por una usando createNotification
      for (const data of notificationData) {
        await createNotification(
          user.id,
          data.type,
          data.title,
          data.description,
          data.actorName,
        );
      }

      totalNotifications += notificationData.length;
      console.log(`  ✅ ${notificationData.length} notificaciones creadas`);
    }

    console.log(
      `\n✅ Total: ${totalNotifications} notificaciones de prueba creadas`,
    );
  } catch (error) {
    console.error("Error al crear notificaciones:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedNotifications();
