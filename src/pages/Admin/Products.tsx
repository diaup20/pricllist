import React, { useEffect, useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  productService, 
  categoryService, 
  brandService, 
  unitService, 
  packageService 
} from '../../services/firebaseService';
import { 
  Product, 
  Category, 
  Brand, 
  Unit, 
  Package, 
  ProductInput 
} from '../../types';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ArrowRight, 
  Image as ImageIcon,
  X,
  Download,
  Upload
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<ProductInput>({
    name: '',
    categoryId: '',
    brandId: '',
    unitId: '',
    packageId: '',
    variants: [{ sizeName: '', agentPrice: 0, wholesalePrice: 0, retailPrice: 0 }],
    image: '',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [prods, cats, brnds, unts, pkgs] = await Promise.all([
      productService.getAll(),
      categoryService.getAll(),
      brandService.getAll(),
      unitService.getAll(),
      packageService.getAll()
    ]);
    
    // Bridge old data to new structure
    const processedProds = prods.map(p => ({
      ...p,
      variants: p.variants || [
        { 
          sizeName: 'افتراضي', 
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
  };

  const [importing, setImporting] = useState(false);

  const handleExport = () => {
    const exportData: any[] = [];
    products.forEach(p => {
      const categoryName = categories.find(c => c.id === p.categoryId)?.name || '';
      const brandName = brands.find(b => b.id === p.brandId)?.name || '';
      const unitName = units.find(u => u.id === p.unitId)?.name || '';
      const packageName = packages.find(pkg => pkg.id === p.packageId)?.name || '';

      if (!p.variants || p.variants.length === 0) {
        exportData.push({
          "اسم المنتج": p.name,
          "القسم": categoryName,
          "العلامة التجارية": brandName,
          "الوحدة": unitName,
          "العبوة": packageName,
          "الحجم": '',
          "سعر الوكيل": 0,
          "سعر الجملة": 0,
          "سعر التجزئة": 0,
          "رابط الصورة": p.image || '',
          "الوصف": p.description || ''
        });
      } else {
        p.variants.forEach(v => {
          exportData.push({
            "اسم المنتج": p.name,
            "القسم": categoryName,
            "العلامة التجارية": brandName,
            "الوحدة": unitName,
            "العبوة": packageName,
            "الحجم": v.sizeName,
            "سعر الوكيل": v.agentPrice,
            "سعر الجملة": v.wholesalePrice,
            "سعر التجزئة": v.retailPrice,
            "رابط الصورة": p.image || '',
            "الوصف": p.description || ''
          });
        });
      }
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "المنتجات");
    XLSX.writeFile(workbook, "products.xlsx");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet) as any[];

        let currentCats = [...categories];
        let currentBrands = [...brands];
        let currentUnits = [...units];
        let currentPackages = [...packages];

        const getOrCreate = async (name: string | undefined, arr: any[], service: any) => {
          if (!name || String(name).trim() === '') return '';
          const trimmedName = String(name).trim();
          const existing = arr.find(item => item.name === trimmedName);
          if (existing) return existing.id;
          const newId = await service.add(trimmedName);
          arr.push({ id: newId, name: trimmedName });
          return newId;
        };

        const productsMap = new Map<string, ProductInput>();

        for (const row of rows) {
          const name = row["اسم المنتج"];
          if (!name || String(name).trim() === '') continue;
          
          const trimmedName = String(name).trim();

          const categoryId = await getOrCreate(row["القسم"], currentCats, categoryService);
          const brandId = await getOrCreate(row["العلامة التجارية"], currentBrands, brandService);
          const unitId = await getOrCreate(row["الوحدة"], currentUnits, unitService);
          const packageId = await getOrCreate(row["العبوة"], currentPackages, packageService);

          const variant = {
            sizeName: row["الحجم"] ? String(row["الحجم"]) : 'افتراضي',
            agentPrice: Number(row["سعر الوكيل"]) || 0,
            wholesalePrice: Number(row["سعر الجملة"]) || 0,
            retailPrice: Number(row["سعر التجزئة"]) || 0,
          };

          if (productsMap.has(trimmedName)) {
            productsMap.get(trimmedName)!.variants.push(variant);
          } else {
            productsMap.set(trimmedName, {
              name: trimmedName,
              categoryId,
              brandId,
              unitId,
              packageId,
              image: row["رابط الصورة"] || '',
              description: row["الوصف"] || '',
              variants: [variant]
            });
          }
        }

        const newProducts = Array.from(productsMap.values());
        if (newProducts.length > 0) {
          await productService.bulkAdd(newProducts);
          await loadData(); // Reload UI data right away from DB
          alert(`تم استيراد ${newProducts.length} منتج بنجاح.`);
        } else {
          alert('الملف لا يحتوي على منتجات صالحة.');
        }
      } catch (error) {
         console.error(error);
         alert('فشل استيراد البيانات من ملف اكسل.');
      } finally {
         setImporting(false);
      }
    };
    reader.readAsArrayBuffer(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { sizeName: '', agentPrice: 0, wholesalePrice: 0, retailPrice: 0 }]
    });
  };

  const removeVariant = (index: number) => {
    const newVariants = [...formData.variants];
    newVariants.splice(index, 1);
    setFormData({ ...formData, variants: newVariants });
  };

  const updateVariant = (index: number, field: string, value: any) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productService.update(editingProduct.id, formData);
      } else {
        await productService.add(formData);
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        categoryId: '',
        brandId: '',
        unitId: '',
        packageId: '',
        variants: [{ sizeName: '', agentPrice: 0, wholesalePrice: 0, retailPrice: 0 }],
        image: '',
        description: ''
      });
      loadData();
    } catch (error: any) {
       console.error("Save error", error);
       alert("فشل حفظ المنتج. يرجى التأكد من ملء الحقول المطلوبة وتسجيل الدخول.");
    }
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      categoryId: product.categoryId,
      brandId: product.brandId,
      unitId: product.unitId,
      packageId: product.packageId,
      variants: product.variants || [{ sizeName: '', agentPrice: 0, wholesalePrice: 0, retailPrice: 0 }],
      image: product.image,
      description: product.description
    });
    setIsModalOpen(true);
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brands.find(b => b.id === p.brandId)?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await productService.delete(deletingId);
      setDeletingId(null);
      loadData();
    } catch (error: any) {
      console.error("Delete error", error);
      alert("فشل حذف المنتج. قد يكون لديك جلسة منتهية الصلاحية.");
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowRight className="w-5 h-5 text-slate-500" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">إدارة المنتجات</h1>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={handleExport}
            title="تصدير المنتجات"
            className="flex-1 sm:flex-none flex items-center justify-center p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl border border-slate-200 transition-all shadow-sm gap-2"
          >
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline font-bold text-sm ml-2">تصدير</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            title="استيراد المنتجات"
            disabled={importing}
            className="flex-1 sm:flex-none flex items-center justify-center p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl border border-slate-200 transition-all shadow-sm gap-2"
          >
            {importing ? (
               <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
               <Upload className="w-5 h-5" />
            )}
            <span className="hidden sm:inline font-bold text-sm ml-2">استيراد</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex flex-col md:flex-row gap-4 justify-between items-center">
           <div className="relative w-full md:w-96">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="بحث عن منتج أو علامة تجارية..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
              />
           </div>
           <button 
             onClick={() => {
               setEditingProduct(null);
               setFormData({
                 name: '',
                 categoryId: '',
                 brandId: '',
                 unitId: '',
                 packageId: '',
                 variants: [{ sizeName: '', agentPrice: 0, wholesalePrice: 0, retailPrice: 0 }],
                 image: '',
                 description: ''
               });
               setIsModalOpen(true);
             }}
             className="w-full md:w-auto bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
           >
             <Plus className="w-5 h-5" />
             إضافة منتج جديد
           </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm font-medium">
                <th className="p-4">المنتج</th>
                <th className="p-4">القسم</th>
                <th className="p-4">عدد الأحجام</th>
                <th className="p-4">متوسط السعر (تجزئة)</th>
                <th className="p-4 text-center">عمليات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400 italic">
                    لا توجد منتجات متاحة
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-slate-300" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{product.name}</p>
                          <p className="text-xs text-slate-500">{brands.find(b => b.id === product.brandId)?.name || 'غير محدد'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm bg-slate-100 px-2 py-1 rounded text-slate-600">
                        {categories.find(c => c.id === product.categoryId)?.name || '-'}
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold text-slate-600">
                      {product.variants?.length || 0}
                    </td>
                    <td className="p-4 font-mono font-medium text-amber-600">
                      {product.variants?.[0]?.retailPrice || 0} {product.variants && product.variants.length > 1 && '+'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => startEdit(product)}
                          className="p-2 text-slate-400 hover:text-blue-600 transition-colors bg-white border border-slate-100 rounded-lg shadow-sm"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeletingId(product.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 transition-colors bg-white border border-slate-100 rounded-lg shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl p-4 sm:p-6 shadow-2xl max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold">{editingProduct ? 'تعديل منتج' : 'إضافة منتج جديد'}</h3>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingProduct(null);
                }} 
                className="p-1 sm:p-2 hover:bg-slate-100 rounded-full"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="col-span-full">
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">اسم المنتج</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-3 py-2 sm:px-4 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">القسم</label>
                  <select 
                    required
                    className="w-full px-3 py-2 sm:px-4 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-sm"
                    value={formData.categoryId}
                    onChange={e => setFormData({...formData, categoryId: e.target.value})}
                  >
                    <option value="">اختر القسم...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">العلامة التجارية</label>
                  <select 
                    required
                    className="w-full px-3 py-2 sm:px-4 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-sm"
                    value={formData.brandId}
                    onChange={e => setFormData({...formData, brandId: e.target.value})}
                  >
                    <option value="">اختر العلامة...</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">الوحدة</label>
                  <select 
                    className="w-full px-3 py-2 sm:px-4 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-sm"
                    value={formData.unitId}
                    onChange={e => setFormData({...formData, unitId: e.target.value})}
                  >
                    <option value="">اختر الوحدة...</option>
                    {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">العبوة الافتراضية</label>
                  <select 
                    className="w-full px-3 py-2 sm:px-4 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-sm"
                    value={formData.packageId}
                    onChange={e => setFormData({...formData, packageId: e.target.value})}
                  >
                    <option value="">اختر العبوة...</option>
                    {packages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div className="col-span-full">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                    <h4 className="font-bold text-slate-800 text-sm">أحجام وأسعار المنتج (ريال يمني)</h4>
                    <button 
                      type="button"
                      onClick={addVariant}
                      className="text-emerald-600 hover:text-emerald-700 text-xs sm:text-sm font-bold flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg"
                    >
                      <Plus className="w-4 h-4" />
                      إضافة حجم
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {formData.variants.map((variant, index) => (
                      <div key={index} className="p-3 sm:p-4 border border-slate-100 bg-slate-50/50 rounded-2xl relative group">
                        {formData.variants.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => removeVariant(index)}
                            className="absolute -left-2 -top-2 w-7 h-7 bg-white border border-rose-100 text-rose-500 rounded-full flex items-center justify-center sm:opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-rose-50 z-10"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                          <div className="col-span-2 lg:col-span-1">
                            <label className="block text-[10px] sm:text-xs font-bold text-slate-500 mb-1">الحجم</label>
                            <input 
                              required
                              type="text"
                              placeholder="50 كجم"
                              className="w-full px-3 py-1.5 sm:py-2 border border-slate-200 rounded-lg outline-none text-sm bg-white"
                              value={variant.sizeName}
                              onChange={e => updateVariant(index, 'sizeName', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] sm:text-xs font-bold text-slate-500 mb-1">الوكيل</label>
                            <input 
                              required
                              type="number"
                              className="w-full px-3 py-1.5 sm:py-2 border border-slate-200 rounded-lg outline-none text-sm bg-white"
                              value={variant.agentPrice}
                              onChange={e => updateVariant(index, 'agentPrice', Number(e.target.value))}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] sm:text-xs font-bold text-slate-500 mb-1">الجملة</label>
                            <input 
                              required
                              type="number"
                              className="w-full px-3 py-1.5 sm:py-2 border border-slate-200 rounded-lg outline-none text-sm bg-white"
                              value={variant.wholesalePrice}
                              onChange={e => updateVariant(index, 'wholesalePrice', Number(e.target.value))}
                            />
                          </div>
                          <div className="col-span-2 lg:col-span-1">
                            <label className="block text-[10px] sm:text-xs font-bold text-slate-500 mb-1">التجزئة</label>
                            <input 
                              required
                              type="number"
                              className="w-full px-3 py-1.5 sm:py-2 border border-slate-200 rounded-lg outline-none text-sm bg-white border-emerald-200 focus:ring-emerald-500"
                              value={variant.retailPrice}
                              onChange={e => updateVariant(index, 'retailPrice', Number(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 col-span-full">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">صورة المنتج</label>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {formData.image ? (
                        <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl border border-slate-200 overflow-hidden shrink-0 group">
                          <img src={formData.image} alt="Product" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => setFormData({...formData, image: ''})}
                            className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-6 h-6" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 shrink-0 bg-slate-50">
                          <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                          <span className="text-[10px] sm:text-xs font-medium">لا توجد صورة</span>
                        </div>
                      )}
                      
                      <div className="flex-1 w-full space-y-2">
                        <label className="flex items-center justify-center gap-2 w-full px-4 py-2.5 sm:py-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl cursor-pointer transition-colors font-bold text-sm border border-emerald-100">
                          <Upload className="w-4 h-4" />
                          رفع صورة جديدة
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const img = new Image();
                                img.onload = () => {
                                  const canvas = document.createElement('canvas');
                                  const MAX_WIDTH = 800;
                                  const MAX_HEIGHT = 800;
                                  let width = img.width;
                                  let height = img.height;
                                  
                                  if (width > height) {
                                    if (width > MAX_WIDTH) {
                                      height *= MAX_WIDTH / width;
                                      width = MAX_WIDTH;
                                    }
                                  } else {
                                    if (height > MAX_HEIGHT) {
                                      width *= MAX_HEIGHT / height;
                                      height = MAX_HEIGHT;
                                    }
                                  }
                                  
                                  canvas.width = width;
                                  canvas.height = height;
                                  const ctx = canvas.getContext('2d');
                                  ctx?.drawImage(img, 0, 0, width, height);
                                  
                                  // Compress to JPEG with 0.8 quality
                                  const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                                  setFormData({...formData, image: dataUrl});
                                };
                                img.src = event.target?.result as string;
                              };
                              reader.readAsDataURL(file);
                              e.target.value = ''; // Reset input
                            }}
                          />
                        </label>
                        <p className="text-[10px] sm:text-xs text-slate-500 text-center sm:text-right">
                          يتم تصغير حجم وتنسيق الصورة تلقائياً لضمان سرعة تحميل التطبيق وتوفير المساحة.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">الوصف الكامل للمنتج</label>
                    <textarea 
                      rows={3}
                      placeholder="أضف تفاصيل المنتج هنا..."
                      className="w-full px-3 py-2 sm:px-4 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4 sm:pt-6 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto px-6 py-2.5 text-slate-600 bg-slate-50 sm:bg-transparent hover:bg-slate-100 rounded-xl transition-colors font-bold text-sm"
                >
                  إلغاء
                </button>
                <button 
                  type="submit"
                  className="w-full sm:w-auto px-6 sm:px-10 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-bold shadow-lg shadow-emerald-100 text-sm"
                >
                  حفظ المنتج والتغييرات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-slate-800">تأكيد الحذف</h3>
            <p className="text-slate-500 mb-8 text-sm">
              هل أنت متأكد من رغبتك في حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء وسيتم حذف جميع البيانات المتعلقة به.
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm font-bold">
              <button 
                onClick={() => setDeletingId(null)}
                className="px-4 py-3.5 text-slate-600 bg-slate-100 rounded-2xl transition-colors"
              >
                إلغاء
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-3.5 bg-rose-600 text-white rounded-2xl hover:bg-rose-700 transition-colors shadow-lg shadow-rose-100"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
