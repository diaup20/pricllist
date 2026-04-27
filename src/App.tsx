import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import AdminDashboard from './pages/Admin';
import AdminCategories from './pages/Admin/Categories';
import AdminUnits from './pages/Admin/Units';
import AdminPackages from './pages/Admin/Packages';
import AdminBrands from './pages/Admin/Brands';
import AdminProducts from './pages/Admin/Products';
import AdminGuard from './components/AdminGuard';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

function PublicLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  );
}

function AdminLayout() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Outlet />
    </main>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans">
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetails />} />
          </Route>
          
          <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
            <Route index element={<AdminDashboard />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="units" element={<AdminUnits />} />
            <Route path="packages" element={<AdminPackages />} />
            <Route path="brands" element={<AdminBrands />} />
            <Route path="products" element={<AdminProducts />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}
