import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Package, Tag, Layers, Info, Check, Image as ImageIcon, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  productService, 
  categoryService, 
  brandService, 
  packageService 
} from '../services/firebaseService';
import { Product, Category, Brand, Package as PackageType } from '../types';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [pkg, setPkg] = useState<PackageType | null>(null);
  
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const prod = await productService.getById(id);
        if (prod) {
          setProduct(prod);
          
          // Load related data
          const [cat, brd, pk] = await Promise.all([
            prod.categoryId ? categoryService.getById(prod.categoryId) : null,
            prod.brandId ? brandService.getById(prod.brandId) : null,
            prod.packageId ? packageService.getById(prod.packageId) : null,
          ]);
          
          setCategory(cat as Category | null);
          setBrand(brd as Brand | null);
          setPkg(pk as PackageType | null);
        }
      } catch (error) {
        console.error("Error loading product details:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center bg-slate-50 p-6">
        <Box className="w-20 h-20 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">المنتج غير موجود</h2>
        <p className="text-slate-500 mb-6">عذراً، لم نتمكن من العثور على المنتج المطلوب.</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold mt-4 shadow-lg shadow-emerald-200"
        >
          العودة للرئيسية
        </button>
      </div>
    );
  }

  const currentVariant = product.variants[selectedVariantIndex] || product.variants[0];

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-8 overflow-x-auto pb-2">
          <Link to="/" className="hover:text-emerald-600 transition-colors shrink-0">الرئيسية</Link>
          <ChevronRight className="w-4 h-4 shrink-0" />
          <span className="shrink-0">{category?.name || 'تصنيف غير محدد'}</span>
          <ChevronRight className="w-4 h-4 shrink-0" />
          <span className="text-slate-800 font-bold shrink-0 truncate">{product.name}</span>
        </nav>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 sm:p-10 border border-slate-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            
            {/* Right Side / Image Area (Actually Left in LTR layout, but rendered correctly in RTL) */}
            <div className="space-y-6">
              <div className="aspect-[4/5] sm:aspect-square bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden flex items-center justify-center relative p-8 shadow-inner">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-contain filter drop-shadow-xl hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="text-slate-300 flex flex-col items-center">
                    <ImageIcon className="w-24 h-24 mb-4" />
                    <span className="text-xl font-bold">لا توجد صورة</span>
                  </div>
                )}
                
                {/* Category Badge Floating on Image */}
                {category?.name && (
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-bold text-emerald-700 shadow-sm border border-emerald-50">
                    {category.name}
                  </div>
                )}
              </div>
              
              {/* Product Thumbnails (Mocked since we only have one image) */}
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${i === 1 ? 'border-emerald-500 shadow-md' : 'border-slate-100 opacity-60 hover:opacity-100'}`}>
                    {product.image ? (
                      <img src={product.image} alt="Thumbnail" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-slate-300" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Left Side / Details Area */}
            <div className="flex flex-col">
              {/* Title & Specs */}
              <div className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-black text-slate-800 mb-4 leading-tight">
                  {product.name}
                </h1>
                
                <div className="flex flex-wrap gap-4 text-sm font-bold text-slate-600 mb-6 border-b border-slate-100 pb-6">
                  {brand?.name && (
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <Tag className="w-4 h-4 text-slate-400" />
                      {brand.name}
                    </div>
                  )}
                  {pkg?.name && (
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <Package className="w-4 h-4 text-slate-400" />
                      {pkg.name}
                    </div>
                  )}
                </div>

                {product.variants.length > 0 && (
                  <div className="mb-10">
                    <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-600" />
                      اختر الحجم أو الوزن:
                    </label>
                    <div className="relative">
                      <select
                        value={selectedVariantIndex}
                        onChange={(e) => setSelectedVariantIndex(Number(e.target.value))}
                        className="w-full sm:w-2/3 appearance-none bg-slate-50 border-2 border-slate-200 text-slate-800 py-3.5 px-4 rounded-xl font-bold focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 cursor-pointer transition-all"
                      >
                        {product.variants.map((v, idx) => (
                          <option key={idx} value={idx}>{v.sizeName}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-4 text-slate-500">
                        <ChevronRight className="w-5 h-5 -rotate-90" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500"></div>
                  <h3 className="text-emerald-700 font-bold mb-2 text-sm flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    سعر الوكيل
                  </h3>
                  <div className="text-2xl font-black text-emerald-900 drop-shadow-sm">
                    {currentVariant?.agentPrice?.toLocaleString() || '0'} <span className="text-xs font-bold text-emerald-600 ml-1">ر.ي</span>
                  </div>
                </div>

                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="absolute top-0 right-0 w-1 h-full bg-blue-500"></div>
                  <h3 className="text-blue-700 font-bold mb-2 text-sm flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    سعر الجملة
                  </h3>
                  <div className="text-2xl font-black text-blue-900 drop-shadow-sm">
                    {currentVariant?.wholesalePrice?.toLocaleString() || '0'} <span className="text-xs font-bold text-blue-600 ml-1">ر.ي</span>
                  </div>
                </div>

                <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-5 relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="absolute top-0 right-0 w-1 h-full bg-rose-500"></div>
                  <h3 className="text-rose-700 font-bold mb-2 text-sm flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    سعر التجزئة
                  </h3>
                  <div className="text-2xl font-black text-rose-900 drop-shadow-sm">
                    {currentVariant?.retailPrice?.toLocaleString() || '0'} <span className="text-xs font-bold text-rose-600 ml-1">ر.ي</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-slate-100">
                <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-slate-400" />
                  وصف المنتج
                </h3>
                {product.description ? (
                  <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">
                    {product.description}
                  </p>
                ) : (
                  <p className="text-slate-400 italic text-sm">
                    لا يوجد تفاصيل إضافية لهذا المنتج حالياً.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
