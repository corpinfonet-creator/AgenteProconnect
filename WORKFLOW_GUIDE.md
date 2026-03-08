# 🚀 Guía de Flujo de Trabajo: Local → GitHub → Vercel

## 📝 Ejemplo Práctico: Cambiar el Color del Botón de Login

### Paso 1: Desarrollo Local

```bash
# 1. Abrir terminal en el proyecto
cd C:\xampp\htdocs\AgenteProconnect

# 2. Iniciar servidor de desarrollo
npm run dev

# Verás:
# ✔ Nitro built in 345 ms
# > Local: http://localhost:3000/
```

### Paso 2: Hacer el Cambio

```bash
# 3. Abrir el archivo en tu editor
code server/routes/html.ts

# 4. Buscar el CSS del botón de login (.btn-login)
# 5. Cambiar el color:

# ANTES:
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

# DESPUÉS:
background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);

# 6. Guardar el archivo (Ctrl+S)
```

### Paso 3: Probar en el Navegador

```bash
# 7. Abrir navegador
# http://localhost:3000/

# 8. Ver el cambio (el botón ahora es azul)
# 9. Probar que el login sigue funcionando
```

### Paso 4: Verificar que Funciona

```bash
# 10. En la terminal (Ctrl+C para detener el servidor)
npm run build

# Si sale:
# ✔ Nitro built in XXX ms
# ✅ Todo bien, continuar

# Si sale error:
# ❌ Arreglar el error antes de continuar
```

### Paso 5: Preparar Commit

```bash
# 11. Ver qué cambió
git status

# Verás:
# modified:   server/routes/html.ts

# 12. Ver las diferencias exactas
git diff server/routes/html.ts

# Verás las líneas que cambiaron
```

### Paso 6: Hacer Commit

```bash
# 13. Agregar el archivo
git add server/routes/html.ts

# 14. Hacer commit con mensaje descriptivo
git commit -m "Style: Cambiar botón de login de morado a azul"
```

### Paso 7: Subir a GitHub

```bash
# 15. Subir a GitHub
git push

# Verás:
# To https://github.com/corpinfonet-creator/AgenteProconnect.git
#    abc1234..def5678  main -> main
```

### Paso 8: Verificar Deploy en Vercel

```bash
# 16. Ir a Vercel Dashboard
# https://vercel.com/dashboard

# 17. Click en "AgenteProconnect"

# 18. Click en "Deployments"

# 19. Ver el último deployment:
# - 🟡 Building... (esperar)
# - 🟢 Ready ✅ (listo!)

# 20. Abrir la URL de producción
# https://agente-proconnect.vercel.app/

# 21. Verificar que el botón es azul ✅
```

---

## ⚡ Atajos Rápidos

### Cambio Simple (Un solo archivo)

```bash
npm run dev                              # Iniciar
# ... editar archivo ...
git add .
git commit -m "Mensaje"
git push
```

### Cambio Múltiple (Varios archivos)

```bash
npm run dev                              # Iniciar
# ... editar varios archivos ...
npm run build                            # Verificar
git status                               # Ver cambios
git add .
git commit -m "Mensaje descriptivo"
git push
```

### Verificación Rápida

```bash
# Ver si el servidor está corriendo
curl http://localhost:3000/api/health

# Debe responder:
# {"status":"ok","timestamp":"...","database":"configurado"}
```

---

## 🎯 Checklist Antes de Subir

Antes de hacer `git push`, verifica:

- [ ] Los cambios funcionan en local (`http://localhost:3000/`)
- [ ] El build pasa sin errores (`npm run build`)
- [ ] Los tests pasan (si hay: `npm test`)
- [ ] El código está guardado (Ctrl+S)
- [ ] El mensaje de commit es descriptivo
- [ ] Solo subes los archivos necesarios (no node_modules, etc.)

---

## 📚 Comandos de Referencia Rápida

```bash
# DESARROLLO
npm run dev              # Servidor local
npm run build            # Build de producción
npm run preview          # Preview del build
npm run db:init          # Inicializar BD
npm run test:login       # Test de login

# GIT
git status               # Ver estado
git add .                # Agregar todo
git add archivo.ts       # Agregar específico
git commit -m "Msg"      # Hacer commit
git push                 # Subir a GitHub
git diff                 # Ver diferencias
git log --oneline -10    # Últimos 10 commits

# LIMPIAR
rm -rf .nitro .output    # Limpiar build
rm -rf node_modules      # Limpiar dependencias
npm install              # Reinstalar
```

---

## 🆘 Errores Comunes

### "Address already in use"
```bash
# Puerto 3000 ocupado
# Solución: Cambiar puerto o matar proceso
npx kill-port 3000
npm run dev
```

### "Cannot find module"
```bash
# Falta instalar dependencias
npm install
```

### "Build failed"
```bash
# Ver error completo
npm run build

# Limpiar y reintentar
rm -rf .nitro .output
npm run build
```

### Cambios no se ven en Vercel
```bash
# 1. Verificar que el push se completó
git log --oneline -1

# 2. Verificar deployment en Vercel Dashboard
# 3. Esperar 2-3 minutos
# 4. Limpiar caché del navegador (Ctrl+Shift+R)
```

---

## 🎓 Mejores Prácticas

1. **Siempre trabajar con `npm run dev`**
   - Ver cambios instantáneamente
   - Detectar errores rápido

2. **Probar antes de subir**
   - `npm run build` debe pasar
   - Funcionalidad debe funcionar

3. **Commits claros**
   - `Update:` para cambios generales
   - `Fix:` para correcciones
   - `Feat:` para nuevas funcionalidades
   - `Style:` para cambios visuales

4. **Subir frecuentemente**
   - No esperar días para hacer push
   - Commits pequeños son mejores

5. **Verificar en Vercel**
   - Siempre verificar que el deploy terminó
   - Probar en producción después de deploy

---

**¡Listo para empezar a trabajar como un profesional!** 🚀
