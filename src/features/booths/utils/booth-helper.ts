// src/features/booths/utils/booth-helpers.ts

import type { Booth, BoothType } from '../types/booth.types';
import { BOOTH_TYPE_LABELS } from '../types/booth.types';

/**
 * Get booth type label in Thai
 */
export function getBoothTypeLabel(type: BoothType): string {
  return BOOTH_TYPE_LABELS[type] || type;
}

/**
 * Get booth display name
 */
export function getBoothDisplayName(booth: Booth): string {
  return booth.title || `บูธ ${booth.booth_no}`;
}

/**
 * Get booth location string
 */
export function getBoothLocation(booth: Booth): string {
  const parts: string[] = [];

  if (booth.hall) parts.push(booth.hall);
  if (booth.zone_name) parts.push(booth.zone_name);

  return parts.length > 0 ? parts.join(" • ") : "ไม่ระบุ";
}

/**
 * Check if booth has complete basic info
 */
export function hasCompleteBasicInfo(booth: Booth): boolean {
  return !!(
    booth.title &&
    booth.company &&
    booth.detail &&
    booth.email &&
    booth.tel
  );
}

/**
 * Get completion percentage
 */
export function getBoothCompletionPercentage(booth: Booth): number {
  const fields = [
    booth.title,
    booth.company,
    booth.detail,
    booth.email,
    booth.tel,
    booth.thumbnail,
    booth.website1,
  ];

  const completed = fields.filter(Boolean).length;
  return Math.round((completed / fields.length) * 100);
}

/**
 * Filter booths by search query
 */
export function filterBooths(booths: Booth[], query: string): Booth[] {
  if (!query.trim()) return booths;

  const searchLower = query.toLowerCase();

  return booths.filter((booth) => {
    return (
      booth.booth_no.toLowerCase().includes(searchLower) ||
      booth.title?.toLowerCase().includes(searchLower) ||
      booth.company?.toLowerCase().includes(searchLower) ||
      booth.zone_name?.toLowerCase().includes(searchLower) ||
      booth.hall?.toLowerCase().includes(searchLower)
    );
  });
}

/**
 * Sort booths by booth number
 */
export function sortBoothsByNumber(booths: Booth[]): Booth[] {
  return [...booths].sort((a, b) => {
    return a.booth_no.localeCompare(b.booth_no, "th", { numeric: true });
  });
}

/**
 * Group booths by type
 */
export function groupBoothsByType(
  booths: Booth[]
): Record<BoothType, Booth[]> {
  return booths.reduce(
    (acc, booth) => {
      if (!acc[booth.type]) {
        acc[booth.type] = [];
      }
      acc[booth.type].push(booth);
      return acc;
    },
    {} as Record<BoothType, Booth[]>
  );
}

/**
 * Group booths by zone
 */
export function groupBoothsByZone(
  booths: Booth[]
): Record<string, Booth[]> {
  return booths.reduce(
    (acc, booth) => {
      const zoneName = booth.zone_name || "ไม่มีโซน";
      if (!acc[zoneName]) {
        acc[zoneName] = [];
      }
      acc[zoneName].push(booth);
      return acc;
    },
    {} as Record<string, Booth[]>
  );
}

/**
 * Validate booth number format
 */
export function isValidBoothNumber(boothNo: string): boolean {
  return /^[A-Z0-9-]+$/i.test(boothNo);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^0[0-9]{1,2}-?[0-9]{3,4}-?[0-9]{4}$/;
  return phoneRegex.test(phone);
}

/**
 * Validate website URL
 */
export function isValidWebsite(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract unique expo IDs
 */
export function extractExpoIds(booths: Booth[]): string[] {
  const expoIds = booths
    .map((booth) => booth.expo_id)
    .filter((id): id is string => !!id);
  return Array.from(new Set(expoIds));
}

/**
 * Get booths for specific expo
 */
export function filterBoothsByExpo(
  booths: Booth[],
  expoId: string
): Booth[] {
  return booths.filter((booth) => booth.expo_id === expoId);
}

/**
 * Format date for display
 */
export function formatBoothDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}