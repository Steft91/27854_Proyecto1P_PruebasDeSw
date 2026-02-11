# Frontend Angular - Configuración de despliegue en Vercel

## Archivos de entorno configurados:

✅ `src/environments/environment.development.ts` - Desarrollo (localhost)
✅ `src/environments/environment.ts` - Producción (Vercel)

## Servicios actualizados para usar variables de entorno:

✅ auth.service.ts
✅ cliente.service.ts
✅ producto.service.ts
✅ empleado.service.ts
✅ proveedor.service.ts

## IMPORTANTE - Antes de desplegar:

⚠️ Actualiza `src/environments/environment.ts` con la URL real de tu backend en Render:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://TU-BACKEND-EN-RENDER.onrender.com/api',
};
```

## Para desplegar en Vercel:

1. Conecta tu repositorio en Vercel
2. Selecciona la carpeta: `supermercado-frontend-angular`
3. Framework: Angular
4. Build Command: `npm run build`
5. Output Directory: `dist/supermercado-frontend-angular/browser`
6. Deploy!

Ver DEPLOYMENT.md en la raíz del proyecto para instrucciones detalladas.
