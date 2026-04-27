import { useEffect, useState } from 'react';
import { categoryService } from '../../services/firebaseService';
import { Category } from '../../types';
import GenericManager from '../../components/Admin/GenericManager';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const data = await categoryService.getAll();
    setCategories(data);
  };

  const handleAdd = async (name: string) => {
    try {
      await categoryService.add(name);
      loadCategories();
    } catch (e: any) {
      alert("فشل الإضافة: تأكد من تسجيل دخولك كمسؤول وصحة البيانات.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await categoryService.delete(id);
      loadCategories();
    } catch (e) {
      alert("فشل الحذف: قد يكون هذا القسم مرتبط بمنتجات موجودة.");
    }
  };

  const handleEdit = (id: string, name: string) => {
    try {
      categoryService.update(id, name);
      loadCategories();
    } catch (e) {
      alert("فشل التعديل.");
    }
  };

  const handleImport = async (names: string[]) => {
    try {
      await categoryService.bulkAdd(names);
      loadCategories();
    } catch (e) {
      alert("فشل استيراد البيانات.");
    }
  };

  return (
    <GenericManager 
      title="الأقسام الرئيسية"
      items={categories}
      onAdd={handleAdd}
      onDelete={handleDelete}
      onEdit={handleEdit}
      onImport={handleImport}
    />
  );
}
