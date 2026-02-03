import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Check, MapPin, Package } from 'lucide-react';
import { getLocations, createLocation, updateLocation, deleteLocation } from '../api';
import type { Location } from '../types';

export default function Locations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    room: '',
    building: '',
    storageType: ''
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  async function fetchLocations() {
    try {
      const data = await getLocations();
      setLocations(data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({
      name: '',
      description: '',
      room: '',
      building: '',
      storageType: ''
    });
    setShowForm(false);
    setEditingId(null);
  }

  function startEdit(location: Location) {
    setForm({
      name: location.name,
      description: location.description || '',
      room: location.room || '',
      building: location.building || '',
      storageType: location.storageType || ''
    });
    setEditingId(location.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim()) {
      alert('Location name is required');
      return;
    }

    try {
      if (editingId) {
        const updated = await updateLocation(editingId, form);
        setLocations(locations.map(l => l.id === editingId ? { ...l, ...updated } : l));
      } else {
        const created = await createLocation(form);
        setLocations([...locations, created]);
      }
      resetForm();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to save location');
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteLocation(id);
      setLocations(locations.filter(l => l.id !== id));
      setDeleteConfirm(null);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete location');
    }
  }

  const storageTypes = [
    'Cabinet',
    'Shelf',
    'Refrigerator',
    'Freezer',
    'Flammable Cabinet',
    'Acid Cabinet',
    'Base Cabinet',
    'Corrosive Cabinet',
    'Fume Hood',
    'Cold Room',
    'Other'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Locations</h1>
          <p className="text-gray-600">Manage storage locations</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} />
          Add Location
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingId ? 'Edit Location' : 'Add New Location'}
            </h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Flammable Cabinet A"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Storage Type
              </label>
              <select
                value={form.storageType}
                onChange={(e) => setForm({ ...form, storageType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select type...</option>
                {storageTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room
              </label>
              <input
                type="text"
                value={form.room}
                onChange={(e) => setForm({ ...form, room: e.target.value })}
                placeholder="e.g., Room 101"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Building
              </label>
              <input
                type="text"
                value={form.building}
                onChange={(e) => setForm({ ...form, building: e.target.value })}
                placeholder="e.g., Science Building"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Additional details about this location..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="col-span-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                {editingId ? 'Update' : 'Create'} Location
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Locations Grid */}
      {locations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <MapPin className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500 mb-4">No locations defined yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus size={20} />
            Add your first location
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map(location => (
            <div
              key={location.id}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <MapPin size={20} className="text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{location.name}</h3>
                    {location.storageType && (
                      <span className="text-xs text-gray-500">{location.storageType}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEdit(location)}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 rounded"
                  >
                    <Edit2 size={16} />
                  </button>
                  {deleteConfirm === location.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(location.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="p-1.5 text-gray-400 hover:bg-gray-100 rounded"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(location.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {(location.room || location.building) && (
                <p className="text-sm text-gray-600 mb-2">
                  {[location.room, location.building].filter(Boolean).join(', ')}
                </p>
              )}

              {location.description && (
                <p className="text-sm text-gray-500 mb-3">{location.description}</p>
              )}

              <div className="flex items-center gap-2 text-sm">
                <Package size={16} className="text-gray-400" />
                <span className={location._count?.bottles ? 'text-gray-900' : 'text-gray-400'}>
                  {location._count?.bottles || 0} bottles
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
