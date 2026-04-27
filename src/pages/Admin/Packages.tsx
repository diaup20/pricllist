import { useEffect, useState } from 'react';
import { packageService } from '../../services/firebaseService';
import { Package } from '../../types';
import GenericManager from '../../components/Admin/GenericManager';

export default function AdminPackages() {
  const [packages, setPackages] = useState<Package[]>([]);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    const data = await packageService.getAll();
    setPackages(data);
  };

  const handleAdd = async (name: string) => {
    try {
      await packageService.add(name);
      loadPackages();
    } catch (e) {
      alert("فشل الإضافة: يرجى تسجيل الدخول.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await packageService.delete(id);
      loadPackages();
    } catch (e) {
      alert("فشل الحذف.");
    }
  };

  const handleEdit = async (id: string, name: string) => {
    try {
      await packageService.update(id, name);
      loadPackages();
    } catch (e) {
      alert("فشل التعديل.");
    }
  };

  const handleImport = async (names: string[]) => {
    try {
      await packageService.bulkAdd(names);
      loadPackages();
    } catch (e) {
      alert("فشل استيراد البيانات.");
    }
  };

  return (
    <GenericManager 
      title="إدارة العبوات"
      items={packages}
      onAdd={handleAdd}
      onDelete={handleDelete}
      onEdit={handleEdit}
      onImport={handleImport}
    />
  );
}
