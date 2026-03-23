'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Navbar } from '../../components/layout/Navbar';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="flex items-center gap-3">
              <Image
                src="/images/logo_expo.png"
                alt="ExpoAssistant Logo"
                width={64}
                height={64}
                className="rounded-lg shadow-md"
              />
              <span className="text-gray-800 text-3xl font-bold">
                ExpoAssistant
              </span>
            </div>
          </div>

          {/* Illustration */}
          <div>
            <Image
              src="/images/Landing_Image.png"
              alt="Expo Management Illustration"
              width={500}
              height={400}
              className="mx-auto rounded-lg"
              priority
            />
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Where Expo Management Meets Innovation
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 max-w-4xl mx-auto mb-10 leading-relaxed">
            ExpoAssistant ช่วยให้คุณจัดการงานได้อย่างมีประสิทธิภาพ ด้วยเครื่องมือที่ออกแบบมาเพื่องานและ
            ผู้ร่วมออกบูธโดยเฉพาะ เพิ่มประสิทธิภาพ ลดความซับซ้อน และสร้างประสบการณ์ที่ดีให้กับทุกคน
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={() => router.push('/login')}
              className="bg-[#4A90E2] hover:bg-[#3A7BC8] text-white px-8 py-6 text-lg rounded-full min-w-[200px]"
            >
              สร้างงาน Expo
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push('/login')}
              className="border-2 border-[#4A90E2] text-[#4A90E2] hover:bg-[#4A90E2] hover:text-white px-8 py-6 text-lg rounded-full min-w-[200px]"
            >
              จัดการงานและบูธ
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}