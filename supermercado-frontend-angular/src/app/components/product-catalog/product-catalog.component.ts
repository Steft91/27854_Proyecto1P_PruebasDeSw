import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../services/producto.service';
import { ProductCardComponent } from '../product-card/product-card.component';
import { Producto } from '../../models';

@Component({
  selector: 'app-product-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent],
  templateUrl: './product-catalog.component.html',
  styleUrls: ['./product-catalog.component.css']
})
export class ProductCatalogComponent implements OnInit {

  // 🔥 Estado reactivo
  productos = signal<Producto[]>([]);
  productosError = signal<string | null>(null);
  isLoading = signal<boolean>(false);

  // Filtros
  searchTerm = signal<string>('');
  sortBy = signal<'name' | 'price-asc' | 'price-desc' | 'stock'>('name');
  showOnlyInStock = signal<boolean>(false);

  // Paginación
  currentPage = signal<number>(1);
  itemsPerPage = 12;

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.isLoading.set(true);
    this.productosError.set(null);

    this.productoService.obtenerTodos().subscribe({
      next: (productos) => {
        this.productos.set(productos);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error(error);
        this.productosError.set('Error al cargar el catálogo de productos');
        this.isLoading.set(false);
      }
    });
  }

  // 🔥 Computed: productos filtrados
  productosFiltrados = computed(() => {

    let resultados = [...this.productos()];

    const term = this.searchTerm().trim().toLowerCase();
    const sort = this.sortBy();
    const onlyStock = this.showOnlyInStock();

    if (term) {
      resultados = resultados.filter(p =>
        p.nameProduct.toLowerCase().includes(term) ||
        p.descriptionProduct.toLowerCase().includes(term) ||
        p.codeProduct.toLowerCase().includes(term)
      );
    }

    if (onlyStock) {
      resultados = resultados.filter(p => p.stockProduct > 0);
    }

    switch (sort) {
      case 'name':
        resultados.sort((a, b) => a.nameProduct.localeCompare(b.nameProduct));
        break;
      case 'price-asc':
        resultados.sort((a, b) => a.priceProduct - b.priceProduct);
        break;
      case 'price-desc':
        resultados.sort((a, b) => b.priceProduct - a.priceProduct);
        break;
      case 'stock':
        resultados.sort((a, b) => b.stockProduct - a.stockProduct);
        break;
    }

    return resultados;
  });

  // 🔥 Computed: total pages
  totalPages = computed(() =>
    Math.ceil(this.productosFiltrados().length / this.itemsPerPage)
  );

  // 🔥 Computed: productos paginados
  productosPaginados = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    return this.productosFiltrados().slice(
      startIndex,
      startIndex + this.itemsPerPage
    );
  });

  cambiarPagina(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  limpiarFiltros(): void {
    this.searchTerm.set('');
    this.sortBy.set('name');
    this.showOnlyInStock.set(false);
    this.currentPage.set(1);
  }

  onProductoAgregado(producto: Producto): void {
    console.log('Producto agregado:', producto.nameProduct);
  }
}
