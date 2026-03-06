// src/features/events/constants/categories.ts

/**
 * Event Category Constants
 * ✅ Synced with Backend ExpoCategory enum
 * Backend path: entities/expo.go
 */

export const EVENT_CATEGORIES = [
  { 
    value: 'Trade-Show/B2B-Exhibition', 
    label: 'งานแสดงสินค้า B2B',
    shortLabel: 'B2B',
    color: { bg: 'bg-blue-100', text: 'text-blue-700' }
  },
  { 
    value: 'Consumer-Show/B2C-Exhibition', 
    label: 'งานแสดงสินค้า B2C',
    shortLabel: 'B2C',
    color: { bg: 'bg-purple-100', text: 'text-purple-700' }
  },
  { 
    value: 'Technology-Expo', 
    label: 'งานเทคโนโลยี',
    shortLabel: 'เทคโนโลยี',
    color: { bg: 'bg-cyan-100', text: 'text-cyan-700' }
  },
  { 
    value: 'Education-Expo', 
    label: 'งานการศึกษา',
    shortLabel: 'การศึกษา',
    color: { bg: 'bg-green-100', text: 'text-green-700' }
  },
  { 
    value: 'Job-Fair', 
    label: 'งานจัดหางาน',
    shortLabel: 'จัดหางาน',
    color: { bg: 'bg-orange-100', text: 'text-orange-700' }
  },
  { 
    value: 'Art-Exhibition', 
    label: 'งานศิลปะ',
    shortLabel: 'ศิลปะ',
    color: { bg: 'bg-pink-100', text: 'text-pink-700' }
  },
  { 
    value: 'Motor-Show', 
    label: 'งานยานยนต์',
    shortLabel: 'ยานยนต์',
    color: { bg: 'bg-red-100', text: 'text-red-700' }
  },
  { 
    value: 'Food&Beverage-Expo', 
    label: 'งานอาหารและเครื่องดื่ม',
    shortLabel: 'อาหาร',
    color: { bg: 'bg-yellow-100', text: 'text-yellow-700' }
  },
] as const;

/**
 * Get categories for dropdown (including "All" option)
 */
export function getCategoriesForFilter() {
  return [
    { value: '', label: 'ทั้งหมด', shortLabel: 'ทั้งหมด' },
    ...EVENT_CATEGORIES,
  ];
}

/**
 * Get category label from backend value
 */
export function getCategoryLabel(value: string, useShort: boolean = false): string {
  const category = EVENT_CATEGORIES.find(cat => cat.value === value);
  if (!category) return value;
  return useShort ? category.shortLabel : category.label;
}

/**
 * Get category color classes
 */
export function getCategoryColor(value: string): { bg: string; text: string } {
  const category = EVENT_CATEGORIES.find(cat => cat.value === value);
  return category?.color || { bg: 'bg-gray-100', text: 'text-gray-700' };
}

/**
 * Validate if category value is valid
 */
export function isValidCategory(value: string): boolean {
  return EVENT_CATEGORIES.some(cat => cat.value === value);
}