/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp,
  type DocumentData,
  getDoc,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Category, Unit, Package, Brand, Product, ProductInput } from '../types';

// Generic CRUD helpers
async function getById<T>(collectionPath: string, id: string): Promise<T | null> {
  try {
    const docRef = doc(db, collectionPath, id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as T;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${collectionPath}/${id}`);
    return null;
  }
}

async function getAll<T>(collectionPath: string): Promise<T[]> {
  try {
    const q = query(collection(db, collectionPath));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
    return [];
  }
}

async function add<T>(collectionPath: string, data: any): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, collectionPath), {
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionPath);
    throw error;
  }
}

async function update(collectionPath: string, id: string, data: any): Promise<void> {
  try {
    const docRef = doc(db, collectionPath, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Date.now()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${collectionPath}/${id}`);
  }
}

async function remove(collectionPath: string, id: string): Promise<void> {
  try {
    const docRef = doc(db, collectionPath, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionPath}/${id}`);
  }
}

async function bulkAdd(collectionPath: string, dataList: any[]): Promise<void> {
  try {
    const chunks = [];
    for (let i = 0; i < dataList.length; i += 500) {
      chunks.push(dataList.slice(i, i + 500));
    }

    for (const chunk of chunks) {
      const batch = writeBatch(db);
      chunk.forEach(data => {
        const docRef = doc(collection(db, collectionPath));
        batch.set(docRef, {
          ...data,
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
      });
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionPath);
    throw error;
  }
}

// Specialized services
export const categoryService = {
  getAll: () => getAll<Category>('categories'),
  getById: (id: string) => getById<Category>('categories', id),
  add: (name: string) => add('categories', { name }),
  update: (id: string, name: string) => update('categories', id, { name }),
  delete: (id: string) => remove('categories', id),
  bulkAdd: (names: string[]) => bulkAdd('categories', names.map(name => ({ name })))
};

export const unitService = {
  getAll: () => getAll<Unit>('units'),
  getById: (id: string) => getById<Unit>('units', id),
  add: (name: string) => add('units', { name }),
  update: (id: string, name: string) => update('units', id, { name }),
  delete: (id: string) => remove('units', id),
  bulkAdd: (names: string[]) => bulkAdd('units', names.map(name => ({ name })))
};

export const packageService = {
  getAll: () => getAll<Package>('packages'),
  getById: (id: string) => getById<Package>('packages', id),
  add: (name: string) => add('packages', { name }),
  update: (id: string, name: string) => update('packages', id, { name }),
  delete: (id: string) => remove('packages', id),
  bulkAdd: (names: string[]) => bulkAdd('packages', names.map(name => ({ name })))
};

export const brandService = {
  getAll: () => getAll<Brand>('brands'),
  getById: (id: string) => getById<Brand>('brands', id),
  add: (name: string) => add('brands', { name }),
  update: (id: string, name: string) => update('brands', id, { name }),
  delete: (id: string) => remove('brands', id),
  bulkAdd: (names: string[]) => bulkAdd('brands', names.map(name => ({ name })))
};

export const productService = {
  getAll: () => getAll<Product>('products'),
  getById: (id: string) => getById<Product>('products', id),
  add: (product: ProductInput) => add('products', product),
  update: (id: string, product: Partial<ProductInput>) => update('products', id, product),
  delete: (id: string) => remove('products', id),
  bulkAdd: (products: ProductInput[]) => bulkAdd('products', products)
};
