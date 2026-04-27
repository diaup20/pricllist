import { useEffect, useState } from 'react';
import { unitService } from '../../services/firebaseService';
import { Unit } from '../../types';
import GenericManager from '../../components/Admin/GenericManager';

export default function AdminUnits() {
  const [units, setUnits] = useState<Unit[]>([]);

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    const data = await unitService.getAll();
    setUnits(data);
  };

  const handleAdd = async (name: string) => {
    try {
      await unitService.add(name);
      loadUnits();
    } catch (e) {
      alert("فشل الإضافة: يرجى تسجيل الدخول.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await unitService.delete(id);
      loadUnits();
    } catch (e) {
      alert("فشل الحذف.");
    }
  };

  const handleEdit = async (id: string, name: string) => {
    try {
      await unitService.update(id, name);
      loadUnits();
    } catch (e) {
      alert("فشل التعديل.");
    }
  };

  const handleImport = async (names: string[]) => {
    try {
      await unitService.bulkAdd(names);
      loadUnits();
    } catch (e) {
      alert("فشل استيراد البيانات.");
    }
  };

  return (
    <GenericManager 
      title="إدارة الوحدات"
      items={units}
      onAdd={handleAdd}
      onDelete={handleDelete}
      onEdit={handleEdit}
      onImport={handleImport}
    />
  );
}
