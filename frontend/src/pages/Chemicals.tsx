import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, ChevronLeft, ChevronRight, Trash2, ExternalLink } from 'lucide-react';
import { getChemicals, deleteChemical } from '../api';
import type { Chemical, Pagination } from '../types';
import NFPADiamond from '../components/NFPADiamond';

export default function Chemicals() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    fetchChemicals();
  }, [page, searchParams.get('search')]);

  async function fetchChemicals() {
    setLoading(true);
    try {
      const data = await getChemicals({
        search: searchParams.get('search') || undefined,
        page,
        limit: 20
      });
      setChemicals(data.chemicals);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching chemicals:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchParams(search ? { search, page: '1' } : {});
  }

  async function handleDelete(id: number) {
    try {
      await deleteChemical(id);
      setChemicals(chemicals.filter(c => c.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting chemical:', error);
      alert('Failed to delete chemical. Make sure all bottles are removed first.');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chemicals</h1>
          <p className="text-gray-600">Manage your chemical catalog</p>
        </div>
        <Link
          to="/chemicals/add"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} />
          Add Chemical
        </Link>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, CAS number, or formula..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </form>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : chemicals.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-500 mb-4">No chemicals found</p>
          <Link
            to="/chemicals/add"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus size={20} />
            Add your first chemical
          </Link>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">NFPA</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">CAS Number</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Formula</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Bottles</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">SDS</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {chemicals.map((chemical) => (
                  <tr key={chemical.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <NFPADiamond
                        health={chemical.nfpaHealth}
                        fire={chemical.nfpaFire}
                        reactivity={chemical.nfpaReactivity}
                        special={chemical.nfpaSpecial}
                        size="sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/chemicals/${chemical.id}`}
                        className="font-medium text-indigo-600 hover:text-indigo-800"
                      >
                        {chemical.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-sm">
                      {chemical.casNumber || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {chemical.formula || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        (chemical.bottles?.filter(b => b.status === 'active').length || 0) > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {chemical.bottles?.filter(b => b.status === 'active').length || 0} active
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {chemical.sdsUrl ? (
                        <a
                          href={chemical.sdsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          <ExternalLink size={18} />
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {deleteConfirm === chemical.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDelete(chemical.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="text-gray-600 hover:text-gray-800 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(chemical.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-600">
                Showing {(page - 1) * pagination.limit + 1} to{' '}
                {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} chemicals
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: String(page - 1) })}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="px-4 py-2 text-sm">
                  Page {page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: String(page + 1) })}
                  disabled={page === pagination.totalPages}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
