export interface AuthResponse {
  token: string;
  user?: {
    id: string;
    username: string;
    email: string;
    rol: string;
  };
  msg?: string;
}

export interface Cliente {
  _id?: string;
  dniClient: string;
  nameClient: string;
  surnameClient: string;
  emailClient?: string;
  phoneClient?: string;
  addressClient?: string;
}

export interface Proveedor {
  _id?: string;
  nombreFiscal: string;
  rucNitNif: string;
  direccionFisica: string;
  telefonoPrincipal?: string;
  correoElectronico?: string;
  contactoNombre?: string;
  contactoPuesto?: string;
}

export interface Producto {
  codeProduct: string;
  nameProduct: string;
  descriptionProduct: string;
  priceProduct: number;
  stockProduct: number;
  proveedor?: string | Proveedor;
}

export interface Empleado {
  cedulaEmpleado: string;
  nombreEmpleado: string;
  emailEmpleado?: string;
  celularEmpleado: string;
  direccionEmpleado?: string;
  sueldoEmpleado: number;
}