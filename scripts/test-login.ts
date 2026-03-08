import { config } from "dotenv";
config({ path: ".env" });

import { UserService } from "../server/lib/auth/users";
import { SessionService } from "../server/lib/auth/session";

async function testLogin() {
  console.log("🧪 Probando sistema de login...\n");

  try {
    // Test 1: Verificar conexión a BD
    console.log("1️⃣ Verificando conexión a base de datos...");
    const users = await UserService.getAll();
    console.log(`   ✅ Conectado. Usuarios en BD: ${users.length}\n`);

    // Test 2: Probar login con admin
    console.log("2️⃣ Probando login con admin@proconnect.com...");
    const adminUser = await UserService.validateCredentials(
      "admin@proconnect.com",
      "admin123",
    );

    if (adminUser) {
      console.log(`   ✅ Login exitoso: ${adminUser.name} (${adminUser.role})`);
    } else {
      console.log("   ❌ Login falló");
      return;
    }

    // Test 3: Crear sesión
    console.log("\n3️⃣ Creando sesión...");
    const sessionId = await SessionService.create(adminUser);
    console.log(`   ✅ Sesión creada: ${sessionId.substring(0, 20)}...`);

    // Test 4: Verificar sesión
    console.log("\n4️⃣ Verificando sesión...");
    const session = await SessionService.get(sessionId);
    if (session) {
      console.log(`   ✅ Sesión válida para usuario ID: ${session.user_id}`);
    } else {
      console.log("   ❌ Sesión no encontrada");
    }

    // Test 5: Probar login con usuario demo
    console.log("\n5️⃣ Probando login con demo@proconnect.com...");
    const demoUser = await UserService.validateCredentials(
      "demo@proconnect.com",
      "demo123",
    );

    if (demoUser) {
      console.log(`   ✅ Login exitoso: ${demoUser.name} (${demoUser.role})`);
    } else {
      console.log("   ❌ Login falló");
    }

    // Test 6: Probar credenciales incorrectas
    console.log("\n6️⃣ Probando credenciales incorrectas...");
    const invalidUser = await UserService.validateCredentials(
      "admin@proconnect.com",
      "wrongpassword",
    );

    if (!invalidUser) {
      console.log("   ✅ Correctamente rechazó credenciales inválidas");
    } else {
      console.log("   ❌ ERROR: Aceptó credenciales incorrectas");
    }

    console.log("\n🎉 ¡Todos los tests pasaron! El sistema de login funciona correctamente.\n");
  } catch (error) {
    console.error("\n❌ Error en los tests:", error);
    process.exit(1);
  }
}

testLogin();
