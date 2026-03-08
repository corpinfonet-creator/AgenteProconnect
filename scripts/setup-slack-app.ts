/**
 * Script interactivo para configurar Slack App
 * Te guía en el proceso de crear la app y configurar credenciales
 */

import { input } from "@inquirer/input";
import { confirm } from "@inquirer/prompts";
import { writeFileSync, readFileSync } from "fs";
import { join } from "path";
import chalk from "chalk";
import boxen from "boxen";

async function setupSlackApp() {
	console.clear();

	console.log(
		boxen(
			chalk.bold.blue("🚀 Configuración de Slack App\n") +
				chalk.gray("Asistente interactivo"),
			{
				padding: 1,
				margin: 1,
				borderStyle: "round",
				borderColor: "blue",
			},
		),
	);

	console.log(chalk.yellow("📋 PASOS QUE VAMOS A SEGUIR:\n"));
	console.log("  1. Abrir Slack API en tu navegador");
	console.log("  2. Crear nueva Slack App");
	console.log("  3. Configurar OAuth & Permissions");
	console.log("  4. Copiar credenciales");
	console.log("  5. Actualizar archivo .env");
	console.log("");

	const ready = await confirm({
		message: "¿Estás listo para comenzar?",
		default: true,
	});

	if (!ready) {
		console.log(chalk.red("\n❌ Configuración cancelada"));
		process.exit(0);
	}

	// Paso 1: Crear la app
	console.log(
		chalk.cyan("\n" + "=".repeat(50)),
	);
	console.log(chalk.bold.cyan("📱 PASO 1: Crear Slack App"));
	console.log(chalk.cyan("=".repeat(50) + "\n"));

	console.log(
		chalk.yellow("🌐 Abriendo Slack API en tu navegador..."),
	);
	console.log(chalk.gray("   URL: https://api.slack.com/apps\n"));

	// Abrir navegador
	const { exec } = await import("child_process");
	exec("start https://api.slack.com/apps");

	await new Promise((resolve) => setTimeout(resolve, 2000));

	console.log(chalk.white("📝 Instrucciones:\n"));
	console.log(
		chalk.white(
			'  1. Click en el botón verde "Create New App"',
		),
	);
	console.log(chalk.white('  2. Selecciona "From scratch"'));
	console.log(
		chalk.white(
			"  3. App Name: Asistente IA - [Tu Empresa]",
		),
	);
	console.log(
		chalk.white("  4. Selecciona tu workspace"),
	);
	console.log(chalk.white('  5. Click "Create App"\n'));

	const appCreated = await confirm({
		message: "¿Ya creaste la app?",
		default: false,
	});

	if (!appCreated) {
		console.log(
			chalk.red(
				"\n❌ Por favor crea la app y vuelve a ejecutar este script",
			),
		);
		process.exit(0);
	}

	// Paso 2: Configurar OAuth
	console.log(
		chalk.cyan("\n" + "=".repeat(50)),
	);
	console.log(
		chalk.bold.cyan("🔐 PASO 2: Configurar OAuth & Permissions"),
	);
	console.log(chalk.cyan("=".repeat(50) + "\n"));

	console.log(
		chalk.white(
			"📝 En el menú lateral izquierdo, busca y click en:",
		),
	);
	console.log(chalk.green('   "OAuth & Permissions"\n'));

	console.log(chalk.yellow("📍 Configurar Redirect URLs:\n"));
	console.log(
		chalk.white(
			'  1. Scroll hasta "Redirect URLs"',
		),
	);
	console.log(
		chalk.white(
			'  2. Click "Add New Redirect URL"',
		),
	);
	console.log(
		chalk.white(
			"  3. Agregar esta URL:",
		),
	);
	console.log(
		chalk.green(
			"     http://localhost:3002/api/slack/oauth/callback",
		),
	);
	console.log(
		chalk.white(
			'  4. Click "Add"',
		),
	);
	console.log(
		chalk.white(
			'  5. Click "Save URLs" (abajo)\n',
		),
	);

	const redirectAdded = await confirm({
		message: "¿Ya agregaste la Redirect URL?",
		default: false,
	});

	if (!redirectAdded) {
		console.log(
			chalk.red(
				"\n⚠️  No olvides agregar la Redirect URL antes de continuar",
			),
		);
	}

	console.log(
		chalk.yellow("\n🔑 Configurar Bot Token Scopes:\n"),
	);
	console.log(
		chalk.white(
			'  1. Scroll hasta "Scopes" → "Bot Token Scopes"',
		),
	);
	console.log(
		chalk.white(
			'  2. Click "Add an OAuth Scope" para cada uno:\n',
		),
	);

	const scopes = [
		"chat:write",
		"chat:write.public",
		"channels:history",
		"channels:read",
		"groups:history",
		"groups:read",
		"im:history",
		"im:read",
		"im:write",
		"mpim:history",
		"mpim:read",
		"mpim:write",
		"app_mentions:read",
		"users:read",
		"team:read",
	];

	console.log(chalk.gray("     Bot Token Scopes a agregar:"));
	for (const scope of scopes) {
		console.log(chalk.green(`     ✓ ${scope}`));
	}

	console.log(
		chalk.white(
			'\n  3. En "User Token Scopes", agregar:',
		),
	);
	console.log(chalk.green("     ✓ identity.basic"));
	console.log(chalk.green("     ✓ identity.email\n"));

	const scopesAdded = await confirm({
		message: `¿Ya agregaste todos los scopes (${scopes.length + 2} en total)?`,
		default: false,
	});

	if (!scopesAdded) {
		console.log(
			chalk.red(
				"\n⚠️  Asegúrate de agregar todos los scopes antes de continuar",
			),
		);
	}

	// Paso 3: Obtener credenciales
	console.log(
		chalk.cyan("\n" + "=".repeat(50)),
	);
	console.log(
		chalk.bold.cyan(
			"🔑 PASO 3: Obtener Credenciales",
		),
	);
	console.log(chalk.cyan("=".repeat(50) + "\n"));

	console.log(
		chalk.white(
			"📝 En el menú lateral, click en:",
		),
	);
	console.log(chalk.green('   "Basic Information"\n'));

	console.log(
		chalk.white(
			'🔍 Scroll hasta "App Credentials"\n',
		),
	);

	console.log(
		chalk.yellow(
			"Ahora vamos a copiar las credenciales:\n",
		),
	);

	// Client ID
	const clientId = await input({
		message: "📋 Pega tu Client ID:",
		validate: (value) => {
			if (!value) return "Client ID es requerido";
			if (!value.includes("."))
				return "Client ID debe tener formato: 1234567890.1234567890";
			return true;
		},
	});

	// Client Secret
	console.log(
		chalk.gray(
			'\n💡 Tip: Click "Show" al lado de Client Secret para verlo\n',
		),
	);
	const clientSecret = await input({
		message: "🔐 Pega tu Client Secret:",
		validate: (value) => {
			if (!value) return "Client Secret es requerido";
			if (value.length < 30)
				return "Client Secret parece muy corto";
			return true;
		},
	});

	// Signing Secret
	console.log(
		chalk.gray(
			'\n💡 Tip: Click "Show" al lado de Signing Secret para verlo\n',
		),
	);
	const signingSecret = await input({
		message: "🔒 Pega tu Signing Secret:",
		validate: (value) => {
			if (!value) return "Signing Secret es requerido";
			if (value.length < 30)
				return "Signing Secret parece muy corto";
			return true;
		},
	});

	// Paso 4: Actualizar .env
	console.log(
		chalk.cyan("\n" + "=".repeat(50)),
	);
	console.log(
		chalk.bold.cyan("💾 PASO 4: Actualizar .env"),
	);
	console.log(chalk.cyan("=".repeat(50) + "\n"));

	try {
		const envPath = join(process.cwd(), ".env");
		let envContent = readFileSync(envPath, "utf-8");

		// Actualizar las credenciales
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

		console.log(chalk.green("✅ Archivo .env actualizado correctamente\n"));

		// Mostrar resumen
		console.log(
			boxen(
				chalk.bold.green("🎉 ¡CONFIGURACIÓN COMPLETADA!\n\n") +
					chalk.white("Credenciales guardadas:\n") +
					chalk.gray(
						`Client ID: ${clientId.substring(0, 15)}...\n`,
					) +
					chalk.gray(
						`Client Secret: ${clientSecret.substring(0, 10)}...\n`,
					) +
					chalk.gray(
						`Signing Secret: ${signingSecret.substring(0, 10)}...`,
					),
				{
					padding: 1,
					margin: 1,
					borderStyle: "round",
					borderColor: "green",
				},
			),
		);

		console.log(chalk.yellow("\n🚀 PRÓXIMOS PASOS:\n"));
		console.log(
			chalk.white(
				"  1. Reiniciar el servidor:",
			),
		);
		console.log(chalk.green("     npm run dev\n"));
		console.log(
			chalk.white("  2. Abrir el dashboard:"),
		);
		console.log(
			chalk.green(
				"     http://localhost:3002/dashboard\n",
			),
		);
		console.log(
			chalk.white(
				'  3. Click en "🔗 Conectar Slack"\n',
			),
		);
		console.log(
			chalk.white(
				"  4. Autorizar la app en Slack\n",
			),
		);
		console.log(
			chalk.white(
				"  5. ¡Listo! Tu workspace estará conectado ✅\n",
			),
		);

		const openDashboard = await confirm({
			message:
				"¿Quieres que abra el dashboard ahora?",
			default: true,
		});

		if (openDashboard) {
			console.log(
				chalk.yellow(
					"\n🌐 Abriendo dashboard...\n",
				),
			);
			exec("start http://localhost:3002/dashboard");
		}

		console.log(
			chalk.green(
				"\n✨ ¡Configuración exitosa! Puedes comenzar a usar tu bot.\n",
			),
		);
	} catch (error) {
		console.error(
			chalk.red("\n❌ Error al actualizar .env:"),
			error,
		);
		process.exit(1);
	}
}

// Ejecutar
setupSlackApp().catch((error) => {
	console.error(chalk.red("\n💥 Error:"), error);
	process.exit(1);
});
