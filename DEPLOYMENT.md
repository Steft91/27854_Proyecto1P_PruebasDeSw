# Configuración de Variables de Entorno para Despliegue

Este documento explica cómo configurar las variables de entorno para desplegar el backend en Render y el frontend en Vercel.

## 📦 Backend - Render

### Variables de entorno requeridas en Render:

1. **MONGO_URI**: Connection string de MongoDB Atlas
   - Ejemplo: `mongodb+srv://usuario:password@cluster.mongodb.net/supermercado`
   - ⚠️ Asegúrate de crear un cluster en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

2. **JWT_SECRET**: Secreto para firmar tokens JWT
   - ⚠️ Usa un string largo y aleatorio
   - Genera uno con: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

3. **PORT**: Puerto del servidor
   - ⚠️ Render asignará automáticamente el puerto, pero puedes dejar 3000 como fallback
   - Valor: `3000`

### Pasos para configurar en Render:

1. Ve a tu servicio en Render
2. Click en "Environment" en el menú lateral
3. Agrega cada variable con su valor:
   ```
   MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/supermercado
   JWT_SECRET=tu_secreto_generado_aqui
   PORT=3000
   ```
4. Click en "Save Changes"

### Configuración adicional en Render:

- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Node Version**: 18.x o superior

---

## 🌐 Frontend Angular - Vercel

### Configuración del archivo environment.ts

El archivo `src/environments/environment.ts` ya está configurado con una URL de ejemplo.
**Debes actualizarlo con la URL real de tu backend en Render:**

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://TU-APP-BACKEND.onrender.com/api',
};
```

⚠️ **IMPORTANTE**: Reemplaza `TU-APP-BACKEND` con el nombre real de tu servicio en Render.

### Pasos para desplegar en Vercel:

1. Conecta tu repositorio de GitHub a Vercel
2. Selecciona la carpeta del proyecto: `supermercado-frontend-angular`
3. Framework Preset: **Angular**
4. Build Command: `npm run build`
5. Output Directory: `dist/supermercado-frontend-angular/browser`
6. Install Command: `npm install`

### Variables de entorno en Vercel (Opcional):

Si prefieres usar variables de entorno en lugar de hardcodear la URL, puedes configurarlo así:

**No es necesario en Angular** porque Angular compila las variables en tiempo de build. La configuración se hace directamente en el archivo `environment.ts`.

---

## 🔧 Desarrollo Local

### Backend:

```bash
cd supermercado-backend
npm install
# Asegúrate de tener MongoDB corriendo localmente
npm run dev
```

### Frontend Angular:

```bash
cd supermercado-frontend-angular
npm install
npm start
```

El frontend estará disponible en `http://localhost:4200`
El backend estará disponible en `http://localhost:3000`

---

## ✅ Checklist de Despliegue

### Antes de desplegar el Backend en Render:

- [ ] Crear cuenta en MongoDB Atlas
- [ ] Crear cluster y obtener connection string
- [ ] Configurar IP Whitelist en MongoDB Atlas (permitir todas: 0.0.0.0/0)
- [ ] Generar JWT_SECRET seguro
- [ ] Configurar variables de entorno en Render

### Antes de desplegar el Frontend en Vercel:

- [ ] Actualizar `src/environments/environment.ts` con la URL real del backend en Render
- [ ] Hacer commit y push de los cambios
- [ ] Verificar que el build local funcione: `npm run build`

### Después del despliegue:

- [ ] Probar el login desde el frontend desplegado
- [ ] Verificar que todas las operaciones CRUD funcionen
- [ ] Revisar los logs en Render y Vercel para errores

---

## 🐛 Troubleshooting

### Error de CORS:

Si obtienes errores de CORS, verifica que el backend tenga configurado `cors()` en `src/app.js` (ya está configurado).

### Error de conexión a MongoDB:

- Verifica que el MONGO_URI sea correcto
- Asegúrate de que MongoDB Atlas permita conexiones desde cualquier IP (0.0.0.0/0)
- Verifica que el usuario y contraseña de MongoDB sean correctos

### Frontend no se conecta al backend:

- Verifica que la URL en `environment.ts` sea correcta
- Asegúrate de incluir `/api` al final de la URL
- La URL debe ser HTTPS en producción (Render proporciona HTTPS automáticamente)

---

## 📞 Ayuda

Para más información sobre despliegue:

- [Documentación de Render](https://render.com/docs)
- [Documentación de Vercel](https://vercel.com/docs)
- [MongoDB Atlas](https://www.mongodb.com/docs/atlas/)
