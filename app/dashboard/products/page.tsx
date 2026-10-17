import { getPaginatedProducts } from '@/lib/actions/product.actions';
import ProductTable from '@/components/ProductTable';
import BulkUpdateModal from '@/components/BulkUpdateModal';
import { ProductCreateForm } from '@/components/product-forms';

const SLA_THRESHOLD_MS = 400;

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

  const slaOk = data.durationMs < SLA_THRESHOLD_MS;

  return (
    <main className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Inventario</h1>
          <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
            <span>Consulta y administra productos del sistema</span>
            <span className="text-gray-300">•</span>
            <span className="text-xs">
              SLA (&lt;400ms):{' '}
              <strong
                data-testid="query-sla"
                className={slaOk ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}
              >
                {slaOk ? 'OK' : 'LENTO'}
              </strong>
              <span data-testid="query-time" className="ml-1 text-gray-400">
                ({data.durationMs} ms)
              </span>
            </span>
          </div>
        </div>
        <BulkUpdateModal />
      </div>

      <ProductCreateForm />
      <ProductTable data={data} />
    </main>
  );
}
