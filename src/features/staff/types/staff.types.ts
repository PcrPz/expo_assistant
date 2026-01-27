// src/features/staff/types/staff.types.ts
export type StaffRole = 'admin' | 'staff' | 'booth_staff' | 'event_staff';
export type StaffStatus = 'accepted' | 'pending' | 'rejected';

export interface Staff {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: StaffRole;
  status: StaffStatus;
}