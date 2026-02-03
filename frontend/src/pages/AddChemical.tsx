import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Search, Loader2, Check, AlertCircle } from 'lucide-react';
import { lookupByCAS, createChemical } from '../api';
import type { ChemicalLookupResult } from '../types';
import NFPADiamond from '../components/NFPADiamond';

export default function AddChemical() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'lookup' | 'manual'>('lookup');
  const [casNumber, setCasNumber] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<ChemicalLookupResult | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    casNumber: '',
    formula: '',
    molecularWeight: '',
    nfpaHealth: '',
    nfpaFire: '',
    nfpaReactivity: '',
    nfpaSpecial: '',
    sdsUrl: '',
    supplier: ''
  });

  async function handleLookup() {
    if (!casNumber.trim()) return;

    setLookupLoading(true);
    setLookupError(null);
    setLookupResult(null);

    try {
      const result = await lookupByCAS(casNumber.trim());
      setLookupResult(result);
      setForm({
        name: result.name || '',
        casNumber: result.casNumber || '',
        formula: result.formula || '',
        molecularWeight: result.molecularWeight?.toString() || '',
        nfpaHealth: result.nfpaHealth?.toString() || '',
        nfpaFire: result.nfpaFire?.toString() || '',
        nfpaReactivity: result.nfpaReactivity?.toString() || '',
        nfpaSpecial: result.nfpaSpecial || '',
        sdsUrl: result.sdsUrl || '',
        supplier: result.supplier || ''
      });
    } catch (error: any) {
      setLookupError(error.response?.data?.error || 'Failed to lookup chemical. Try manual entry.');
    } finally {
      setLookupLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim()) {
      alert('Chemical name is required');
      return;
    }

    setSaving(true);
    try {
      const chemical = await createChemical({
        name: form.name,
        casNumber: form.casNumber || null,
        formula: form.formula || null,
        molecularWeight: form.molecularWeight ? parseFloat(form.molecularWeight) : null,
        nfpaHealth: form.nfpaHealth ? parseInt(form.nfpaHealth) : null,
        nfpaFire: form.nfpaFire ? parseInt(form.nfpaFire) : null,
        nfpaReactivity: form.nfpaReactivity ? parseInt(form.nfpaReactivity) : null,
        nfpaSpecial: form.nfpaSpecial || null,
        sdsUrl: form.sdsUrl || null,
        supplier: form.supplier || null
      });
      navigate(`/chemicals/${chemical.id}`);
    } catch (error: any) {
      if (error.response?.data?.existingId) {
        if (confirm('A chemical with this CAS number already exists. Go to existing chemical?')) {
          navigate(`/chemicals/${error.response.data.existingId}`);
        }
      } else {
        alert(error.response?.data?.error || 'Failed to create chemical');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/chemicals"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Chemical</h1>
          <p className="text-gray-600">Add a new chemical to your catalog</p>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setMode('lookup')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              mode === 'lookup'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            CAS Lookup
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              mode === 'manual'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Manual Entry
          </button>
        </div>

        {/* CAS Lookup */}
        {mode === 'lookup' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CAS Registry Number
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="e.g., 64-17-5 (Ethanol)"
                value={casNumber}
                onChange={(e) => setCasNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                onClick={handleLookup}
                disabled={lookupLoading || !casNumber.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {lookupLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Search size={20} />
                )}
                Lookup
              </button>
            </div>

            {lookupError && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                <AlertCircle size={20} />
                {lookupError}
              </div>
            )}

            {lookupResult && (
              <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
                <Check size={20} />
                Found: {lookupResult.name}
              </div>
            )}

            <p className="mt-3 text-sm text-gray-500">
              Searches PubChem and Sigma-Aldrich for chemical data, SDS links, and NFPA ratings.
            </p>
          </div>
        )}
      </div>

      {/* Chemical Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Chemical Information</h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chemical Name *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CAS Number
            </label>
            <input
              type="text"
              placeholder="XX-XX-X"
              value={form.casNumber}
              onChange={(e) => setForm({ ...form, casNumber: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Molecular Formula
            </label>
            <input
              type="text"
              placeholder="e.g., C2H5OH"
              value={form.formula}
              onChange={(e) => setForm({ ...form, formula: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Molecular Weight (g/mol)
            </label>
            <input
              type="number"
              step="0.01"
              value={form.molecularWeight}
              onChange={(e) => setForm({ ...form, molecularWeight: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supplier
            </label>
            <input
              type="text"
              placeholder="e.g., Sigma-Aldrich"
              value={form.supplier}
              onChange={(e) => setForm({ ...form, supplier: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SDS URL
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={form.sdsUrl}
              onChange={(e) => setForm({ ...form, sdsUrl: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* NFPA Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">NFPA 704 Ratings</h3>

          <div className="flex gap-8 items-start">
            <div className="flex-1 grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-600 mb-1">
                  Health (0-4)
                </label>
                <input
                  type="number"
                  min="0"
                  max="4"
                  value={form.nfpaHealth}
                  onChange={(e) => setForm({ ...form, nfpaHealth: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-red-600 mb-1">
                  Fire (0-4)
                </label>
                <input
                  type="number"
                  min="0"
                  max="4"
                  value={form.nfpaFire}
                  onChange={(e) => setForm({ ...form, nfpaFire: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-yellow-600 mb-1">
                  Reactivity (0-4)
                </label>
                <input
                  type="number"
                  min="0"
                  max="4"
                  value={form.nfpaReactivity}
                  onChange={(e) => setForm({ ...form, nfpaReactivity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Special
                </label>
                <input
                  type="text"
                  placeholder="OX, W, SA"
                  value={form.nfpaSpecial}
                  onChange={(e) => setForm({ ...form, nfpaSpecial: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <NFPADiamond
              health={form.nfpaHealth ? parseInt(form.nfpaHealth) : null}
              fire={form.nfpaFire ? parseInt(form.nfpaFire) : null}
              reactivity={form.nfpaReactivity ? parseInt(form.nfpaReactivity) : null}
              special={form.nfpaSpecial || null}
              size="md"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
          <Link
            to="/chemicals"
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving && <Loader2 size={20} className="animate-spin" />}
            Create Chemical
          </button>
        </div>
      </form>
    </div>
  );
}
