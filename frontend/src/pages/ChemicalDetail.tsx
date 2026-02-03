import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit2,
  Save,
  X,
  Plus,
  ExternalLink,
  Package,
  Trash2
} from 'lucide-react';
import { getChemical, updateChemical, deleteBottle } from '../api';
import type { Chemical, Bottle } from '../types';
import NFPADiamond from '../components/NFPADiamond';

export default function ChemicalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [chemical, setChemical] = useState<Chemical | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Chemical>>({});

  useEffect(() => {
    fetchChemical();
  }, [id]);

  async function fetchChemical() {
    if (!id) return;
    try {
      const data = await getChemical(parseInt(id));
      setChemical(data);
      setEditForm(data);
    } catch (error) {
      console.error('Error fetching chemical:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!id || !editForm) return;
    try {
      const updated = await updateChemical(parseInt(id), editForm);
      setChemical({ ...chemical, ...updated } as Chemical);
      setEditing(false);
    } catch (error) {
      console.error('Error updating chemical:', error);
      alert('Failed to update chemical');
    }
  }

  async function handleDeleteBottle(bottleId: number) {
    if (!confirm('Are you sure you want to delete this bottle?')) return;
    try {
      await deleteBottle(bottleId);
      setChemical({
        ...chemical!,
        bottles: chemical!.bottles?.filter(b => b.id !== bottleId)
      });
    } catch (error) {
      console.error('Error deleting bottle:', error);
      alert('Failed to delete bottle');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!chemical) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Chemical not found</p>
        <Link to="/chemicals" className="text-indigo-600 hover:text-indigo-800">
          Back to chemicals
        </Link>
      </div>
    );
  }

  const activeBottles = chemical.bottles?.filter(b => b.status === 'active') || [];
  const otherBottles = chemical.bottles?.filter(b => b.status !== 'active') || [];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            to="/chemicals"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{chemical.name}</h1>
            {chemical.casNumber && (
              <p className="text-gray-600 font-mono">CAS: {chemical.casNumber}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {editing ? (
            <>
              <button
                onClick={() => setEditing(false)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <X size={20} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Save size={20} />
                Save
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Edit2 size={20} />
                Edit
              </button>
              <Link
                to={`/bottles/add/${chemical.id}`}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Plus size={20} />
                Add Bottles
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chemical Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Chemical Information</h2>

            {editing ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CAS Number</label>
                  <input
                    type="text"
                    value={editForm.casNumber || ''}
                    onChange={(e) => setEditForm({ ...editForm, casNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Formula</label>
                  <input
                    type="text"
                    value={editForm.formula || ''}
                    onChange={(e) => setEditForm({ ...editForm, formula: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Molecular Weight</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.molecularWeight || ''}
                    onChange={(e) => setEditForm({ ...editForm, molecularWeight: parseFloat(e.target.value) || null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SDS URL</label>
                  <input
                    type="url"
                    value={editForm.sdsUrl || ''}
                    onChange={(e) => setEditForm({ ...editForm, sdsUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                  <input
                    type="text"
                    value={editForm.supplier || ''}
                    onChange={(e) => setEditForm({ ...editForm, supplier: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            ) : (
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500">Formula</dt>
                  <dd className="text-gray-900">{chemical.formula || '—'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Molecular Weight</dt>
                  <dd className="text-gray-900">{chemical.molecularWeight ? `${chemical.molecularWeight} g/mol` : '—'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Supplier</dt>
                  <dd className="text-gray-900">{chemical.supplier || '—'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">SDS</dt>
                  <dd>
                    {chemical.sdsUrl ? (
                      <a
                        href={chemical.sdsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        View SDS <ExternalLink size={14} />
                      </a>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </dd>
                </div>
              </dl>
            )}
          </div>

          {/* NFPA Ratings (Edit mode) */}
          {editing && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">NFPA 704 Ratings</h2>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-600 mb-1">Health (0-4)</label>
                  <input
                    type="number"
                    min="0"
                    max="4"
                    value={editForm.nfpaHealth ?? ''}
                    onChange={(e) => setEditForm({ ...editForm, nfpaHealth: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-red-600 mb-1">Fire (0-4)</label>
                  <input
                    type="number"
                    min="0"
                    max="4"
                    value={editForm.nfpaFire ?? ''}
                    onChange={(e) => setEditForm({ ...editForm, nfpaFire: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-yellow-600 mb-1">Reactivity (0-4)</label>
                  <input
                    type="number"
                    min="0"
                    max="4"
                    value={editForm.nfpaReactivity ?? ''}
                    onChange={(e) => setEditForm({ ...editForm, nfpaReactivity: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Special</label>
                  <input
                    type="text"
                    placeholder="OX, W, SA"
                    value={editForm.nfpaSpecial || ''}
                    onChange={(e) => setEditForm({ ...editForm, nfpaSpecial: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bottles List */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                <Package className="inline mr-2" size={20} />
                Inventory ({activeBottles.length} active)
              </h2>
            </div>

            {chemical.bottles?.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No bottles in inventory</p>
                <Link
                  to={`/bottles/add/${chemical.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <Plus size={20} />
                  Add Bottles
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Active Bottles */}
                {activeBottles.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Active</h3>
                    <div className="space-y-2">
                      {activeBottles.map((bottle) => (
                        <BottleRow key={bottle.id} bottle={bottle} onDelete={handleDeleteBottle} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Other Bottles */}
                {otherBottles.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Disposed/Empty</h3>
                    <div className="space-y-2 opacity-60">
                      {otherBottles.map((bottle) => (
                        <BottleRow key={bottle.id} bottle={bottle} onDelete={handleDeleteBottle} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* NFPA Diamond */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">NFPA 704 Rating</h2>
            <div className="flex justify-center">
              <NFPADiamond
                health={chemical.nfpaHealth}
                fire={chemical.nfpaFire}
                reactivity={chemical.nfpaReactivity}
                special={chemical.nfpaSpecial}
                size="lg"
              />
            </div>
            <div className="mt-4 text-sm space-y-1">
              <p><span className="text-blue-600 font-medium">Health:</span> {chemical.nfpaHealth ?? 'N/A'}</p>
              <p><span className="text-red-600 font-medium">Fire:</span> {chemical.nfpaFire ?? 'N/A'}</p>
              <p><span className="text-yellow-600 font-medium">Reactivity:</span> {chemical.nfpaReactivity ?? 'N/A'}</p>
              {chemical.nfpaSpecial && (
                <p><span className="font-medium">Special:</span> {chemical.nfpaSpecial}</p>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-gray-500">Total Bottles</dt>
                <dd className="font-medium">{chemical.bottles?.length || 0}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Active</dt>
                <dd className="font-medium text-green-600">{activeBottles.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Disposed/Empty</dt>
                <dd className="font-medium text-gray-400">{otherBottles.length}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function BottleRow({ bottle, onDelete }: { bottle: Bottle; onDelete: (id: number) => void }) {
  const isExpired = bottle.expirationDate && new Date(bottle.expirationDate) < new Date();

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg ${
      isExpired ? 'bg-red-50' : 'bg-gray-50'
    }`}>
      <div>
        <p className="font-medium text-gray-900">{bottle.bottleId}</p>
        <p className="text-sm text-gray-500">
          {bottle.location?.name || 'No location'} •{' '}
          {bottle.quantity && bottle.unit ? `${bottle.quantity} ${bottle.unit}` : 'Qty unknown'}
        </p>
        {bottle.expirationDate && (
          <p className={`text-sm ${isExpired ? 'text-red-600' : 'text-gray-500'}`}>
            {isExpired ? 'Expired' : 'Expires'}: {new Date(bottle.expirationDate).toLocaleDateString()}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          bottle.status === 'active' ? 'bg-green-100 text-green-800' :
          bottle.status === 'empty' ? 'bg-gray-100 text-gray-800' :
          'bg-red-100 text-red-800'
        }`}>
          {bottle.status}
        </span>
        <button
          onClick={() => onDelete(bottle.id)}
          className="p-1 text-gray-400 hover:text-red-600"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
