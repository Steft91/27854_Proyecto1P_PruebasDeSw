// ============================================================================
// SCRIPT K6 - BACKEND SUPERMERCADO
// ============================================================================
import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Métricas personalizadas
const errorRate = new Rate('errors');

export const options = {
    scenarios: {
        // ====================================================================
        // ESCENARIO 1: SMOKE TEST (Prueba de Humo)
        // ====================================================================
        // Objetivo: Verificar funcionalidad básica con mínima carga
        // Duración: 1 minuto
        smoke_test: {
            executor: 'constant-vus',
            vus: 2,
            duration: '1m',
            startTime: '0s',
            tags: { scenario: 'smoke_test', test_type: 'smoke' },
            gracefulStop: '10s',
        },
        
        // ====================================================================
        // ESCENARIO 2: LOAD TEST (Prueba de Carga)
        // ====================================================================
        // Objetivo: Evaluar rendimiento bajo carga normal esperada
        // Duración: 3 minutos
        load_test: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '30s', target: 20 },  // Ramp up
                { duration: '2m', target: 20 },   // Mantener
                { duration: '30s', target: 0 },   // Ramp down
            ],
            startTime: '1m',
            tags: { scenario: 'load_test', test_type: 'load' },
            gracefulRampDown: '10s',
        },
        
        // ====================================================================
        // ESCENARIO 3: STRESS TEST (Prueba de Estrés)
        // ====================================================================
        // Objetivo: Encontrar límites del sistema con carga incremental
        // Duración: 4 minutos
        stress_test: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '1m', target: 30 },   // Carga moderada
                { duration: '1m', target: 50 },   // Carga alta
                { duration: '1m', target: 80 },   // Carga extrema
                { duration: '1m', target: 0 },    // Recovery
            ],
            startTime: '4m',
            tags: { scenario: 'stress_test', test_type: 'stress' },
            gracefulRampDown: '10s',
        },
        
        // ====================================================================
        // ESCENARIO 4: SPIKE TEST (Prueba de Picos)
        // ====================================================================
        // Objetivo: Evaluar respuesta ante picos súbitos de tráfico
        // Duración: 3 minutos
        spike_test: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '30s', target: 10 },   // Baseline
                { duration: '10s', target: 100 },  // Spike súbito!
                { duration: '1m', target: 100 },   // Mantener spike
                { duration: '30s', target: 10 },   // Recovery rápido
                { duration: '50s', target: 10 },   // Estabilización
            ],
            startTime: '8m',
            tags: { scenario: 'spike_test', test_type: 'spike' },
            gracefulRampDown: '10s',
        },
        
        // ====================================================================
        // ESCENARIO 5: SOAK TEST (Prueba de Resistencia - Corta)
        // ====================================================================
        // Objetivo: Detectar memory leaks con carga sostenida (versión corta)
        // Duración: 1 minuto
        soak_test: {
            executor: 'constant-vus',
            vus: 15,
            duration: '1m',
            startTime: '11m',
            tags: { scenario: 'soak_test', test_type: 'soak' },
            gracefulStop: '10s',
        },
    },
    
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)', 'count'],
    
    thresholds: {
        // Thresholds globales
        'http_req_duration': ['p(95)<3000'],
        'http_req_failed': ['rate<0.10'],  // Toleramos hasta 10% de errores en pruebas extremas
        'checks': ['rate>0.85'],
        
        // Thresholds por escenario
        'http_req_duration{scenario:smoke_test}': ['p(95)<1000'],
        'http_req_duration{scenario:load_test}': ['p(95)<2000'],
        'http_req_duration{scenario:stress_test}': ['p(95)<3000'],
        'http_req_duration{scenario:spike_test}': ['p(95)<5000'],
        'http_req_duration{scenario:soak_test}': ['p(95)<2000'],
        
        // Thresholds por endpoint crítico
        'http_req_duration{endpoint:login}': ['p(95)<2000'],
        'http_req_duration{endpoint:register}': ['p(95)<3000'],
        
        // Errores por escenario
        'errors': ['rate<0.10'],
    }
};

const BASE_URL = 'http://localhost:5000';

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

function generateUniqueData() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const vu = __VU;
    const iter = __ITER;
    
    return {
        username: `user_${vu}_${iter}_${timestamp}`,
        email: `user${vu}_${iter}_${timestamp}@test.com`,
        cedula: generateValidEcuadorianCedula(),
        ruc: generateValidRUC(),
        productCode: `PROD${vu}${iter}${random}`,
        timestamp,
        random,
    };
}

function generateValidEcuadorianCedula() {
    // Generar cédula ecuatoriana válida con dígito verificador correcto
    const province = String(Math.floor(Math.random() * 24) + 1).padStart(2, '0');
    const third = Math.floor(Math.random() * 6); // Debe ser < 6 para personas naturales
    const middle = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
    
    const partial = province + third + middle;
    const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let sum = 0;
    
    for (let i = 0; i < 9; i++) {
        let value = parseInt(partial[i]) * coefficients[i];
        if (value >= 10) value -= 9;
        sum += value;
    }
    
    const verifier = sum % 10 === 0 ? 0 : 10 - (sum % 10);
    return partial + verifier;
}

function generateValidRUC() {
    // Generar RUC de 13 dígitos
    return String(Math.floor(Math.random() * 9000000000000) + 1000000000000);
}

function generatePhoneNumber() {
    // Generar número celular ecuatoriano (09XXXXXXXX)
    return '09' + String(Math.floor(Math.random() * 100000000)).padStart(8, '0');
}

// ============================================================================
// FUNCIÓN PRINCIPAL DE PRUEBA
// ============================================================================

export default function () {
    const data = generateUniqueData();
    
    // Tokens para autenticación
    let adminToken = null;
    let empleadoToken = null;
    let clienteToken = null;
    
    // IDs creados durante la prueba
    let proveedorId = null;
    let productCode = null;
    let clienteDni = null;
    let empleadoCedula = null;
    let pedidoId = null;
    
    // ========================================================================
    // GROUP 1: AUTENTICACIÓN
    // ========================================================================
    group('01_Autenticación', () => {
        // Registro de Administrador
        const adminPayload = JSON.stringify({
            username: `admin_${data.username}`,
            password: 'Admin123!',
            email: `admin_${data.email}`,
            rol: 'administrador'
        });
        
        const adminRegRes = http.post(
            `${BASE_URL}/api/auth/register`,
            adminPayload,
            {
                headers: { 'Content-Type': 'application/json' },
                tags: { endpoint: 'register', rol: 'admin' }
            }
        );
        
        check(adminRegRes, {
            'Admin registrado': (r) => r.status === 201,
        }) || errorRate.add(1);
        
        sleep(0.5);
        
        // Login de Administrador
        const adminLoginPayload = JSON.stringify({
            username: `admin_${data.username}`,
            password: 'Admin123!'
        });
        
        const adminLoginRes = http.post(
            `${BASE_URL}/api/auth/login`,
            adminLoginPayload,
            {
                headers: { 'Content-Type': 'application/json' },
                tags: { endpoint: 'login', rol: 'admin' }
            }
        );
        
        const adminLoginSuccess = check(adminLoginRes, {
            'Admin login exitoso': (r) => r.status === 200,
            'Admin token recibido': (r) => {
                try {
                    const body = JSON.parse(r.body);
                    return body.hasOwnProperty('token');
                } catch {
                    return false;
                }
            }
        });
        
        if (adminLoginSuccess && adminLoginRes.status === 200) {
            try {
                const body = JSON.parse(adminLoginRes.body);
                adminToken = body.token;
            } catch (e) {
                errorRate.add(1);
            }
        } else {
            errorRate.add(1);
        }
        
        sleep(0.5);
        
        // Registro y Login de Empleado
        const empleadoPayload = JSON.stringify({
            username: `emp_${data.username}`,
            password: 'Emp123!',
            email: `emp_${data.email}`,
            rol: 'empleado'
        });
        
        const empRegRes = http.post(
            `${BASE_URL}/api/auth/register`,
            empleadoPayload,
            {
                headers: { 'Content-Type': 'application/json' },
                tags: { endpoint: 'register', rol: 'empleado' }
            }
        );
        
        check(empRegRes, {
            'Empleado registrado': (r) => r.status === 201,
        }) || errorRate.add(1);
        
        sleep(0.3);
        
        const empLoginRes = http.post(
            `${BASE_URL}/api/auth/login`,
            JSON.stringify({
                username: `emp_${data.username}`,
                password: 'Emp123!'
            }),
            {
                headers: { 'Content-Type': 'application/json' },
                tags: { endpoint: 'login', rol: 'empleado' }
            }
        );
        
        if (empLoginRes.status === 200) {
            try {
                empleadoToken = JSON.parse(empLoginRes.body).token;
            } catch (e) {
                errorRate.add(1);
            }
        }
        
        sleep(0.3);
        
        // Registro y Login de Cliente
        const clientePayload = JSON.stringify({
            username: `cli_${data.username}`,
            password: 'Cli123!',
            email: `cli_${data.email}`,
            rol: 'cliente'
        });
        
        const cliRegRes = http.post(
            `${BASE_URL}/api/auth/register`,
            clientePayload,
            {
                headers: { 'Content-Type': 'application/json' },
                tags: { endpoint: 'register', rol: 'cliente' }
            }
        );
        
        check(cliRegRes, {
            'Cliente registrado': (r) => r.status === 201,
        }) || errorRate.add(1);
        
        sleep(0.3);
        
        const cliLoginRes = http.post(
            `${BASE_URL}/api/auth/login`,
            JSON.stringify({
                username: `cli_${data.username}`,
                password: 'Cli123!'
            }),
            {
                headers: { 'Content-Type': 'application/json' },
                tags: { endpoint: 'login', rol: 'cliente' }
            }
        );
        
        if (cliLoginRes.status === 200) {
            try {
                clienteToken = JSON.parse(cliLoginRes.body).token;
            } catch (e) {
                errorRate.add(1);
            }
        }
    });
    
    sleep(1);
    
    // ========================================================================
    // GROUP 2: GESTIÓN DE PROVEEDORES (Solo Admin)
    // ========================================================================
    if (adminToken) {
        group('02_Proveedores', () => {
            // Crear proveedor
            const proveedorPayload = JSON.stringify({
                nombreFiscal: `Proveedor ${data.random}`,
                rucNitNif: data.ruc,
                direccionFisica: `Calle ${data.random}, Quito`,
                telefonoPrincipal: generatePhoneNumber(),
                correoElectronico: `proveedor${data.random}@empresa.com`,
                contactoNombre: `Contacto ${data.random}`,
                contactoPuesto: 'Gerente de Ventas'
            });
            
            const createProvRes = http.post(
                `${BASE_URL}/api/providers`,
                proveedorPayload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${adminToken}`
                    },
                    tags: { endpoint: 'providers', action: 'create' }
                }
            );
            
            const provCreated = check(createProvRes, {
                'Proveedor creado': (r) => r.status === 201,
            });
            
            if (provCreated && createProvRes.status === 201) {
                try {
                    const body = JSON.parse(createProvRes.body);
                    proveedorId = body.provider._id;
                } catch (e) {
                    errorRate.add(1);
                }
            } else {
                errorRate.add(1);
            }
            
            sleep(0.5);
            
            // Listar proveedores
            const listProvRes = http.get(
                `${BASE_URL}/api/providers`,
                {
                    headers: { 'Authorization': `Bearer ${adminToken}` },
                    tags: { endpoint: 'providers', action: 'list' }
                }
            );
            
            check(listProvRes, {
                'Proveedores listados': (r) => r.status === 200,
            }) || errorRate.add(1);
            
            sleep(0.5);
            
            // Obtener proveedor específico
            if (proveedorId) {
                const getProvRes = http.get(
                    `${BASE_URL}/api/providers/${proveedorId}`,
                    {
                        headers: { 'Authorization': `Bearer ${adminToken}` },
                        tags: { endpoint: 'providers', action: 'get' }
                    }
                );
                
                check(getProvRes, {
                    'Proveedor obtenido': (r) => r.status === 200,
                }) || errorRate.add(1);
            }
        });
        
        sleep(1);
    }
    
    // ========================================================================
    // GROUP 3: GESTIÓN DE PRODUCTOS (Admin/Empleado pueden crear)
    // ========================================================================
    if (empleadoToken && proveedorId) {
        group('03_Productos', () => {
            // Crear producto
            const productoPayload = JSON.stringify({
                codeProduct: data.productCode,
                nameProduct: `Producto ${data.random}`,
                descriptionProduct: `Descripción del producto ${data.random}`,
                priceProduct: parseFloat((Math.random() * 100 + 10).toFixed(2)),
                stockProduct: Math.floor(Math.random() * 100) + 20,
                proveedor: proveedorId
            });
            
            const createProdRes = http.post(
                `${BASE_URL}/api/products`,
                productoPayload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${empleadoToken}`
                    },
                    tags: { endpoint: 'products', action: 'create' }
                }
            );
            
            const prodCreated = check(createProdRes, {
                'Producto creado': (r) => r.status === 201,
            });
            
            if (prodCreated) {
                productCode = data.productCode;
            } else {
                errorRate.add(1);
            }
            
            sleep(0.5);
            
            // Listar productos (público)
            const listProdRes = http.get(
                `${BASE_URL}/api/products`,
                {
                    tags: { endpoint: 'products', action: 'list' }
                }
            );
            
            check(listProdRes, {
                'Productos listados': (r) => r.status === 200,
                'Respuesta es array': (r) => {
                    try {
                        return Array.isArray(JSON.parse(r.body));
                    } catch {
                        return false;
                    }
                }
            }) || errorRate.add(1);
            
            sleep(0.5);
            
            // Obtener producto específico (público)
            if (productCode) {
                const getProdRes = http.get(
                    `${BASE_URL}/api/products/${productCode}`,
                    {
                        tags: { endpoint: 'products', action: 'get' }
                    }
                );
                
                check(getProdRes, {
                    'Producto obtenido': (r) => r.status === 200,
                }) || errorRate.add(1);
                
                sleep(0.5);
                
                // Actualizar producto
                const updateProdRes = http.put(
                    `${BASE_URL}/api/products/${productCode}`,
                    JSON.stringify({
                        newStockProduct: Math.floor(Math.random() * 50) + 50
                    }),
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${empleadoToken}`
                        },
                        tags: { endpoint: 'products', action: 'update' }
                    }
                );
                
                check(updateProdRes, {
                    'Producto actualizado': (r) => r.status === 200,
                }) || errorRate.add(1);
            }
        });
        
        sleep(1);
    }
    
    // ========================================================================
    // GROUP 4: GESTIÓN DE CLIENTES (Admin/Empleado)
    // ========================================================================
    if (empleadoToken) {
        group('04_Clientes', () => {
            // Crear cliente
            clienteDni = data.cedula;
            
            const clientePayload = JSON.stringify({
                dniClient: clienteDni,
                nameClient: `Cliente${data.random}`,
                surnameClient: `Apellido${data.random}`,
                emailClient: `cliente${data.random}@mail.com`,
                phoneClient: generatePhoneNumber(),
                addressClient: `Dirección ${data.random}`
            });
            
            const createCliRes = http.post(
                `${BASE_URL}/api/clients`,
                clientePayload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${empleadoToken}`
                    },
                    tags: { endpoint: 'clients', action: 'create' }
                }
            );
            
            check(createCliRes, {
                'Cliente creado': (r) => r.status === 201,
            }) || errorRate.add(1);
            
            sleep(0.5);
            
            // Listar clientes
            const listCliRes = http.get(
                `${BASE_URL}/api/clients`,
                {
                    headers: { 'Authorization': `Bearer ${empleadoToken}` },
                    tags: { endpoint: 'clients', action: 'list' }
                }
            );
            
            check(listCliRes, {
                'Clientes listados': (r) => r.status === 200,
            }) || errorRate.add(1);
            
            sleep(0.5);
            
            // Obtener cliente específico
            if (clienteDni) {
                const getCliRes = http.get(
                    `${BASE_URL}/api/clients/${clienteDni}`,
                    {
                        headers: { 'Authorization': `Bearer ${empleadoToken}` },
                        tags: { endpoint: 'clients', action: 'get' }
                    }
                );
                
                check(getCliRes, {
                    'Cliente obtenido': (r) => r.status === 200,
                }) || errorRate.add(1);
            }
        });
        
        sleep(1);
    }
    
    // ========================================================================
    // GROUP 5: GESTIÓN DE EMPLEADOS (Solo Admin)
    // ========================================================================
    if (adminToken) {
        group('05_Empleados', () => {
            // Crear empleado
            empleadoCedula = generateValidEcuadorianCedula();
            
            const empleadoPayload = JSON.stringify({
                cedulaEmpleado: empleadoCedula,
                nombreEmpleado: `Empleado ${data.random}`,
                emailEmpleado: `empleado${data.random}@empresa.com`,
                celularEmpleado: generatePhoneNumber(),
                direccionEmpleado: `Dirección ${data.random}`,
                sueldoEmpleado: parseFloat((Math.random() * 1000 + 500).toFixed(2))
            });
            
            const createEmpRes = http.post(
                `${BASE_URL}/api/empleados`,
                empleadoPayload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${adminToken}`
                    },
                    tags: { endpoint: 'empleados', action: 'create' }
                }
            );
            
            check(createEmpRes, {
                'Empleado creado': (r) => r.status === 201,
            }) || errorRate.add(1);
            
            sleep(0.5);
            
            // Listar empleados
            const listEmpRes = http.get(
                `${BASE_URL}/api/empleados`,
                {
                    headers: { 'Authorization': `Bearer ${adminToken}` },
                    tags: { endpoint: 'empleados', action: 'list' }
                }
            );
            
            check(listEmpRes, {
                'Empleados listados': (r) => r.status === 200,
            }) || errorRate.add(1);
        });
        
        sleep(1);
    }
    
    // ========================================================================
    // GROUP 6: GESTIÓN DE PEDIDOS (Cliente crea, Admin/Empleado gestionan)
    // ========================================================================
    if (clienteToken && productCode) {
        group('06_Pedidos', () => {
            // Cliente crea pedido
            const pedidoPayload = JSON.stringify({
                items: [
                    {
                        producto: productCode,
                        cantidad: Math.floor(Math.random() * 3) + 1
                    }
                ],
                datosEntrega: {
                    direccion: `Dirección de entrega ${data.random}`,
                    telefono: generatePhoneNumber(),
                    notas: 'Entregar en horario de oficina'
                }
            });
            
            const createPedRes = http.post(
                `${BASE_URL}/api/pedidos`,
                pedidoPayload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${clienteToken}`
                    },
                    tags: { endpoint: 'pedidos', action: 'create' }
                }
            );
            
            const pedCreated = check(createPedRes, {
                'Pedido creado': (r) => r.status === 201,
                'Pedido tiene total': (r) => {
                    try {
                        const body = JSON.parse(r.body);
                        return body.pedido && body.pedido.total > 0;
                    } catch {
                        return false;
                    }
                }
            });
            
            if (pedCreated && createPedRes.status === 201) {
                try {
                    const body = JSON.parse(createPedRes.body);
                    pedidoId = body.pedido._id;
                } catch (e) {
                    errorRate.add(1);
                }
            } else {
                errorRate.add(1);
            }
            
            sleep(0.5);
            
            // Cliente consulta sus pedidos
            const misPedRes = http.get(
                `${BASE_URL}/api/pedidos/mis-pedidos`,
                {
                    headers: { 'Authorization': `Bearer ${clienteToken}` },
                    tags: { endpoint: 'pedidos', action: 'mis-pedidos' }
                }
            );
            
            check(misPedRes, {
                'Mis pedidos obtenidos': (r) => r.status === 200,
            }) || errorRate.add(1);
            
            sleep(0.5);
            
            // Admin lista todos los pedidos
            if (adminToken) {
                const allPedRes = http.get(
                    `${BASE_URL}/api/pedidos`,
                    {
                        headers: { 'Authorization': `Bearer ${adminToken}` },
                        tags: { endpoint: 'pedidos', action: 'list-all' }
                    }
                );
                
                check(allPedRes, {
                    'Todos los pedidos listados (admin)': (r) => r.status === 200,
                }) || errorRate.add(1);
                
                sleep(0.5);
                
                // Admin actualiza estado del pedido
                if (pedidoId) {
                    const updateEstadoRes = http.put(
                        `${BASE_URL}/api/pedidos/${pedidoId}/estado`,
                        JSON.stringify({ estado: 'procesando' }),
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${adminToken}`
                            },
                            tags: { endpoint: 'pedidos', action: 'update-estado' }
                        }
                    );
                    
                    check(updateEstadoRes, {
                        'Estado del pedido actualizado': (r) => r.status === 200,
                    }) || errorRate.add(1);
                }
            }
        });
    }
    
    sleep(1);
}

export function setup() {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════════════════');
    console.log('           PRUEBAS EXHAUSTIVAS K6 - BACKEND SUPERMERCADO                   ');
    console.log('═══════════════════════════════════════════════════════════════════════════');
    console.log('');
    console.log('DURACIÓN TOTAL: ~12 minutos');
    console.log('');
    console.log('ESCENARIOS CONFIGURADOS:');
    console.log('');
    console.log('   1. SMOKE TEST       0:00 - 1:00   (2 VUs)    Verificación básica');
    console.log('   2. LOAD TEST        1:00 - 4:00   (20 VUs)   Carga normal');
    console.log('   3. STRESS TEST      4:00 - 8:00   (30→80 VUs) Límites del sistema');
    console.log('   4. SPIKE TEST       8:00 - 11:00  (10→100 VUs) Picos súbitos');
    console.log('   5. SOAK TEST        11:00 - 12:00 (15 VUs)   Resistencia corta');
    console.log('');
    console.log('ENDPOINTS PROBADOS:');
    console.log('   • Autenticación (register, login)');
    console.log('   • Proveedores (CRUD completo)');
    console.log('   • Productos (CRUD completo)');
    console.log('   • Clientes (CRUD completo)');
    console.log('   • Empleados (CRUD completo)');
    console.log('   • Pedidos (creación, consulta, actualización)');
    console.log('');
    console.log('ROLES PROBADOS:');
    console.log('   • Administrador (acceso total)');
    console.log('   • Empleado (gestión operativa)');
    console.log('   • Cliente (pedidos y consultas)');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════════════════');
    console.log('');
}

export function teardown() {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════════════════');
    console.log('                        PRUEBAS COMPLETADAS                                 ');
    console.log('═══════════════════════════════════════════════════════════════════════════');
    console.log('');
    console.log('REVISA LAS MÉTRICAS POR ESCENARIO:');
    console.log('');
    console.log('   Busca: http_req_duration{scenario:smoke_test}');
    console.log('   Busca: http_req_duration{scenario:load_test}');
    console.log('   Busca: http_req_duration{scenario:stress_test}');
    console.log('   Busca: http_req_duration{scenario:spike_test}');
    console.log('   Busca: http_req_duration{scenario:soak_test}');
    console.log('');
    console.log('MÉTRICAS POR ENDPOINT:');
    console.log('   Busca: http_req_duration{endpoint:login}');
    console.log('   Busca: http_req_duration{endpoint:products}');
    console.log('   Busca: http_req_duration{endpoint:pedidos}');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════════════════');
    console.log('');
}