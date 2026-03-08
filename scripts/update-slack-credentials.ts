/**
 * Script simple para actualizar credenciales de Slack en .env
 * Uso: npm run slack:credentials
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

console.log("\n🔑 ACTUALIZAR CREDENCIALES DE SLACK\n");
console.log("Pega tus credenciales cuando se te solicite.\n");
console.log("Presiona Enter después de cada una.\n");

const readline = require("readline");
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

function question(prompt: string): Promise<string> {
	return new Promise((resolve) => {
		rl.question(prompt, (answer: string) => {
			resolve(answer.trim());
		});
	});
}

async function updateCredentials() {
	try {
		// Solicitar credenciales
		console.log("📋 Client ID (formato: 1234567890.1234567890):");
		const clientId = await question("> ");

		if (!clientId || !clientId.includes(".")) {
			console.error(
				"\n❌ Error: Client ID inválido. Debe tener formato: 1234567890.1234567890",
			);
			process.exit(1);
		}

		console.log("\n🔐 Client Secret (cadena larga):");
		const clientSecret = await question("> ");

		if (!clientSecret || clientSecret.length < 30) {
			console.error(
				"\n❌ Error: Client Secret parece muy corto o vacío",
			);
			process.exit(1);
		}

		console.log("\n🔒 Signing Secret (cadena larga):");
		const signingSecret = await question("> ");

		if (!signingSecret || signingSecret.length < 30) {
			console.error(
				"\n❌ Error: Signing Secret parece muy corto o vacío",
			);
			process.exit(1);
		}

		rl.close();

		// Leer .env actual
		const envPath = join(process.cwd(), ".env");
		let envContent = readFileSync(envPath, "utf-8");

		// Actualizar credenciales
		envContent = envContent.replace(
			/SLACK_CLIENT_ID=.*/,
			`SLACK_CLIENT_ID=${clientId}`,
		);
		envContent = envContent.replace(
			/SLACK_CLIENT_SECRET=.*/,
			`SLACK_CLIENT_SECRET=${clientSecret}`,
		);
		envContent = envContent.replace(
			/SLACK_SIGNING_SECRET=.*/,
			`SLACK_SIGNING_SECRET=${signingSecret}`,
		);

		// Escribir archivo
		writeFileSync(envPath, envContent);

		console.log("\n✅ Credenciales actualizadas en .env\n");
		console.log("📝 Resumen:");
		console.log(`   Client ID: ${clientId.substring(0, 20)}...`);
		console.log(
			`   Client Secret: ${clientSecret.substring(0, 15)}...`,
		);
		console.log(
			`   Signing Secret: ${signingSecret.substring(0, 15)}...`,
		);

		console.log("\n🚀 Próximos pasos:");
		console.log("   1. Reinicia el servidor: npm run dev");
		console.log("   2. Ve a: http://localhost:3002/dashboard/slack");
		console.log('   3. Click en "Conectar con Slack"');
		console.log("   4. Autoriza la app\n");

		console.log("✨ ¡Listo!\n");
	} catch (error) {
		console.error("\n❌ Error:", error);
		process.exit(1);
	}
}

updateCredentials();
