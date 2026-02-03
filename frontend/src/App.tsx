import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import {
  FlaskConical,
  Package,
  MapPin,
  LayoutDashboard,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Chemicals from './pages/Chemicals';
import ChemicalDetail from './pages/ChemicalDetail';
import AddChemical from './pages/AddChemical';
import Bottles from './pages/Bottles';
import AddBottle from './pages/AddBottle';
import Locations from './pages/Locations';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navLinks = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/chemicals', icon: FlaskConical, label: 'Chemicals' },
    { to: '/bottles', icon: Package, label: 'Inventory' },
    { to: '/locations', icon: MapPin, label: 'Locations' },
  ];

  return (
    <BrowserRouter>
      <div className="min-h-screen flex">
        {/* Mobile menu button */}
        <button
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-indigo-600 text-white rounded-lg"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-indigo-900 text-white
          transform transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <FlaskConical size={32} className="text-indigo-300" />
              <div>
                <h1 className="text-xl font-bold">ChemManagement</h1>
                <p className="text-xs text-indigo-300">Inventory System</p>
              </div>
            </div>

            <nav className="space-y-2">
              {navLinks.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${isActive
                      ? 'bg-indigo-700 text-white'
                      : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'}
                  `}
                >
                  <Icon size={20} />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:ml-0 p-4 lg:p-8 pt-16 lg:pt-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chemicals" element={<Chemicals />} />
            <Route path="/chemicals/add" element={<AddChemical />} />
            <Route path="/chemicals/:id" element={<ChemicalDetail />} />
            <Route path="/bottles" element={<Bottles />} />
            <Route path="/bottles/add" element={<AddBottle />} />
            <Route path="/bottles/add/:chemicalId" element={<AddBottle />} />
            <Route path="/locations" element={<Locations />} />
          </Routes>
        </main>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
