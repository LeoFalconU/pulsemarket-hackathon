'use client';

import { useState, useTransition } from 'react';
import { bulkUpdateCategoryPrices } from '@/lib/actions/product.actions';

export default function BulkUpdateModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState('Electrónica');
  const [percentage, setPercentage] = useState(10);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await bulkUpdateCategoryPrices({
        category,
        pricePercentageChange: Number(percentage),
      });
      setIsOpen(false);
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
      >
        Actualización Masiva
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-4 shadow-xl">
            <h2 className="text-xl font-bold text-gray-800">Ajustar Precios por Categoría</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-gray-300 p-2.5 rounded-lg mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="Electrónica">Electrónica</option>
                  <option value="Ropa">Ropa</option>
                  <option value="Hogar">Hogar</option>
                  <option value="Deportes">Deportes</option>
                  <option value="Juguetes">Juguetes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Porcentaje de Cambio (%)
                </label>
                <input
                  type="number"
                  value={percentage}
                  onChange={(e) => setPercentage(Number(e.target.value))}
                  placeholder="Ej. 10 para aumentar o -10 para descontar"
                  className="w-full border border-gray-300 p-2.5 rounded-lg mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isPending ? 'Aplicando...' : 'Aplicar Cambio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}