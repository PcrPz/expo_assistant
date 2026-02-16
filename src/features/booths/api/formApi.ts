import { fetchWithAuth } from '@/src/lib/api/fetchWithAuth';
import type {
  GetFormResponse,
  CreateFormRequest,
  UpdateFormRequest,
  SubmitAnswerRequest,
  FormStatus,
  FormResultsData,
  QuestionResultDetail,
} from '../types/form.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

/**
 * Get form by booth ID
 * GET /booth-form/:expoID/:boothID/get
 */
export async function getBoothForm(
  expoId: string,
  boothId: string
): Promise<GetFormResponse | null> {
  try {
    const response = await fetchWithAuth(
      `${API_URL}/booth-form/${expoId}/${boothId}/get`
    );

    // ✅ ถ้าไม่เจอ form (404) ให้ return null แบบเงียบๆ (ไม่ใช่ error)
    if (!response.ok) {
      if (response.status === 404) {
        // Form ยังไม่ถูกสร้าง - ไม่ใช่ error
        return null;
      }
      
      // Error อื่นๆ ถึงจะ log
      console.error(`Failed to get form: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    return {
      status: data.status,
      expo_id: data.expo_id,
      booth_id: data.booth_id,
      questions: data.questions,
    };
  } catch (error) {
    // ถ้า error จาก network หรืออื่นๆ ถึง log
    console.error('Error getting form:', error);
    return null;
  }
}

/**
 * Create form
 * POST /booth-form/:expoID/:boothID/create
 */
export async function createBoothForm(
  expoId: string,
  boothId: string,
  data: CreateFormRequest
): Promise<{ booth_id: string }> {
  const response = await fetchWithAuth(
    `${API_URL}/booth-form/${expoId}/${boothId}/create`,
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
    throw new Error(error.error || 'ไม่สามารถสร้างแบบสอบถามได้');
  }

  return await response.json();
}

/**
 * Update form
 * PUT /booth-form/:expoID/:boothID/update
 */
export async function updateBoothForm(
  expoId: string,
  boothId: string,
  data: UpdateFormRequest
): Promise<{ message: string }> {
  const response = await fetchWithAuth(
    `${API_URL}/booth-form/${expoId}/${boothId}/update`,
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
    throw new Error(error.error || 'ไม่สามารถแก้ไขแบบสอบถามได้');
  }

  return await response.json();
}

/**
 * Update form status (publish/unpublish)
 * PUT /booth-form/:expoID/:boothID/update-status
 */
export async function updateFormStatus(
  expoId: string,
  boothId: string,
  status: FormStatus
): Promise<{ message: string }> {
  const response = await fetchWithAuth(
    `${API_URL}/booth-form/${expoId}/${boothId}/update-status`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'ไม่สามารถเปลี่ยนสถานะแบบสอบถามได้');
  }

  return await response.json();
}

/**
 * Delete form
 * DELETE /booth-form/:expoID/:boothID/delete
 */
export async function deleteBoothForm(
  expoId: string,
  boothId: string
): Promise<{ message: string }> {
  const response = await fetchWithAuth(
    `${API_URL}/booth-form/${expoId}/${boothId}/delete`,
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'ไม่สามารถลบแบบสอบถามได้');
  }

  return await response.json();
}

/**
 * Submit answer (สำหรับผู้เข้าชม - ไม่ได้ทำใน Web)
 * POST /booth-form/:expoID/:boothID/answer
 */
export async function submitFormAnswer(
  expoId: string,
  boothId: string,
  data: SubmitAnswerRequest
): Promise<{ message: string }> {
  const response = await fetchWithAuth(
    `${API_URL}/booth-form/${expoId}/${boothId}/answer`,
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
    throw new Error(error.error || 'ไม่สามารถส่งคำตอบได้');
  }

  return await response.json();
}

/**
 * Get form results (สรุปผลคำตอบ)
 * ⚠️ MOCK FUNCTION - Backend ยังไม่มี API นี้
 * 
 * TODO: เมื่อ Backend พร้อม ให้เปลี่ยนเป็น:
 * GET /booth-form/:expoID/:boothID/results
 */
export async function getFormResults(
  expoId: string,
  boothId: string
): Promise<FormResultsData> {
  // ✅ MOCK DATA - ใช้ชั่วคระว
  console.warn('⚠️ getFormResults: Using mock data - Backend API not available yet');
  
  // Delay เพื่อจำลอง API call
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // ดึงข้อมูล form จริงก่อน
  const formData = await getBoothForm(expoId, boothId);
  
  if (!formData) {
    throw new Error('ไม่พบข้อมูลแบบสอบถาม');
  }

  // สร้าง mock results จาก questions จริง
  const mockQuestions: QuestionResultDetail[] = formData.questions.map((q) => {
    const baseResult: QuestionResultDetail = {
      question_no: q.question_no,
      question_text: q.question_text,
      question_type: q.question_type,
      required: q.required,
      total_responses: Math.floor(Math.random() * 50) + 10, // 10-59 responses
    };

    if (q.question_type === 'text') {
      // Mock text answers
      const numAnswers = Math.floor(Math.random() * 10) + 5;
      baseResult.text_answers = Array.from({ length: numAnswers }, (_, i) => ({
        user_id: `user_${i + 1}`,
        response: `คำตอบตัวอย่างที่ ${i + 1} สำหรับคำถาม "${q.question_text}"`,
        created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      }));
    } else if (q.question_type === 'rating') {
      // Mock rating distribution
      const totalRatings = baseResult.total_responses;
      const distribution = [1, 2, 3, 4, 5].map((rating) => {
        const count = Math.floor(Math.random() * (totalRatings / 3));
        return {
          rating,
          count,
          percentage: (count / totalRatings) * 100,
        };
      });

      const totalCount = distribution.reduce((sum, d) => sum + d.count, 0);
      const weightedSum = distribution.reduce((sum, d) => sum + d.rating * d.count, 0);
      const average = totalCount > 0 ? weightedSum / totalCount : 0;

      baseResult.rating_data = {
        average: parseFloat(average.toFixed(2)),
        total_ratings: totalCount,
        distribution,
      };
    }

    return baseResult;
  });

  const totalResponses = mockQuestions.reduce(
    (sum, q) => sum + q.total_responses,
    0
  ) / mockQuestions.length;

  return {
    form_status: formData.status,
    total_questions: formData.questions.length,
    total_responses: Math.floor(totalResponses),
    questions: mockQuestions,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  };

  /* 
  // ✅ เมื่อ Backend พร้อม ให้ใช้โค้ดนี้แทน:
  
  try {
    const response = await fetchWithAuth(
      `${API_URL}/booth-form/${expoId}/${boothId}/results`
    );

    if (!response.ok) {
      throw new Error('ไม่สามารถดึงข้อมูลผลสรุปได้');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting form results:', error);
    throw error;
  }
  */
}