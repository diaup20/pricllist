import { useState, useEffect } from 'react';
import { Search, Filter, Package, Tag, Layers, TrendingUp, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  productService, 
  categoryService, 
  brandService, 
  unitService, 
  packageService 
} from '../services/firebaseService';
import { Product, Category, Brand, Unit, Package as PackageType } from '../types';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [packages, setPackages] = useState<PackageType[]>([]);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [prods, cats, brnds, unts, pkgs] = await Promise.all([
      productService.getAll(),
      categoryService.getAll(),
      brandService.getAll(),
      unitService.getAll(),
      packageService.getAll()
    ]);
    
    // Bridge old data to new structure for backward compatibility
    const processedProds = prods.map(p => ({
      ...p,
      variants: p.variants || [
        { 
          sizeName: 'السعر الحالي', 
          agentPrice: (p as any).agentPrice || 0, 
          wholesalePrice: (p as any).wholesalePrice || 0, 
          retailPrice: (p as any).retailPrice || 0 
        }
      ]
    }));

    setProducts(processedProds);
    setCategories(cats);
    setBrands(brnds);
    setUnits(unts);
    setPackages(pkgs);
    setLoading(false);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          brands.find(b => b.id === product.brandId)?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
    const matchesBrand = !selectedBrand || product.brandId === selectedBrand;
    const matchesUnit = !selectedUnit || product.unitId === selectedUnit;
    const matchesPackage = !selectedPackage || product.packageId === selectedPackage;
    
    return matchesSearch && matchesCategory && matchesBrand && matchesUnit && matchesPackage;
  });

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col md:flex-row bg-slate-50/50">
      {/* Mobile Header & Filter Toggle */}
      <div className="md:hidden p-4 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex bg-slate-50 px-4 py-2 rounded-xl flex-1 ml-4 focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
          <Search className="text-slate-400 w-4 h-4 ml-2 my-auto" />
          <input 
            type="text" 
            placeholder="ابحث بالنص..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full outline-none bg-transparent text-sm font-medium"
          />
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            showFilters || selectedCategory || selectedBrand || selectedUnit || selectedPackage
            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' 
            : 'bg-emerald-50 text-emerald-700'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">تصفية</span>
          {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Sidebar Filters */}
      <aside className={`w-full md:w-72 bg-white md:border-l border-slate-100 p-6 flex flex-col gap-6 shadow-xl md:shadow-[20px_0_40px_rgba(0,0,0,0.02)] md:relative md:z-10 md:overflow-y-auto md:max-h-screen md:sticky md:top-0 ${showFilters ? 'block' : 'hidden md:flex'}`}>
        <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4 hidden md:block">تصفية البحث</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">القسم الرئيسي</label>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border-0 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
            >
              <option value="">جميع الأقسام</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">العلامة التجارية</label>
            <select 
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full bg-slate-50 border-0 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
            >
              <option value="">جميع العلامات</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">الوحدة</label>
            <select 
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full bg-slate-50 border-0 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
            >
              <option value="">جميع الوحدات</option>
              {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">نوع العبوة</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setSelectedPackage('')}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${!selectedPackage ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-emerald-100'}`}
              >
                الكل
              </button>
              {packages.map(pk => (
                <button 
                  key={pk.id}
                  onClick={() => setSelectedPackage(pk.id)}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${selectedPackage === pk.id ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-emerald-100'}`}
                >
                  {pk.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={() => {
            loadData();
            if (window.innerWidth < 768) setShowFilters(false);
          }}
          className="mt-4 md:mt-auto bg-emerald-600 text-white w-full py-3.5 rounded-xl font-bold text-base shadow-lg shadow-emerald-200/50 hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <TrendingUp className="w-5 h-5" />
          تطبيق وتحديث
        </button>
      </aside>

      {/* Content Area */}
      <section className="flex-1 p-4 md:p-8">
        <div className="hidden md:flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="bg-white px-6 py-3 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 flex items-center gap-4 w-full max-w-md focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
            <Search className="text-emerald-500 w-5 h-5" />
            <input 
              type="text" 
              placeholder="ابحث بالنص أو العلامة..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full outline-none bg-transparent font-medium"
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <span className="bg-white px-4 py-2.5 rounded-xl text-sm font-bold text-slate-500 shadow-sm border border-slate-100">
              النتائج: {filteredProducts.length} صنف
            </span>
          </div>
        </div>

        <div className="md:hidden flex items-center justify-between mb-4 px-1">
           <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-100">
             {filteredProducts.length} صنف
           </span>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
          {loading ? (
             [1,2,3,4,5,6].map(i => (
               <div key={i} className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-md animate-pulse h-60 sm:h-80"></div>
             ))
          ) : (
            <AnimatePresence>
              {filteredProducts.map((product) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={product.id}
                  className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-md border-b-4 sm:border-b-8 border-emerald-500 flex flex-col gap-2 sm:gap-3 relative overflow-hidden group hover:shadow-xl transition-all duration-300"
                >
                  <Link to={`/product/${product.id}`} className="w-full h-24 sm:h-32 bg-slate-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-4xl overflow-hidden group/img">
                    {product.image ? (
                      <img src={product.image} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300" alt={product.name} />
                    ) : (
                      <span className="text-3xl sm:text-4xl">🍲</span>
                    )}
                  </Link>
                  <div className="p-1 flex flex-col flex-1">
                    <div className="mb-2 sm:mb-4">
                      <Link to={`/product/${product.id}`}>
                        <h3 className="text-sm sm:text-xl font-bold text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1 sm:line-clamp-none">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex flex-wrap gap-x-2 gap-y-1 text-[10px] sm:text-xs font-medium text-slate-400">
                        <span>{brands.find(b => b.id === product.brandId)?.name}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:inline">{categories.find(c => c.id === product.categoryId)?.name}</span>
                      </div>
                    </div>

                    {product.description && (
                      <p className="hidden sm:block text-slate-500 text-xs line-clamp-2 mb-4 italic leading-relaxed">
                        {product.description}
                      </p>
                    )}

                    <div className="mt-auto">
                      {product.variants && product.variants.length > 0 ? (
                        <ProductVariantSelector variants={product.variants} />
                      ) : (
                        <div className="text-center py-2 sm:py-4 bg-slate-50 rounded-xl sm:rounded-2xl text-slate-400 text-[10px] sm:text-xs">
                          لا توجد أسعار
                        </div>
                      )}
                    </div>

                    <div className="w-full mt-3 sm:mt-4">
                       <Link 
                         to={`/product/${product.id}`}
                         className="w-full py-2 sm:py-2.5 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 font-bold rounded-lg sm:rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-sm transition-colors"
                       >
                         <span className="hidden sm:inline">عرض التفاصيل الكاملة</span>
                         <span className="sm:hidden text-[10px] font-bold">التفاصيل</span>
                         <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 rtl:rotate-180" />
                       </Link>
                    </div>

                    <div className="mt-3 sm:mt-4 flex items-center justify-between text-[8px] sm:text-[10px] uppercase font-bold tracking-tight text-slate-300 border-t border-slate-50 pt-3 sm:pt-4">
                      <span>تحديث السعر: اليوم</span>
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </section>
    </div>
  );
}

function ProductVariantSelector({ variants }: { variants: Product['variants'] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const active = variants[selectedIndex];

  return (
    <div className="space-y-4">
      <div className="relative">
        <select 
          value={selectedIndex}
          onChange={(e) => setSelectedIndex(Number(e.target.value))}
          className="w-full bg-emerald-50 text-emerald-800 font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-emerald-100 outline-none appearance-none cursor-pointer text-[10px] sm:text-sm"
        >
          {variants.map((v, i) => (
            <option key={i} value={i}>حجم: {v.sizeName}</option>
          ))}
        </select>
        <div className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-400">
          <Layers className="w-3 h-3" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-1.5 sm:gap-2">
        <div className="flex justify-between items-center bg-blue-50/50 p-2 sm:p-2.5 rounded-lg sm:rounded-xl border border-blue-100/50">
          <span className="text-[8px] sm:text-[10px] font-bold text-blue-700">سعر الوكيل</span>
          <span className="text-sm sm:text-base font-black text-blue-900">{active.agentPrice.toLocaleString()} <small className="text-[8px] sm:text-[10px]">ر.ي</small></span>
        </div>
        <div className="flex justify-between items-center bg-orange-50/50 p-2 sm:p-2.5 rounded-lg sm:rounded-xl border border-orange-100/50">
          <span className="text-[8px] sm:text-[10px] font-bold text-orange-700">سعر الجملة</span>
          <span className="text-sm sm:text-base font-black text-orange-900">{active.wholesalePrice.toLocaleString()} <small className="text-[8px] sm:text-[10px]">ر.ي</small></span>
        </div>
        <div className="flex justify-between items-center bg-emerald-100/50 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-emerald-200">
          <span className="text-[8px] sm:text-[10px] font-black text-emerald-800 uppercase tracking-wider">سعر التجزئة</span>
          <span className="text-base sm:text-xl font-black text-emerald-900">{active.retailPrice.toLocaleString()} <small className="text-[8px] sm:text-[10px]">ر.ي</small></span>
        </div>
      </div>
    </div>
  );
}
