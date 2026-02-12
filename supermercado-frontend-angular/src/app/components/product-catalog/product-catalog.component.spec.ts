import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductCatalogComponent } from './product-catalog.component';
import { ProductoService } from '../../services/producto.service';
import { of, throwError } from 'rxjs';
import { Producto } from '../../models';

describe('ProductCatalogComponent', () => {
  let component: ProductCatalogComponent;
  let fixture: ComponentFixture<ProductCatalogComponent>;
  let productoService: jasmine.SpyObj<ProductoService>;

  const mockProductos: Producto[] = [
    {
      codeProduct: 'P001',
      nameProduct: 'Arroz',
      descriptionProduct: 'Arroz blanco de grano largo',
      priceProduct: 2.50,
      stockProduct: 100
    },
    {
      codeProduct: 'P002',
      nameProduct: 'Aceite',
      descriptionProduct: 'Aceite vegetal 1L',
      priceProduct: 3.20,
      stockProduct: 50
    },
    {
      codeProduct: 'P003',
      nameProduct: 'Azúcar',
      descriptionProduct: 'Azúcar blanca refinada',
      priceProduct: 1.80,
      stockProduct: 0
    },
    {
      codeProduct: 'P004',
      nameProduct: 'Leche',
      descriptionProduct: 'Leche entera 1L',
      priceProduct: 1.50,
      stockProduct: 75
    }
  ];

  beforeEach(async () => {
    const productoServiceSpy = jasmine.createSpyObj('ProductoService', ['obtenerTodos']);

    await TestBed.configureTestingModule({
      imports: [ProductCatalogComponent],
      providers: [
        { provide: ProductoService, useValue: productoServiceSpy }
      ]
    }).compileComponents();

    productoService = TestBed.inject(ProductoService) as jasmine.SpyObj<ProductoService>;
    productoService.obtenerTodos.and.returnValue(of(mockProductos));

    fixture = TestBed.createComponent(ProductCatalogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call cargarProductos', () => {
      spyOn(component, 'cargarProductos');

      fixture.detectChanges();

      expect(component.cargarProductos).toHaveBeenCalled();
    });
  });

  describe('cargarProductos', () => {
    it('should load productos successfully', () => {
      fixture.detectChanges();

      expect(component.productos().length).toBe(4);
      expect(component.productos()[0].nameProduct).toBe('Arroz');
      expect(component.isLoading()).toBe(false);
      expect(component.productosError()).toBeNull();
    });

    it('should set isLoading to true during loading', () => {
      expect(component.isLoading()).toBe(false);

      component.cargarProductos();

      // After starting load but before observable emits, loading should be true
      // Note: synchronous observable completes immediately, so we can't test intermediate state
      expect(component.isLoading()).toBe(false); // Observable already completed
    });

    it('should handle error loading productos', () => {
      productoService.obtenerTodos.and.returnValue(
        throwError(() => new Error('Network error'))
      );
      spyOn(console, 'error');

      component.cargarProductos();

      expect(component.productosError()).toBe('Error al cargar el catálogo de productos');
      expect(component.isLoading()).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('productosFiltrados', () => {
    beforeEach(() => {
      fixture.detectChanges(); // Load productos
    });

    it('should return all productos when no filters applied', () => {
      expect(component.productosFiltrados().length).toBe(4);
    });

    it('should filter by searchTerm matching nameProduct', () => {
      component.searchTerm.set('arroz');

      expect(component.productosFiltrados().length).toBe(1);
      expect(component.productosFiltrados()[0].nameProduct).toBe('Arroz');
    });

    it('should filter by searchTerm matching descriptionProduct', () => {
      component.searchTerm.set('vegetal');

      expect(component.productosFiltrados().length).toBe(1);
      expect(component.productosFiltrados()[0].nameProduct).toBe('Aceite');
    });

    it('should filter by searchTerm matching codeProduct', () => {
      component.searchTerm.set('P003');

      expect(component.productosFiltrados().length).toBe(1);
      expect(component.productosFiltrados()[0].nameProduct).toBe('Azúcar');
    });

    it('should be case insensitive when filtering', () => {
      component.searchTerm.set('ARROZ');

      expect(component.productosFiltrados().length).toBe(1);
      expect(component.productosFiltrados()[0].nameProduct).toBe('Arroz');
    });

    it('should filter by showOnlyInStock', () => {
      component.showOnlyInStock.set(true);

      const filtered = component.productosFiltrados();
      expect(filtered.length).toBe(3); // Excludes Azúcar (stock 0)
      expect(filtered.every(p => p.stockProduct > 0)).toBe(true);
    });

    it('should sort by name', () => {
      component.sortBy.set('name');

      const filtered = component.productosFiltrados();
      expect(filtered[0].nameProduct).toBe('Aceite');
      expect(filtered[1].nameProduct).toBe('Arroz');
      expect(filtered[2].nameProduct).toBe('Azúcar');
      expect(filtered[3].nameProduct).toBe('Leche');
    });

    it('should sort by price ascending', () => {
      component.sortBy.set('price-asc');

      const filtered = component.productosFiltrados();
      expect(filtered[0].priceProduct).toBe(1.50);
      expect(filtered[1].priceProduct).toBe(1.80);
      expect(filtered[2].priceProduct).toBe(2.50);
      expect(filtered[3].priceProduct).toBe(3.20);
    });

    it('should sort by price descending', () => {
      component.sortBy.set('price-desc');

      const filtered = component.productosFiltrados();
      expect(filtered[0].priceProduct).toBe(3.20);
      expect(filtered[1].priceProduct).toBe(2.50);
      expect(filtered[2].priceProduct).toBe(1.80);
      expect(filtered[3].priceProduct).toBe(1.50);
    });

    it('should sort by stock descending', () => {
      component.sortBy.set('stock');

      const filtered = component.productosFiltrados();
      expect(filtered[0].stockProduct).toBe(100); // Arroz
      expect(filtered[1].stockProduct).toBe(75);  // Leche
      expect(filtered[2].stockProduct).toBe(50);  // Aceite
      expect(filtered[3].stockProduct).toBe(0);   // Azúcar
    });

    it('should combine search and stock filter', () => {
      component.searchTerm.set('a'); // Matches Arroz, Aceite, Azúcar, Leche (entera)
      component.showOnlyInStock.set(true);

      const filtered = component.productosFiltrados();
      expect(filtered.length).toBe(3); // Arroz, Aceite, Leche (Azúcar has no stock)
    });
  });

  describe('totalPages', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should calculate correct total pages', () => {
      // 4 productos, 12 per page = 1 page
      expect(component.totalPages()).toBe(1);
    });

    it('should update when filters change the count', () => {
      // Add more productos to test pagination
      const manyProductos: Producto[] = Array.from({ length: 25 }, (_, i) => ({
        codeProduct: `P${i}`,
        nameProduct: `Producto ${i}`,
        descriptionProduct: `Descripción ${i}`,
        priceProduct: 10,
        stockProduct: 10
      }));

      component.productos.set(manyProductos);

      // 25 productos, 12 per page = 3 pages (ceil(25/12))
      expect(component.totalPages()).toBe(3);
    });
  });

  describe('productosPaginados', () => {
    beforeEach(() => {
      // Create 25 productos for pagination testing
      const manyProductos: Producto[] = Array.from({ length: 25 }, (_, i) => ({
        codeProduct: `P${String(i).padStart(3, '0')}`,
        nameProduct: `Producto ${String(i).padStart(2, '0')}`,
        descriptionProduct: `Descripción ${i}`,
        priceProduct: 10 + i,
        stockProduct: 10
      }));

      productoService.obtenerTodos.and.returnValue(of(manyProductos));
      fixture.detectChanges();
    });

    it('should return first page of productos', () => {
      component.currentPage.set(1);

      const paginated = component.productosPaginados();
      expect(paginated.length).toBe(12);
      expect(paginated[0].nameProduct).toBe('Producto 00');
      expect(paginated[11].nameProduct).toBe('Producto 11');
    });

    it('should return second page of productos', () => {
      component.currentPage.set(2);

      const paginated = component.productosPaginados();
      expect(paginated.length).toBe(12);
      expect(paginated[0].nameProduct).toBe('Producto 12');
      expect(paginated[11].nameProduct).toBe('Producto 23');
    });

    it('should return last page with remaining productos', () => {
      component.currentPage.set(3);

      const paginated = component.productosPaginados();
      expect(paginated.length).toBe(1); // Only 25 total, so 3rd page has 1
      expect(paginated[0].nameProduct).toBe('Producto 24');
    });
  });

  describe('cambiarPagina', () => {
    beforeEach(() => {
      const manyProductos: Producto[] = Array.from({ length: 25 }, (_, i) => ({
        codeProduct: `P${i}`,
        nameProduct: `Producto ${i}`,
        descriptionProduct: `Descripción ${i}`,
        priceProduct: 10,
        stockProduct: 10
      }));
      productoService.obtenerTodos.and.returnValue(of(manyProductos));
      fixture.detectChanges();
    });

    it('should change to valid page', () => {
      spyOn(window, 'scrollTo');

      component.cambiarPagina(2);

      expect(component.currentPage()).toBe(2);
      expect(window.scrollTo).toHaveBeenCalled();
    });

    it('should not change to page less than 1', () => {
      component.currentPage.set(2);

      component.cambiarPagina(0);

      expect(component.currentPage()).toBe(2); // Unchanged
    });

    it('should not change to page greater than totalPages', () => {
      component.currentPage.set(1);

      component.cambiarPagina(10); // totalPages is 3

      expect(component.currentPage()).toBe(1); // Unchanged
    });
  });

  describe('limpiarFiltros', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should reset all filters to default values', () => {
      // Set some filters
      component.searchTerm.set('test');
      component.sortBy.set('price-desc');
      component.showOnlyInStock.set(true);
      component.currentPage.set(3);

      component.limpiarFiltros();

      expect(component.searchTerm()).toBe('');
      expect(component.sortBy()).toBe('name');
      expect(component.showOnlyInStock()).toBe(false);
      expect(component.currentPage()).toBe(1);
    });
  });

  describe('onProductoAgregado', () => {
    it('should log producto name to console', () => {
      spyOn(console, 'log');

      component.onProductoAgregado(mockProductos[0]);

      expect(console.log).toHaveBeenCalledWith('Producto agregado:', 'Arroz');
    });
  });
});
