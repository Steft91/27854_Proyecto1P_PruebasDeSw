import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producto } from '../../models';
import { ProductoFormComponent } from '../../components/producto-form.component/producto-form.component';
import { ProductosListComponent } from '../../components/productos-list.component/productos-list.component';

@Component({
  selector: 'app-productos-page',
  standalone: true,
  imports: [CommonModule, ProductoFormComponent, ProductosListComponent],
  templateUrl: './productos-page.component.html',
  styleUrls: ['./productos-page.component.css']
})
export class ProductosPageComponent {
  @ViewChild(ProductosListComponent) listaProductos!: ProductosListComponent;

  productoEditar: Producto | null = null;

  setEditProducto(producto: Producto) {
    this.productoEditar = producto;
    this.scrollToTop();
  }

  onProductoGuardado() {
    this.cancelarEdicion();
    this.listaProductos.cargar();
  }

  cancelarEdicion() {
    this.productoEditar = null;
  }

  private scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
