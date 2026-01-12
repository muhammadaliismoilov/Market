import { ProductType } from "../product.entity";

export interface ImportSuccessRow {
  row: number;
  data: {
    name: string;
    price: number;
    costPrice: number;
    barcode: string;
    type: ProductType;
    count: number;
    weight: number;
    branchId: string | null;
  };
}

export interface ImportErrorRow {
  row: number;
  barcode?: string;
  error: string;
}
