// src/features/queues/api/queueApi.ts

import { fetchWithAuth } from '@/src/lib/api/fetchWithAuth';
import type {   
  BoothQueue,
  QueueDetail,
  MyQueue,
  CreateQueueRequest,
  UpdateQueueRequest,
  JoinQueueRequest,
  LeaveQueueRequest,
  CallNextRequest,
  JoinQueueResponse,
  CallNextResponse,} from '../types/queue.types';


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

/**
 * Get all queues for a booth
 * GET /booth-queue/:expoID/get-queues/:boothID
 */
export async function getBoothQueues(
  expoId: string,
  boothId: string
): Promise<BoothQueue[]> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/booth-queue/${expoId}/get-queues/${boothId}`
    );

    if (!response.ok) {
      console.error(`Failed to get queues: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error getting queues:', error);
    return [];
  }
}

/**
 * Get queue detail
 * GET /booth-queue/:expoID/get/:queueID
 */
export async function getQueueDetail(
  expoId: string,
  queueId: string
): Promise<QueueDetail | null> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/booth-queue/${expoId}/get/${queueId}`
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting queue detail:', error);
    return null;
  }
}

/**
 * Get my queues
 * GET /booth-queue/get-my-queues
 */
export async function getMyQueues(): Promise<MyQueue[]> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/booth-queue/get-my-queues`
    );

    if (!response.ok) {
      console.error(`Failed to get my queues: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error getting my queues:', error);
    return [];
  }
}

/**
 * Create queue
 * POST /booth-queue/:expoID/:boothID/create
 */
export async function createQueue(
  expoId: string,
  boothId: string,
  data: CreateQueueRequest
): Promise<{ queueID: string }> {
  const response = await fetchWithAuth(
    `${API_URL}/booth-queue/${expoId}/${boothId}/create`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create queue');
  }

  return await response.json();
}

/**
 * Update queue
 * PUT /booth-queue/:expoID/:boothID/update
 */
export async function updateQueue(
  expoId: string,
  boothId: string,
  data: UpdateQueueRequest
): Promise<{ message: string }> {
  const response = await fetchWithAuth(
    `${API_URL}/booth-queue/${expoId}/${boothId}/update`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update queue');
  }

  return await response.json();
}

/**
 * Delete queue
 * DELETE /booth-queue/:expoID/:boothID/delete/:queueID
 */
export async function deleteQueue(
  expoId: string,
  boothId: string,
  queueId: string
): Promise<{ message: string }> {
  const response = await fetchWithAuth(
    `${API_URL}/booth-queue/${expoId}/${boothId}/delete/${queueId}`,
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete queue');
  }

  return await response.json();
}

/**
 * Join queue
 * POST /booth-queue/:expoID/join
 */
export async function joinQueue(
  expoId: string,
  data: JoinQueueRequest
): Promise<JoinQueueResponse> {
  const response = await fetchWithAuth(
    `${API_URL}/booth-queue/${expoId}/join`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to join queue');
  }

  return await response.json();
}

/**
 * Leave queue
 * POST /booth-queue/:expoID/leave
 */
export async function leaveQueue(
  expoId: string,
  data: LeaveQueueRequest
): Promise<{ message: string }> {
  const response = await fetchWithAuth(
    `${API_URL}/booth-queue/${expoId}/leave`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to leave queue');
  }

  return await response.json();
}

/**
 * Call next in queue (Skip or Complete)
 * POST /booth-queue/:expoID/:boothID/next
 */
export async function callNext(
  expoId: string,
  boothId: string,
  data: CallNextRequest
): Promise<CallNextResponse> {
  const response = await fetchWithAuth(
    `${API_URL}/booth-queue/${expoId}/${boothId}/next`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to call next');
  }

  return await response.json();
}