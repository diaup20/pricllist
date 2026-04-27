/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Category {
  id: string;
  name: string;
}

export interface Unit {
  id: string;
  name: string;
}

export interface Package {
  id: string;
  name: string;
}

export interface Brand {
  id: string;
  name: string;
}

export interface PriceVariant {
  sizeName: string; // e.g., "50 كجم"
  agentPrice: number;
  wholesalePrice: number;
  retailPrice: number;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  unitId: string;
  packageId: string;
  brandId: string;
  variants: PriceVariant[];
  image: string;
  description: string;
  createdAt: number;
  updatedAt: number;
}

export type ProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
