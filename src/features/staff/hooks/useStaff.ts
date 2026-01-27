// src/features/staff/hooks/useStaff.ts
import { useState, useEffect, useCallback } from 'react';
import * as staffApi from '../api/staffApi';
import type { Staff } from '../api/staffApi';

export function useStaff(expoId: string) {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Loading states for each action
  const [isInviting, setIsInviting] = useState(false);
  const [isCreatingCode, setIsCreatingCode] = useState(false);
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Invite code result
  const [inviteCode, setInviteCode] = useState<string | undefined>(undefined);

  // Fetch staff list
  const fetchStaffList = useCallback(async () => {
    console.log('🔄 Fetching staff list for expo:', expoId); // Debug log
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await staffApi.getStaffList(expoId);
      console.log('📦 Received staff data:', data); // Debug log
      
      // Filter เฉพาะ accepted และ pending
      const filtered = data.filter(
        (staff) => staff.status === 'accepted' || staff.status === 'pending'
      );
      
      console.log('✅ Filtered staff list:', filtered); // Debug log
      setStaffList(filtered);
    } catch (err) {
      const errorMessage = 'ไม่สามารถโหลดข้อมูล Staff ได้';
      setError(errorMessage);
      console.error('❌', errorMessage, err);
    } finally {
      setIsLoading(false);
    }
  }, [expoId]);

  // Initial fetch
  useEffect(() => {
    if (expoId) {
      console.log('🚀 Initial fetch triggered for expo:', expoId);
      fetchStaffList();
    }
  }, [expoId, fetchStaffList]);

  // Invite staff by email
  const inviteStaff = async (
    data: { email: string; role: string },
    callbacks?: {
      onSuccess?: () => void;
      onError?: () => void;
    }
  ) => {
    setIsInviting(true);
    
    try {
      const success = await staffApi.inviteStaffByEmail(expoId, data);
      
      if (success) {
        await fetchStaffList(); // Refresh list
        callbacks?.onSuccess?.();
      } else {
        callbacks?.onError?.();
      }
    } catch (err) {
      console.error(err);
      callbacks?.onError?.();
    } finally {
      setIsInviting(false);
    }
  };

  // Create invite code
  const createInviteCode = async (data: { role: string }) => {
    setIsCreatingCode(true);
    setInviteCode(undefined);
    
    try {
      const result = await staffApi.createInviteCode(expoId, data);
      
      if (result) {
        setInviteCode(result.code);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreatingCode(false);
    }
  };

  // Change staff role
  const changeRole = async (
    data: { user_id: string; role: string },
    callbacks?: {
      onSuccess?: () => void;
      onError?: () => void;
    }
  ) => {
    setIsChangingRole(true);
    
    try {
      const success = await staffApi.changeStaffRole(expoId, data);
      
      if (success) {
        await fetchStaffList(); // Refresh list
        callbacks?.onSuccess?.();
      } else {
        callbacks?.onError?.();
      }
    } catch (err) {
      console.error(err);
      callbacks?.onError?.();
    } finally {
      setIsChangingRole(false);
    }
  };

  // Remove staff
  const removeStaff = async (
    userId: string,
    callbacks?: {
      onSuccess?: () => void;
      onError?: () => void;
    }
  ) => {
    setIsRemoving(true);
    
    try {
      const success = await staffApi.removeStaff(expoId, userId);
      
      if (success) {
        await fetchStaffList(); // Refresh list
        callbacks?.onSuccess?.();
      } else {
        callbacks?.onError?.();
      }
    } catch (err) {
      console.error(err);
      callbacks?.onError?.();
    } finally {
      setIsRemoving(false);
    }
  };

  return {
    // Data
    staffList,
    isLoading,
    error,

    // Actions
    inviteStaff,
    createInviteCode,
    changeRole,
    removeStaff,
    refetch: fetchStaffList,

    // Loading states
    isInviting,
    isCreatingCode,
    isChangingRole,
    isRemoving,

    // Results
    inviteCode,
  };
}