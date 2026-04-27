import React, { useState, useRef } from 'react';
import { Plus, Trash2, Edit2, Search, ArrowRight, Download, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Item {
  id: string;
  name: string;
}

interface GenericManagerProps {
  title: string;
  items: Item[];
  onAdd: (name: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, name: string) => void;
  onImport?: (names: string[]) => void;
}

export default function GenericManager({ title, items, onAdd, onDelete, onEdit, onImport }: GenericManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredItems = items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleAdd = () => {
    if (!newItemName.trim()) return;
    onAdd(newItemName.trim());
    setNewItemName('');
    setIsOpen(false);
  };

  const handleEdit = (id: string, name: string) => {
    onEdit(id, name);
    setEditingId(null);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await onDelete(deletingId);
      setDeletingId(null);
    } catch (e: any) {
      console.error("Delete error in manager", e);
    }
  };

  const handleExport = () => {
    const data = items.map(item => item.name);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json) && onImport) {
          onImport(json);
        } else {
          alert('تنسيق الملف غير صحيح. يجب أن يكون مصفوفة من الأسماء.');
        }
      } catch (error) {
        alert('فشل قراءة الملف.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowRight className="w-5 h-5 text-slate-500" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">{title}</h1>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={handleExport}
            title="تصدير البيانات"
            className="flex-1 sm:flex-none flex justify-center p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
          >
            <Download className="w-5 h-5" />
          </button>
          {onImport && (
            <>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImport} 
                accept=".json" 
                className="hidden" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                title="استيراد البيانات"
                className="flex-1 sm:flex-none flex justify-center p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
              >
                <Upload className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex flex-col md:flex-row gap-4 justify-between items-center text-slate-500">
           <div className="relative w-full md:w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="بحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
              />
           </div>
           <button 
             onClick={() => setIsOpen(true)}
             className="w-full md:w-auto bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
           >
             <Plus className="w-4 h-4" />
             إضافة جديد
           </button>
        </div>

        <div className="divide-y divide-slate-50">
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center text-slate-400 italic">
              لا توجد بيانات متاحة
            </div>
          ) : (
            filteredItems.map(item => (
              <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                {editingId === item.id ? (
                  <input 
                    autoFocus
                    className="flex-1 bg-white border border-emerald-300 px-2 py-1 rounded outline-none"
                    defaultValue={item.name}
                    onBlur={(e) => handleEdit(item.id, e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleEdit(item.id, (e.target as HTMLInputElement).value)}
                  />
                ) : (
                  <span className="font-medium text-slate-700">{item.name}</span>
                )}
                
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setEditingId(item.id)}
                    className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setDeletingId(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-slate-800">إضافة {title} جديد</h3>
            <input 
              autoFocus
              type="text" 
              placeholder="الاسم..."
              className="w-full px-4 py-2 border border-slate-200 rounded-lg mb-6 outline-none focus:ring-2 focus:ring-emerald-500"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <div className="flex gap-3 justify-end text-sm font-bold">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button 
                onClick={handleAdd}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl text-center">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-800">تأكيد الحذف</h3>
            <p className="text-slate-500 mb-8 text-sm">
              هل أنت متأكد من رغبتك في حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm font-bold">
              <button 
                onClick={() => setDeletingId(null)}
                className="px-4 py-3 text-slate-600 bg-slate-100 rounded-xl transition-colors"
              >
                إلغاء
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors"
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
