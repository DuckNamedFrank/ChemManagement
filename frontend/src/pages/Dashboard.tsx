import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FlaskConical,
  Package,
  MapPin,
  AlertTriangle,
  Plus,
  ArrowRight
} from 'lucide-react';
import { getStats, getBottles } from '../api';
import type { Stats, Bottle } from '../types';
import NFPADiamond from '../components/NFPADiamond';

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [expiredBottles, setExpiredBottles] = useState<Bottle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, expiredData] = await Promise.all([
          getStats(),
          getBottles({ expired: true, limit: 5 })
        ]);
        setStats(statsData);
        setExpiredBottles(expiredData.bottles);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Chemicals',
      value: stats?.totalChemicals || 0,
      icon: FlaskConical,
      color: 'bg-blue-500',
      link: '/chemicals'
    },
    {
      label: 'Active Bottles',
      value: stats?.activeBottles || 0,
      icon: Package,
      color: 'bg-green-500',
      link: '/bottles'
    },
    {
      label: 'Expired Bottles',
      value: stats?.expiredBottles || 0,
      icon: AlertTriangle,
      color: 'bg-red-500',
      link: '/bottles?expired=true'
    },
    {
      label: 'Locations',
      value: stats?.totalLocations || 0,
      icon: MapPin,
      color: 'bg-purple-500',
      link: '/locations'
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Chemical inventory overview</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/chemicals/add"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={20} />
            Add Chemical
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, link }) => (
          <Link
            key={label}
            to={link}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
              </div>
              <div className={`${color} p-3 rounded-lg text-white`}>
                <Icon size={24} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expired Bottles Alert */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              <AlertTriangle className="inline mr-2 text-red-500" size={20} />
              Expired Chemicals
            </h2>
            {expiredBottles.length > 0 && (
              <Link
                to="/bottles?expired=true"
                className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1"
              >
                View all <ArrowRight size={16} />
              </Link>
            )}
          </div>

          {expiredBottles.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No expired chemicals. Great job keeping inventory up to date!
            </p>
          ) : (
            <div className="space-y-3">
              {expiredBottles.map((bottle) => (
                <div
                  key={bottle.id}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <NFPADiamond
                      health={bottle.chemical?.nfpaHealth}
                      fire={bottle.chemical?.nfpaFire}
                      reactivity={bottle.chemical?.nfpaReactivity}
                      special={bottle.chemical?.nfpaSpecial}
                      size="sm"
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        {bottle.chemical?.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {bottle.bottleId} • Expired{' '}
                        {bottle.expirationDate
                          ? new Date(bottle.expirationDate).toLocaleDateString()
                          : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <span className="text-red-600 text-sm font-medium">
                    {bottle.location?.name || 'No location'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* NFPA Legend */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            NFPA 704 Diamond Legend
          </h2>
          <div className="flex gap-8">
            <NFPADiamond health={2} fire={3} reactivity={1} special="W" size="lg" />
            <div className="flex-1 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-600 rounded"></div>
                <span><strong>Blue (Health):</strong> 0=Normal - 4=Deadly</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-600 rounded"></div>
                <span><strong>Red (Fire):</strong> 0=Won't burn - 4=Extremely flammable</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                <span><strong>Yellow (Reactivity):</strong> 0=Stable - 4=May detonate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-white border rounded"></div>
                <span><strong>White (Special):</strong> OX=Oxidizer, W=Water reactive, SA=Simple asphyxiant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
