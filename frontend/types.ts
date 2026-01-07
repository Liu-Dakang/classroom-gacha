export interface Student {
  id: number;
  name: string;
  dormNumber?: string;
  stars: number;
  pickCount: number;
}

export interface RarityConfigItem {
  color: string;
  bg: string;
  border: string;
  shadow: string;
  label: string;
  title: string;
}

export type RarityLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface Stats {
  progress: number;
  unpickedCount: number;
}

export interface ItemCard {
  id: number;
  name: string;
  description: string;
  function_desc: string;
  image_path: string;
}

export interface StudentItem {
  id: number;
  student_id: number;
  item_card: ItemCard;
}