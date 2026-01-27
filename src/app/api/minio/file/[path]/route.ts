// src/app/api/minio/file/[path]/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string }> }
) {
  try {
    // 1. ดึง Token จาก Query String, Cookie, หรือ Header
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token') ||
                  request.cookies.get('accessToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.error('❌ No token found');
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No access token provided' },
        { status: 401 }
      );
    }
    
    // 2. ดึง path parameter (ต้อง await!)
    const { path: encodedPath } = await params;
    
    // 3. เรียก Backend ด้วย Token
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    const response = await fetch(`${backendUrl}/file/${encodedPath}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // 4. ถ้า Backend Error
    if (!response.ok) {
      console.error(`❌ Backend error: ${response.status}`);
      return NextResponse.json(
        { error: 'Failed to fetch image' },
        { status: response.status }
      );
    }
    
    // 5. ส่งรูปกลับไป (พร้อม Content-Type)
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Cache 1 hour
      }
    });
    
  } catch (error) {
    console.error('❌ Error proxying image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}