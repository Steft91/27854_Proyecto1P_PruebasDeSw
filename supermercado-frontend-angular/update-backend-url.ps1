# Script de PowerShell para actualizar la URL del backend en el archivo de producción
# Uso: .\update-backend-url.ps1 "https://tu-backend.onrender.com"

param(
    [Parameter(Mandatory=$true)]
    [string]$BackendUrl
)

$EnvFile = "src\environments\environment.ts"

# Eliminar /api del final si el usuario lo incluyó
$BackendUrl = $BackendUrl -replace '/api$', ''
$BackendUrl = $BackendUrl -replace '/$', ''

# Contenido del archivo
$Content = @"
// Configuración para producción (Vercel)
export const environment = {
    production: true,
    apiUrl: '$BackendUrl/api'
};
"@

# Escribir el archivo
Set-Content -Path $EnvFile -Value $Content -Encoding UTF8

Write-Host "✅ Archivo $EnvFile actualizado correctamente" -ForegroundColor Green
Write-Host "📝 URL configurada: $BackendUrl/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "Siguiente paso:" -ForegroundColor Yellow
Write-Host "1. Verifica el archivo: Get-Content $EnvFile"
Write-Host "2. Haz commit: git add $EnvFile; git commit -m 'Update production backend URL'"
Write-Host "3. Haz push: git push"
Write-Host "4. Vercel detectará los cambios automáticamente"
