# 🚀 INICIO RÁPIDO - Soft ProConnect Peru SAC

## ⚡ Empezar a Desarrollar (3 Pasos)

### 1️⃣ Hacer Build Inicial
```bash
npm run build
```
O doble click en: **`rebuild.bat`**

### 2️⃣ Iniciar Servidor
Doble click en: **`start-server.bat`**

### 3️⃣ Abrir Navegador
**http://localhost:3000/**

---

## 🔑 Credenciales de Prueba

**Administrador:**
- Email: `admin@proconnect.com`
- Password: `admin123`

**Usuario Demo:**
- Email: `demo@proconnect.com`
- Password: `demo123`

---

## 🛠️ Flujo de Trabajo Diario

### Mientras Desarrollas:

1. **Edita el código** en tu editor (VS Code, etc.)
2. **Guarda** los archivos (Ctrl+S)
3. **Haz rebuild:**
   - Doble click en `rebuild.bat`
   - O ejecuta: `npm run build`
4. **Recarga el navegador** (F5)

### Al Terminar el Día:

```bash
git add .
git commit -m "Descripción de cambios del día

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
git push
```

Vercel desplegará automáticamente en 2-3 minutos.

---

## 📁 Scripts Útiles

| Script | Descripción |
|--------|-------------|
| `rebuild.bat` | Hace build del proyecto |
| `start-server.bat` | Inicia el servidor local |
| `check-deployment.bat` | Verifica deployment en Vercel |
| `dev.bat` | Información de desarrollo |

---

## 🌐 URLs

- **Local:** http://localhost:3000/
- **Producción:** https://agente-proconnect.vercel.app/
- **GitHub:** https://github.com/corpinfonet-creator/AgenteProconnect

---

## 📊 Páginas Disponibles

| URL | Descripción |
|-----|-------------|
| `/` | Login page |
| `/dashboard` | Dashboard (requiere login) |
| `/register` | Registro de nuevos usuarios |
| `/status` | Estado del sistema |
| `/api/health` | Health check API |

---

## 🆘 Problemas Comunes

### Puerto 3000 ocupado
```bash
npx kill-port 3000
```

### Build falla
```bash
rm -rf .nitro .output
npm run build
```

### Cambios no se ven
1. Asegúrate de guardar el archivo (Ctrl+S)
2. Haz rebuild (`rebuild.bat`)
3. Recarga con Ctrl+F5 (hard reload)

---

## 💡 Tips

- **Mantén el servidor corriendo** mientras desarrollas
- **Solo haz rebuild** cuando cambies código
- **Solo recarga el navegador** después del rebuild
- **Sube a GitHub** solo cuando termines (1 vez al día o cuando esté listo)

---

## 🎯 Ejemplo de Sesión de Trabajo

```bash
# Mañana 9:00 AM
1. Doble click en: rebuild.bat
2. Doble click en: start-server.bat
3. Abrir: http://localhost:3000/

# Durante el día (repetir N veces)
4. Editar archivos
5. Guardar (Ctrl+S)
6. rebuild.bat
7. F5 en navegador

# Al terminar (5:00 PM)
8. git add .
9. git commit -m "Trabajo del día"
10. git push
11. Cerrar start-server.bat (Ctrl+C)
```

---

**¡Listo para empezar!** 🚀

Para más detalles, lee: `ESTADO-ACTUAL.md`
