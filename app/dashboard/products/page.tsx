import { getPaginatedProducts } from '@/lib/actions/product.actions';
import ProductTable from '@/components/ProductTable';
import BulkUpdateModal from '@/components/BulkUpdateModal';

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams.page) || 1;
  const search = resolvedParams.search || undefined;
  const category = resolvedParams.category || undefined;

  const data = await getPaginatedProducts({
    page,
    limit: 10,
    search,
    category,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  return (
    <main className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Inventario</h1>
          <p className="text-sm text-gray-500">Consulta y administra productos del sistema</p>
        </div>
        <BulkUpdateModal />
      </div>

      <ProductTable data={data} />
    </main>
  );
}