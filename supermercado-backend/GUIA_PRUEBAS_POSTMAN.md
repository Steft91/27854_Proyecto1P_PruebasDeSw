# 🧪 Guía Completa de Pruebas en Postman

## 📋 Pre-requisitos

1. Asegúrate de que MongoDB esté corriendo
2. Inicia el servidor backend: `npm start` o `node server.js`
3. El servidor debe estar corriendo en `http://localhost:3000`

---

## 🔐 PASO 1: Registro de Usuarios

### 1.1 Registrar Administrador

```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "username": "admin1",
  "password": "admin123",
  "email": "admin@supermercado.com",
  "rol": "administrador"
}
```

**Respuesta esperada:**

```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "_id": "...",
    "username": "admin1",
    "email": "admin@supermercado.com",
    "rol": "administrador"
  }
}
```

### 1.2 Registrar Empleado

```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "username": "empleado1",
  "password": "emp123",
  "email": "empleado@supermercado.com",
  "rol": "empleado"
}
```

### 1.3 Registrar Cliente

```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "username": "cliente1",
  "password": "cli123",
  "email": "cliente@gmail.com",
  "rol": "cliente"
}
```

---

## 🔑 PASO 2: Login de Usuarios

### 2.1 Login como Administrador

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "admin1",
  "password": "admin123"
}
```

**Respuesta esperada:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "username": "admin1",
    "email": "admin@supermercado.com",
    "rol": "administrador"
  }
}
```

**⚠️ IMPORTANTE: Guarda este token, lo usarás en las siguientes peticiones como:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2.2 Login como Empleado

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "empleado1",
  "password": "emp123"
}
```

**Guarda este token también para probar con rol de empleado**

### 2.3 Login como Cliente

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "cliente1",
  "password": "cli123"
}
```

**Guarda este token también para probar con rol de cliente**

---

## 🏢 PASO 3: Crear Proveedores (Solo Administrador)

### 3.1 Crear Proveedor 1

```http
POST http://localhost:3000/api/providers
Authorization: Bearer [TOKEN_ADMINISTRADOR]
Content-Type: application/json

{
  "nombreFiscal": "Distribuidora TechSupply S.A.",
  "rucNitNif": "1234567890123",
  "direccionFisica": "Av. Principal 123",
  "telefonoPrincipal": "0987654321",
  "correoElectronico": "ventas@techsupply.com"
}
```

**Respuesta esperada:**

```json
{
  "message": "Proveedor creado con éxito",
  "proveedor": {
    "_id": "675d8e2a1234567890abcdef",
    "nombreFiscal": "Distribuidora TechSupply S.A.",
    "rucNitNif": "1234567890123",
    ...
  }
}
```

**⚠️ GUARDA EL \_id DEL PROVEEDOR** (ej: `675d8e2a1234567890abcdef`)

### 3.2 Crear Proveedor 2

```http
POST http://localhost:3000/api/providers
Authorization: Bearer [TOKEN_ADMINISTRADOR]
Content-Type: application/json

{
  "nombreFiscal": "Importadora GlobalTech Ltda.",
  "rucNitNif": "9876543210987",
  "direccionFisica": "Calle Comercio 456",
  "telefonoPrincipal": "0991234567",
  "correoElectronico": "info@globaltech.com"
}
```

### 3.3 ❌ Intentar crear proveedor como Empleado (DEBE FALLAR)

```http
POST http://localhost:3000/api/providers
Authorization: Bearer [TOKEN_EMPLEADO]
Content-Type: application/json

{
  "nombreFiscal": "Proveedor Test",
  "rucNitNif": "1111111111111",
  "direccionFisica": "Test",
  "telefonoPrincipal": "0999999999"
}
```

**Respuesta esperada:**

```json
{
  "message": "Acceso denegado: no tienes los permisos necesarios"
}
```

---

## 📦 PASO 4: Crear Productos

### 4.1 Crear Producto SIN Proveedor (como Administrador)

```http
POST http://localhost:3000/api/products
Authorization: Bearer [TOKEN_ADMINISTRADOR]
Content-Type: application/json

{
  "codeProduct": "PROD001",
  "nameProduct": "Mouse Logitech MX Master",
  "descriptionProduct": "Mouse inalámbrico de alta precisión",
  "priceProduct": 89.99,
  "stockProduct": 25
}
```

### 4.2 Crear Producto CON Proveedor (como Administrador)

```http
POST http://localhost:3000/api/products
Authorization: Bearer [TOKEN_ADMINISTRADOR]
Content-Type: application/json

{
  "codeProduct": "PROD002",
  "nameProduct": "Laptop HP Pavilion",
  "descriptionProduct": "Laptop de alto rendimiento, 16GB RAM, 512GB SSD",
  "priceProduct": 850.00,
  "stockProduct": 10,
  "proveedor": "675d8e2a1234567890abcdef"
}
```

**⚠️ Reemplaza `675d8e2a1234567890abcdef` con el ID real del proveedor que guardaste**

### 4.3 Crear Producto como Empleado (DEBE FUNCIONAR)

```http
POST http://localhost:3000/api/products
Authorization: Bearer [TOKEN_EMPLEADO]
Content-Type: application/json

{
  "codeProduct": "PROD003",
  "nameProduct": "Teclado Mecánico RGB",
  "descriptionProduct": "Teclado mecánico con iluminación RGB",
  "priceProduct": 125.50,
  "stockProduct": 15
}
```

### 4.4 ❌ Crear Producto como Cliente (DEBE FALLAR)

```http
POST http://localhost:3000/api/products
Authorization: Bearer [TOKEN_CLIENTE]
Content-Type: application/json

{
  "codeProduct": "PROD999",
  "nameProduct": "Producto Test",
  "descriptionProduct": "No debería crearse",
  "priceProduct": 10,
  "stockProduct": 5
}
```

**Respuesta esperada:**

```json
{
  "message": "Acceso denegado: no tienes los permisos necesarios"
}
```

### 4.5 ❌ Probar Validación: Precio negativo (DEBE FALLAR)

```http
POST http://localhost:3000/api/products
Authorization: Bearer [TOKEN_ADMINISTRADOR]
Content-Type: application/json

{
  "codeProduct": "PROD010",
  "nameProduct": "Producto Inválido",
  "descriptionProduct": "Tiene precio negativo",
  "priceProduct": -50,
  "stockProduct": 10
}
```

**Respuesta esperada:**

```json
{
  "message": "El precio del producto debe ser mayor a 0"
}
```

### 4.6 ❌ Probar Validación: Proveedor inexistente (DEBE FALLAR)

```http
POST http://localhost:3000/api/products
Authorization: Bearer [TOKEN_ADMINISTRADOR]
Content-Type: application/json

{
  "codeProduct": "PROD011",
  "nameProduct": "Producto con Proveedor Falso",
  "descriptionProduct": "Referencia a proveedor que no existe",
  "priceProduct": 100,
  "stockProduct": 5,
  "proveedor": "000000000000000000000000"
}
```

**Respuesta esperada:**

```json
{
  "message": "El proveedor especificado no existe"
}
```

---

## 📋 PASO 5: Ver Productos

### 5.1 Ver Todos los Productos (Sin autenticación - Público)

```http
GET http://localhost:3000/api/products
```

**Respuesta esperada:** Lista de productos con información del proveedor poblada

```json
{
  "message": "Lista de productos",
  "products": [
    {
      "_id": "...",
      "codeProduct": "PROD002",
      "nameProduct": "Laptop HP Pavilion",
      "proveedor": {
        "_id": "675d8e2a1234567890abcdef",
        "nombreFiscal": "Distribuidora TechSupply S.A.",
        "rucNitNif": "1234567890123"
      },
      ...
    }
  ]
}
```

### 5.2 Ver Producto por Código

```http
GET http://localhost:3000/api/products/PROD002
```

---

## 👥 PASO 6: Crear Clientes

### 6.1 Crear Cliente como Administrador

```http
POST http://localhost:3000/api/clients
Authorization: Bearer [TOKEN_ADMINISTRADOR]
Content-Type: application/json

{
  "dniClient": "1234567890",
  "nameClient": "Juan",
  "surnameClient": "Pérez García",
  "emailClient": "juan.perez@gmail.com",
  "phoneClient": "0987654321",
  "addressClient": "Av. Amazonas 123"
}
```

### 6.2 Crear Cliente como Empleado (DEBE FUNCIONAR)

```http
POST http://localhost:3000/api/clients
Authorization: Bearer [TOKEN_EMPLEADO]
Content-Type: application/json

{
  "dniClient": "0987654321",
  "nameClient": "María",
  "surnameClient": "González López",
  "emailClient": "maria.gonzalez@gmail.com",
  "phoneClient": "0991234567",
  "addressClient": "Calle Bolívar 456"
}
```

### 6.3 ❌ Crear Cliente como Cliente (DEBE FALLAR)

```http
POST http://localhost:3000/api/clients
Authorization: Bearer [TOKEN_CLIENTE]
Content-Type: application/json

{
  "dniClient": "1111111111",
  "nameClient": "Test",
  "surnameClient": "Cliente",
  "emailClient": "test@test.com",
  "phoneClient": "0999999999",
  "addressClient": "Test"
}
```

---

## 👔 PASO 7: Crear Empleados (Solo Administrador)

### 7.1 Crear Empleado como Administrador

```http
POST http://localhost:3000/api/empleados
Authorization: Bearer [TOKEN_ADMINISTRADOR]
Content-Type: application/json

{
  "cedulaEmpleado": "1750123456",
  "nombreEmpleado": "Carlos Ramírez Sánchez",
  "emailEmpleado": "carlos.ramirez@supermercado.com",
  "celularEmpleado": "0987654321",
  "sueldoEmpleado": 500.00
}
```

### 7.2 ❌ Crear Empleado como Empleado (DEBE FALLAR)

```http
POST http://localhost:3000/api/empleados
Authorization: Bearer [TOKEN_EMPLEADO]
Content-Type: application/json

{
  "cedulaEmpleado": "1750999999",
  "nombreEmpleado": "Test Empleado",
  "emailEmpleado": "test.empleado@supermercado.com",
  "celularEmpleado": "0999999999",
  "sueldoEmpleado": 450.00
}
```

**Respuesta esperada:**

```json
{
  "message": "Acceso denegado: no tienes los permisos necesarios"
}
```

---

## ✏️ PASO 8: Actualizar Productos

### 8.1 Actualizar Producto como Administrador

```http
PUT http://localhost:3000/api/products/PROD001
Authorization: Bearer [TOKEN_ADMINISTRADOR]
Content-Type: application/json

{
  "newPriceProduct": 79.99,
  "newStockProduct": 30
}
```

### 8.2 Actualizar Proveedor de un Producto

```http
PUT http://localhost:3000/api/products/PROD001
Authorization: Bearer [TOKEN_ADMINISTRADOR]
Content-Type: application/json

{
  "newProveedor": "675d8e2a1234567890abcdef"
}
```

### 8.3 Actualizar Producto como Empleado (DEBE FUNCIONAR)

```http
PUT http://localhost:3000/api/products/PROD003
Authorization: Bearer [TOKEN_EMPLEADO]
Content-Type: application/json

{
  "newPriceProduct": 115.00
}
```

### 8.4 ❌ Actualizar Producto como Cliente (DEBE FALLAR)

```http
PUT http://localhost:3000/api/products/PROD001
Authorization: Bearer [TOKEN_CLIENTE]
Content-Type: application/json

{
  "newPriceProduct": 50.00
}
```

---

## 🗑️ PASO 9: Eliminar Recursos

### 9.1 Eliminar Producto como Administrador

```http
DELETE http://localhost:3000/api/products/PROD001
Authorization: Bearer [TOKEN_ADMINISTRADOR]
```

### 9.2 Eliminar Producto como Empleado (DEBE FUNCIONAR)

```http
DELETE http://localhost:3000/api/products/PROD003
Authorization: Bearer [TOKEN_EMPLEADO]
```

### 9.3 ❌ Eliminar Proveedor como Empleado (DEBE FALLAR)

```http
DELETE http://localhost:3000/api/providers/675d8e2a1234567890abcdef
Authorization: Bearer [TOKEN_EMPLEADO]
```

---

## 📊 PASO 10: Verificar Listados

### 10.1 Ver Todos los Empleados (como Administrador)

```http
GET http://localhost:3000/api/empleados
Authorization: Bearer [TOKEN_ADMINISTRADOR]
```

### 10.2 Ver Todos los Clientes (como Administrador)

```http
GET http://localhost:3000/api/clients
Authorization: Bearer [TOKEN_ADMINISTRADOR]
```

### 10.3 Ver Todos los Proveedores (como Administrador)

```http
GET http://localhost:3000/api/providers
Authorization: Bearer [TOKEN_ADMINISTRADOR]
```

### 10.4 ❌ Ver Empleados como Cliente (DEBE FALLAR)

```http
GET http://localhost:3000/api/empleados
Authorization: Bearer [TOKEN_CLIENTE]
```

---

## 📝 Checklist de Validación

Marca cada punto a medida que lo pruebes:

### ✅ Autenticación

- [ ] Registro de administrador funciona
- [ ] Registro de empleado funciona
- [ ] Registro de cliente funciona
- [ ] Login retorna token JWT válido
- [ ] Token incluye información del rol

### ✅ Proveedores (Solo Admin)

- [ ] Admin puede crear proveedores
- [ ] Admin puede ver proveedores
- [ ] Admin puede actualizar proveedores
- [ ] Admin puede eliminar proveedores
- [ ] Empleado NO puede crear proveedores
- [ ] Cliente NO puede acceder a proveedores

### ✅ Productos

- [ ] Todos pueden ver productos (sin auth)
- [ ] Admin puede crear productos
- [ ] Empleado puede crear productos
- [ ] Cliente NO puede crear productos
- [ ] Validación de precio > 0 funciona
- [ ] Validación de stock >= 0 funciona
- [ ] Validación de proveedor existente funciona
- [ ] Relación con proveedor se puebla correctamente
- [ ] Admin y empleado pueden actualizar productos
- [ ] Cliente NO puede actualizar productos
- [ ] Admin y empleado pueden eliminar productos

### ✅ Empleados (Solo Admin)

- [ ] Admin puede crear empleados
- [ ] Admin puede ver empleados
- [ ] Empleado NO puede gestionar empleados
- [ ] Cliente NO puede acceder a empleados

### ✅ Clientes (Admin y Empleado)

- [ ] Admin puede gestionar clientes
- [ ] Empleado puede gestionar clientes
- [ ] Cliente NO puede gestionar clientes

---

## 🎯 Casos de Prueba Adicionales

### Validación de Duplicados

```http
POST http://localhost:3000/api/products
Authorization: Bearer [TOKEN_ADMINISTRADOR]
Content-Type: application/json

{
  "codeProduct": "PROD002",
  "nameProduct": "Producto Duplicado",
  "descriptionProduct": "Este código ya existe",
  "priceProduct": 100,
  "stockProduct": 10
}
```

**Debe retornar error de código duplicado**

### Validación de Email Inválido

```http
POST http://localhost:3000/api/clients
Authorization: Bearer [TOKEN_ADMINISTRADOR]
Content-Type: application/json

{
  "dniClient": "9999999999",
  "nameClient": "Test",
  "surnameClient": "Email",
  "emailClient": "email-invalido",
  "phoneClient": "0999999999",
  "addressClient": "Test"
}
```

**Debe retornar error de formato de email**

---

## 💡 Tips para Postman

1. **Crear Variables de Entorno:**

   - `baseUrl`: `http://localhost:3000/api`
   - `adminToken`: Token del administrador
   - `empleadoToken`: Token del empleado
   - `clienteToken`: Token del cliente
   - `proveedorId`: ID del proveedor creado

2. **Usar Collections:** Organiza las peticiones en carpetas:

   - 📁 Auth (Registro y Login)
   - 📁 Proveedores
   - 📁 Productos
   - 📁 Empleados
   - 📁 Clientes

3. **Scripts de Postman:**
   Agrega este script en el tab "Tests" del login para guardar automáticamente el token:

   ```javascript
   if (pm.response.code === 200) {
     const response = pm.response.json();
     pm.environment.set('authToken', response.token);
   }
   ```

4. **Headers Comunes:**
   Crea un preset con:
   ```
   Content-Type: application/json
   Authorization: Bearer {{authToken}}
   ```

---

## ✨ Resultado Esperado

Si todas las pruebas pasan correctamente, habrás validado:

- ✅ Sistema de autenticación funcional
- ✅ Roles y permisos correctamente implementados
- ✅ Relaciones entre entidades (Producto-Proveedor)
- ✅ Validaciones de datos
- ✅ Control de acceso por endpoint
- ✅ Operaciones CRUD en todos los recursos
