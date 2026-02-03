import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Search } from 'lucide-react';
import { getChemicals, getLocations, createBottles, getChemical } from '../api';
import type { Chemical, Location } from '../types';

export default function AddBottle() {
  const navigate = useNavigate();
  const { chemicalId } = useParams<{ chemicalId?: string }>();

  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [chemSearch, setChemSearch] = useState('');
  const [selectedChemical, setSelectedChemical] = useState<Chemical | null>(null);

  const [form, setForm] = useState({
    chemicalId: chemicalId || '',
    numberOfBottles: '1',
    locationId: '',
    quantity: '',
    unit: 'mL',
    orderDate: new Date().toISOString().split('T')[0],
    expirationDate: '',
    receivedDate: new Date().toISOString().split('T')[0],
    lotNumber: '',
    poNumber: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [chemicalsData, locationsData] = await Promise.all([
        getChemicals({ limit: 100 }),
        getLocations()
      ]);
      setChemicals(chemicalsData.chemicals);
      setLocations(locationsData);

      // If chemicalId provided, fetch that chemical
      if (chemicalId) {
        const chem = await getChemical(parseInt(chemicalId));
        setSelectedChemical(chem);
        setForm(f => ({ ...f, chemicalId }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleChemicalSelect(chem: Chemical) {
    setSelectedChemical(chem);
    setForm({ ...form, chemicalId: chem.id.toString() });
    setChemSearch('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.chemicalId) {
      alert('Please select a chemical');
      return;
    }

    setSaving(true);
    try {
      const result = await createBottles({
        chemicalId: parseInt(form.chemicalId),
        numberOfBottles: parseInt(form.numberOfBottles),
        locationId: form.locationId ? parseInt(form.locationId) : undefined,
        quantity: form.quantity ? parseFloat(form.quantity) : undefined,
        unit: form.unit || undefined,
        orderDate: form.orderDate || undefined,
        expirationDate: form.expirationDate || undefined,
        receivedDate: form.receivedDate || undefined,
        lotNumber: form.lotNumber || undefined,
        poNumber: form.poNumber || undefined,
        notes: form.notes || undefined
      });

      alert(`Created ${result.bottles.length} bottle(s): ${result.bottles.map(b => b.bottleId).join(', ')}`);
      navigate(`/chemicals/${form.chemicalId}`);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create bottles');
    } finally {
      setSaving(false);
    }
  }

  const filteredChemicals = chemicals.filter(c =>
    c.name.toLowerCase().includes(chemSearch.toLowerCase()) ||
    c.casNumber?.toLowerCase().includes(chemSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/bottles"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Bottles</h1>
          <p className="text-gray-600">Add bottles to inventory with unique IDs</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Chemical Selection */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Chemical</h2>

          {selectedChemical ? (
            <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{selectedChemical.name}</p>
                {selectedChemical.casNumber && (
                  <p className="text-sm text-gray-500 font-mono">{selectedChemical.casNumber}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedChemical(null);
                  setForm({ ...form, chemicalId: '' });
                }}
                className="text-indigo-600 hover:text-indigo-800 text-sm"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search chemicals by name or CAS number..."
                  value={chemSearch}
                  onChange={(e) => setChemSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {chemSearch && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {filteredChemicals.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No chemicals found.{' '}
                      <Link to="/chemicals/add" className="text-indigo-600 hover:text-indigo-800">
                        Add one
                      </Link>
                    </div>
                  ) : (
                    filteredChemicals.map(chem => (
                      <button
                        key={chem.id}
                        type="button"
                        onClick={() => handleChemicalSelect(chem)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0"
                      >
                        <p className="font-medium">{chem.name}</p>
                        {chem.casNumber && (
                          <p className="text-sm text-gray-500 font-mono">{chem.casNumber}</p>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}

              {chemicals.length === 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  No chemicals in catalog.{' '}
                  <Link to="/chemicals/add" className="text-indigo-600 hover:text-indigo-800">
                    Add a chemical first
                  </Link>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Bottle Details */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Bottle Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Bottles *
              </label>
              <input
                type="number"
                min="1"
                max="100"
                required
                value={form.numberOfBottles}
                onChange={(e) => setForm({ ...form, numberOfBottles: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Each bottle gets a unique ID (e.g., CHEM0001-1, CHEM0001-2)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Storage Location
              </label>
              <select
                value={form.locationId}
                onChange={(e) => setForm({ ...form, locationId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select location...</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} {loc.room && `(${loc.room})`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                step="0.1"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="mL">mL</option>
                <option value="L">L</option>
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="oz">oz</option>
                <option value="lb">lb</option>
                <option value="gal">gal</option>
                <option value="units">units</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dates & Tracking */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Dates & Tracking</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Date
              </label>
              <input
                type="date"
                value={form.orderDate}
                onChange={(e) => setForm({ ...form, orderDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Received Date
              </label>
              <input
                type="date"
                value={form.receivedDate}
                onChange={(e) => setForm({ ...form, receivedDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiration Date
              </label>
              <input
                type="date"
                value={form.expirationDate}
                onChange={(e) => setForm({ ...form, expirationDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lot Number
              </label>
              <input
                type="text"
                value={form.lotNumber}
                onChange={(e) => setForm({ ...form, lotNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PO Number
              </label>
              <input
                type="text"
                value={form.poNumber}
                onChange={(e) => setForm({ ...form, poNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Any additional notes..."
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link
            to="/bottles"
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || !form.chemicalId}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving && <Loader2 size={20} className="animate-spin" />}
            Add {form.numberOfBottles} Bottle{parseInt(form.numberOfBottles) !== 1 ? 's' : ''}
          </button>
        </div>
      </form>
    </div>
  );
}
