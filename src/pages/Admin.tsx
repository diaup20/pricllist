import { useEffect, useState } from 'react';
import { 
  Package, 
  Layers, 
  Building2, 
  Scaling, 
  Plus, 
  ChevronRight,
  TrendingUp,
  Search,
  LogIn,
  LogOut,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  productService, 
  categoryService, 
  brandService, 
  unitService,
  packageService
} from '../services/firebaseService';
import { useAuth } from '../context/AuthContext';
import { loginWithGoogle, auth } from '../lib/firebase';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [counts, setCounts] = useState({
    products: 0,
    categories: 0,
    brands: 0,
    units: 0,
    packages: 0
  });

  useEffect(() => {
    if (!user) return;
    const loadCounts = async () => {
      try {
        const [prods, cats, brnds, unts, pkgs] = await Promise.all([
          productService.getAll(),
          categoryService.getAll(),
          brandService.getAll(),
          unitService.getAll(),
          packageService.getAll()
        ]);
        setCounts({
          products: prods.length,
          categories: cats.length,
          brands: brnds.length,
          units: unts.length,
          packages: pkgs.length
        });
      } catch (e) {
        console.error("Error loading counts", e);
      }
    };
    loadCounts();
  }, [user]);

  if (loading) return <div className="p-20 text-center font-bold text-emerald-600">جاري التحميل...</div>;

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 text-emerald-600">
           <LogIn className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">تسجيل الدخول للمسؤول</h1>
        <p className="text-slate-500 mb-8 max-w-sm">يجب تسجيل الدخول باستخدام حساب Google المعتمد للتمكن من إدارة النظام وتعديل الأسعار.</p>
        <button 
          onClick={() => loginWithGoogle()}
          className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center gap-2"
        >
          <LogIn className="w-5 h-5" />
          تسجيل الدخول عبر Google
        </button>
      </div>
    );
  }

  const stats = [
    { label: 'إجمالي المنتجات', value: counts.products, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'الأقسام', value: counts.categories, icon: Layers, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'العلامات التجارية', value: counts.brands, icon: Building2, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'العبوات', value: counts.packages, icon: Scaling, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 sm:mb-12">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-emerald-900">لوحة الإدارة</h1>
            <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">مُفعل</span>
          </div>
          <p className="text-sm sm:text-base text-emerald-600/70 font-medium">مرحباً بك، يمكنك إدارة الأصناف والأسعار من هنا.</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-700 transition-colors ml-2 sm:ml-4 font-bold"
            title="العودة للصفحة الرئيسية"
          >
             الرئيسية
          </Link>
          <Link to="/admin/products" className="flex-1 md:flex-none justify-center bg-yellow-400 hover:bg-yellow-300 text-emerald-900 px-6 sm:px-8 py-3 rounded-xl sm:rounded-2xl font-bold transition-all shadow-lg hover:shadow-yellow-200/50 flex items-center gap-2 sm:gap-3 text-sm md:text-base">
            <Plus className="w-5 h-5 md:w-6 md:h-6" />
            إضافة صنف
          </Link>
          <button 
            onClick={() => auth.signOut()}
            className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl sm:rounded-2xl transition-all border border-slate-100 md:border-transparent"
            title="تسجيل الخروج"
          >
            <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 mb-8 sm:mb-12">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-emerald-50 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-1 sm:w-2 h-full ${stat.bg.replace('bg-', 'bg-')}`}></div>
            <div className={`w-10 h-10 sm:w-14 sm:h-14 ${stat.bg} ${stat.color} rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-6`}>
              <stat.icon className="w-5 h-5 sm:w-7 sm:h-7" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-400 mb-1 line-clamp-1">{stat.label}</p>
            <p className="text-xl sm:text-3xl font-black text-slate-800">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-50 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 text-lg">قوائم الإدارة</h2>
          </div>
          <div className="divide-y divide-slate-50">
            <AdminMenuLink to="/admin/products" icon={Package} label="إدارة المنتجات" count={counts.products.toString()} />
            <AdminMenuLink to="/admin/categories" icon={Layers} label="إدارة الأقسام" count={counts.categories.toString()} />
            <AdminMenuLink to="/admin/brands" icon={Building2} label="إدارة العلامات" count={counts.brands.toString()} />
            <AdminMenuLink to="/admin/packages" icon={Plus} label="إدارة العبوات" count={counts.packages.toString()} />
            <AdminMenuLink to="/admin/units" icon={Scaling} label="إدارة الوحدات" count={counts.units.toString()} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-bold text-slate-800 text-lg mb-4">نشاط النظام</h2>
          <div className="space-y-4">
            <p className="text-slate-400 text-center py-10 italic">لا يوجد نشاط مؤخراً</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminMenuLink({ to, icon: Icon, label, count }: { to: string, icon: any, label: string, count: string }) {
  return (
    <Link to={to} className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>
        <span className="font-medium text-slate-700">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">{count}</span>
        <ChevronRight className="w-4 h-4 text-slate-300 transform rotate-180" />
      </div>
    </Link>
  );
}
