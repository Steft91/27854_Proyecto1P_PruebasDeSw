#!/bin/bash

# Script para actualizar la URL del backend en el archivo de producción
# Uso: ./update-backend-url.sh https://tu-backend.onrender.com

if [ -z "$1" ]; then
    echo "❌ Error: Debes proporcionar la URL del backend"
    echo "Uso: ./update-backend-url.sh https://tu-backend.onrender.com"
    exit 1
fi

BACKEND_URL="$1"
ENV_FILE="src/environments/environment.ts"

# Eliminar /api del final si el usuario lo incluyó
BACKEND_URL="${BACKEND_URL%/api}"
BACKEND_URL="${BACKEND_URL%/}"

# Actualizar el archivo
cat > "$ENV_FILE" << EOF
// Configuración para producción (Vercel)
export const environment = {
    production: true,
    apiUrl: '$BACKEND_URL/api'
};
EOF

echo "✅ Archivo $ENV_FILE actualizado correctamente"
echo "📝 URL configurada: $BACKEND_URL/api"
echo ""
echo "Siguiente paso:"
echo "1. Verifica el archivo: cat $ENV_FILE"
echo "2. Haz commit: git add $ENV_FILE && git commit -m 'Update production backend URL'"
echo "3. Haz push: git push"
echo "4. Vercel detectará los cambios automáticamente"
