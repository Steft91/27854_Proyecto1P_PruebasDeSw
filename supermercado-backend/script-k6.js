import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
    scenarios: {
        smoke_test: {
            executor: 'constant-vus',
            vus: 2,
            duration: '1m',
            startTime: '0s',
            tags: { scenario: 'smoke_test', test_type: 'smoke' },
            gracefulStop: '10s',
        },
        load_test: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '30s', target: 20 },
                { duration: '2m', target: 20 },
                { duration: '30s', target: 0 },
            ],
            startTime: '1m',
            tags: { scenario: 'load_test', test_type: 'load' },
            gracefulRampDown: '10s',
        },
        stress_test: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '1m', target: 30 },
                { duration: '1m', target: 50 },
                { duration: '1m', target: 80 },
                { duration: '1m', target: 0 },
            ],
            startTime: '4m',
            tags: { scenario: 'stress_test', test_type: 'stress' },
            gracefulRampDown: '10s',
        },
        spike_test: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '30s', target: 10 },
                { duration: '10s', target: 100 },
                { duration: '1m', target: 100 },
                { duration: '30s', target: 10 },
                { duration: '50s', target: 10 },
            ],
            startTime: '8m',
            tags: { scenario: 'spike_test', test_type: 'spike' },
            gracefulRampDown: '10s',
        },
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
        'http_req_duration': ['p(95)<3000'],
        'http_req_failed': ['rate<0.10'],
        'checks': ['rate>0.85'],
        'http_req_duration{scenario:smoke_test}': ['p(95)<1000'],
        'http_req_duration{scenario:load_test}': ['p(95)<2000'],
        'http_req_duration{scenario:stress_test}': ['p(95)<3000'],
        'http_req_duration{scenario:spike_test}': ['p(95)<5000'],
        'http_req_duration{scenario:soak_test}': ['p(95)<2000'],
        'http_req_duration{endpoint:login}': ['p(95)<2000'],
        'http_req_duration{endpoint:register}': ['p(95)<3000'],
        'errors': ['rate<0.10'],
    }
};

const BASE_URL = 'http://localhost:5000';

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
    const province = String(Math.floor(Math.random() * 24) + 1).padStart(2, '0');
    const third = Math.floor(Math.random() * 6);
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
    return String(Math.floor(Math.random() * 9000000000000) + 1000000000000);
}

function generatePhoneNumber() {
    return '09' + String(Math.floor(Math.random() * 100000000)).padStart(8, '0');
}

export default function () {
    const data = generateUniqueData();
    let adminToken = null;
    let empleadoToken = null;
    let clienteToken = null;
    let proveedorId = null;
    let productCode = null;
    let clienteDni = null;
    let empleadoCedula = null;
    let pedidoId = null;
    group('01_Autenticación', () => {
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
    if (adminToken) {
        group('02_Proveedores', () => {
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
    if (empleadoToken && proveedorId) {
        group('03_Productos', () => {
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
    if (empleadoToken) {
        group('04_Clientes', () => {
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
    if (adminToken) {
        group('05_Empleados', () => {
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
    if (clienteToken && productCode) {
        group('06_Pedidos', () => {
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