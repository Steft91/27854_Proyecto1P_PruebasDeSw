/* istanbul ignore file */
import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Cliente } from '../../models';
import { ClienteFormComponent } from '../../components/cliente-form.component/cliente-form.component';
import { ClientesListComponent } from '../../components/clientes-list.component/clientes-list.component';

@Component({
  selector: 'app-clientes-page',
  standalone: true,
  imports: [CommonModule, ClienteFormComponent, ClientesListComponent],
  templateUrl: './clientes-page.component.html',
  styleUrls: ['./clientes-page.component.css']
})
export class ClientesPageComponent {
  @ViewChild(ClientesListComponent) listaClientes!: ClientesListComponent;

  clienteEditar: Cliente | null = null;

  setEditCliente(cliente: Cliente) {
    this.clienteEditar = cliente;
    this.scrollToTop();
  }

  onClienteGuardado() {
    this.cancelarEdicion();
    this.listaClientes.cargarClientes();
  }

  cancelarEdicion() {
    this.clienteEditar = null;
  }

  private scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
