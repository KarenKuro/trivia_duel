export interface IQueryBuilderCategory {
  category_id: number;
  category_text: string;
  category_price: number;
  category_premiumPrice: number;
  created_at: Date;
  updated_at: Date;
  category_isActive: string;
  category_image: string;
  mf_id?: number;
  mf_created_at?: Date;
  mf_updated_at?: Date;
  mf_path?: string;
}
