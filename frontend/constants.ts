import { RarityConfigItem, RarityLevel } from './types';

export const INITIAL_NAMES: string[] = [
  "周晓东", "余启东", "谢俊洪", "吴钰祥", "王家裕", 
  "石悦", "邱佳荣", "欧阳效彬", "刘子骏", 
  "刘镇杰", "刘韵怡", "刘世钦", "林烨棠", "林睿轩", 
  "廖俊", "梁升发", "李栋", 
  "雷锦鸿", "赖昊然", "黄子加", "黄智恒", "黄允成", 
  "黄扬越", "何骏辉", "段建勋", "程迺伦", "陈永乾", "曹玉宜"
];

export const RARITY_CONFIG: Record<RarityLevel, RarityConfigItem> = {
  0: { color: 'text-slate-500', bg: 'bg-slate-100', border: 'border-slate-300', shadow: 'shadow-slate-300/50', label: 'N', title: '普通' },
  1: { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-400', shadow: 'shadow-green-400/50', label: 'R', title: '稀有' },
  2: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-400', shadow: 'shadow-blue-400/50', label: 'SR', title: '超稀有' },
  3: { color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-400', shadow: 'shadow-purple-400/50', label: 'SSR', title: '史诗' },
  4: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-400', shadow: 'shadow-amber-400/50', label: 'UR', title: '传说' },
  5: { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-400', shadow: 'shadow-rose-400/50', label: 'EX', title: '神话' },
};