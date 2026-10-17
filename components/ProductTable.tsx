'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { softDeleteProduct } from '@/lib/actions/product.actions';
import { formatCurrency } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}

interface ProductTableProps {
  data: {
    products: Product[];
    total: number;
    totalPages: number;
    currentPage: number;
  };
}

export default function ProductTable({ data }: ProductTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleCategoryFilter = (cat: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    if (cat && cat !== 'ALL') {
      params.set('category', cat);
    } else {
      params.delete('category');
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      startTransition(async () => {
        await softDeleteProduct(id);
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <input
          type="text"
          placeholder="Buscar producto por nombre..."
          defaultValue={searchParams.get('search')?.toString()}
          onChange={(e) => handleSearch(e.target.value)}
          className="border border-gray-300 p-2.5 rounded-lg w-full sm:w-80 outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <select
          defaultValue={searchParams.get('category')?.toString() || 'ALL'}
          onChange={(e) => handleCategoryFilter(e.target.value)}
          className="border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="ALL">Todas las Categorías</option>
          <option value="Electrónica">Electrónica</option>
          <option value="Ropa">Ropa</option>
          <option value="Hogar">Hogar</option>
          <option value="Deportes">Deportes</option>
          <option value="Juguetes">Juguetes</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
            <tr>
              <th className="p-4">Nombre</th>
              <th className="p-4">Categoría</th>
              <th className="p-4">Precio</th>
              <th className="p-4">Stock</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {data.products.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  No se encontraron productos.
                </td>
              </tr>
            ) : (
              data.products.map((product) => (
                <tr
                  key={product.id}
                  data-testid="product-row"
                  className="hover:bg-gray-50/50 transition"
                >
                  <td className="p-4 font-medium text-gray-900">{product.name}</td>
                  <td className="p-4 text-gray-600">{product.category}</td>
                  <td className="p-4 font-semibold text-gray-900">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="p-4 text-gray-600">{product.stock}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={isPending}
                      className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 font-medium rounded-lg transition disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-sm text-gray-600">
          Página <strong>{data.currentPage}</strong> de <strong>{data.totalPages}</strong> ({data.total} productos)
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => handlePageChange(data.currentPage - 1)}
            disabled={data.currentPage <= 1}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
          >
            Anterior
          </button>
          <button
            onClick={() => handlePageChange(data.currentPage + 1)}
            disabled={data.currentPage >= data.totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}