import { useEffect, useState } from 'react';
import { brandService } from '../../services/firebaseService';
import { Brand } from '../../types';
import GenericManager from '../../components/Admin/GenericManager';

export default function AdminBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    const data = await brandService.getAll();
    setBrands(data);
  };

  const handleAdd = async (name: string) => {
    try {
      await brandService.add(name);
      loadBrands();
    } catch (e) {
      alert("فشل الإضافة: يرجى تسجيل الدخول.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await brandService.delete(id);
      loadBrands();
    } catch (e) {
      alert("فشل الحذف.");
    }
  };

  const handleEdit = async (id: string, name: string) => {
    try {
      await brandService.update(id, name);
      loadBrands();
    } catch (e) {
      alert("فشل التعديل.");
    }
  };

  const handleImport = async (names: string[]) => {
    try {
      await brandService.bulkAdd(names);
      loadBrands();
    } catch (e) {
      alert("فشل استيراد البيانات.");
    }
  };

  return (
    <GenericManager 
      title="إدارة العلامات التجارية"
      items={brands}
      onAdd={handleAdd}
      onDelete={handleDelete}
      onEdit={handleEdit}
      onImport={handleImport}
    />
  );
}
