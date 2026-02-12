/* istanbul ignore file */
import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Proveedor } from '../../models';
import { ProveedorFormComponent } from '../../components/proveedor-form.component/proveedor-form.component';
import { ProveedorListComponent } from '../../components/proveedor-list.component/proveedor-list.component';

@Component({
  selector: 'app-proveedores-page',
  standalone: true,
  imports: [CommonModule, ProveedorFormComponent, ProveedorListComponent],
  templateUrl: './proveedores-page.component.html',
  styleUrls: ['./proveedores-page.component.css']
})
export class ProveedoresPageComponent {
  @ViewChild(ProveedorListComponent) listaProveedores!: ProveedorListComponent;

  proveedorEditar: Proveedor | null = null;

  setEditProveedor(proveedor: Proveedor) {
    this.proveedorEditar = proveedor;
    this.scrollToTop();
  }

  onProveedorGuardado() {
    this.cancelarEdicion();
    this.listaProveedores.cargar();
  }

  cancelarEdicion() {
    this.proveedorEditar = null;
  }

  private scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
