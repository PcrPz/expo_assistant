// src/features/booths/components/documents/EditDocumentModal.tsx
'use client';
import { toast } from '@/src/lib/toast';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { updateDocument } from '../../api/documentApi';
import { getMinioFileUrl } from '@/src/features/minio/api/minioApi';
import type { BoothDocument } from '../../types/document.types';

interface EditDocumentModalProps {
  document: BoothDocument;
  expoId: string;
  boothId: string;
  onClose: () => void;
  onSuccess: () => void;
}

async function extractPdfFirstPage(file: File): Promise<File | null> {
  try {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) { resolve(null); return; }
        resolve(new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' }));
      }, 'image/jpeg', 0.85);
    });
  } catch (err) {
    console.error('❌ PDF thumbnail extraction failed:', err);
    return null;
  }
}

async function generateThumbnail(file: File): Promise<File | null> {
  if (file.type === 'application/pdf') return extractPdfFirstPage(file);
  if (file.type.startsWith('image/')) return file;
  return null;
}

export function EditDocumentModal({ document, expoId, boothId, onClose, onSuccess }: EditDocumentModalProps) {
  const [title, setTitle] = useState(document.Title);
  const [status, setStatus] = useState<'publish' | 'unpublish'>(document.Status);
  const [accessLevel, setAccessLevel] = useState<'public' | 'private'>(document.AccessLevel ?? 'public');
  const [file, setFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    document.Thumbnail ? getMinioFileUrl(document.Thumbnail) : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingThumb, setIsGeneratingThumb] = useState(false);
  const [fileError, setFileError] = useState('');
  const [thumbError, setThumbError] = useState('');

  const MAX_FILE_SIZE = 20 * 1024 * 1024;
  const MAX_THUMB_SIZE = 5 * 1024 * 1024;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFileError('');
    if (!selectedFile) return;
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setFileError('กรุณาเลือกไฟล์ PDF, JPEG หรือ PNG เท่านั้น');
      e.target.value = ''; return;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      setFileError(`ไฟล์มีขนาด ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB เกินขนาดที่อนุญาต (20 MB)`);
      e.target.value = ''; return;
    }
    setFile(selectedFile);
    setIsGeneratingThumb(true);
    const thumb = await generateThumbnail(selectedFile);
    if (thumb) {
      setThumbnailFile(thumb);
      setThumbnailPreview(URL.createObjectURL(thumb));
    }
    setIsGeneratingThumb(false);
  };

  // ลบไฟล์ใหม่ออก → reset thumbnail กลับไปของเดิม
  const handleRemoveFile = () => {
    setFile(null);
    setFileError('');
    setThumbnailFile(null);
    setThumbnailPreview(
      document.Thumbnail ? getMinioFileUrl(document.Thumbnail) : null
    );
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setThumbError('');
    if (!selectedFile) return;
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setThumbError('กรุณาเลือกไฟล์ JPEG หรือ PNG เท่านั้น');
      e.target.value = ''; return;
    }
    if (selectedFile.size > MAX_THUMB_SIZE) {
      setThumbError('ไฟล์รูปเกิน 5 MB');
      e.target.value = ''; return;
    }
    setThumbnailFile(selectedFile);
    setThumbnailPreview(URL.createObjectURL(selectedFile));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.warning('กรุณาระบุชื่อเอกสาร'); return; }
    try {
      setIsSubmitting(true);
      await updateDocument(expoId, boothId, {
        doc_id: document.DocID,
        title: title.trim(),
        status,
        access_level: accessLevel,
        file: file || undefined,
        thumbnail: thumbnailFile ? undefined : (document.Thumbnail ?? undefined),
        thumbnail_file: thumbnailFile || undefined,
      });
      toast.success('แก้ไขเอกสารสำเร็จ');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'ไม่สามารถแก้ไขเอกสารได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = 'w-full px-3.5 py-3 rounded-xl border border-gray-200 text-[15px] focus:outline-none focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/15 transition bg-white';

  const accessOptions = [
    {
      value: 'public', label: 'สาธารณะ', desc: 'ทุกคนสามารถดูได้',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      ),
    },
    {
      value: 'private', label: 'ส่วนตัว', desc: 'เฉพาะทีมงานเท่านั้น',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <rect x="3" y="11" width="18" height="11" rx="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      ),
    },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">แก้ไขเอกสาร</h2>
                <p className="text-xs text-gray-400 truncate max-w-[200px]">{document.Title}</p>
              </div>
            </div>
            <button onClick={onClose} disabled={isSubmitting}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {/* ── ชื่อเอกสาร ── */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                ชื่อเอกสาร <span className="text-red-500">*</span>
              </label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                placeholder="ระบุชื่อเอกสาร" disabled={isSubmitting} className={inputCls} />
            </div>

            {/* ── รูปปก ── */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                  รูปปก
                  <span className="ml-1.5 text-gray-400 font-normal text-xs">(ไม่บังคับ)</span>
                </label>
                {isGeneratingThumb && (
                  <span className="text-[11px] text-[#3674B5] flex items-center gap-1">
                    <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle className="opacity-25" cx="12" cy="12" r="10"/>
                      <path className="opacity-75" d="M4 12a8 8 0 018-8"/>
                    </svg>
                    กำลังสร้างอัตโนมัติ...
                  </span>
                )}
              </div>
              {thumbnailPreview ? (
                <div className="relative w-full h-36 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group">
                  <img src={thumbnailPreview} alt="thumbnail" className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <label className="cursor-pointer px-3 py-1.5 bg-white rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 transition">
                      เปลี่ยนรูป
                      <input type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                        onChange={handleThumbnailChange} className="hidden" disabled={isSubmitting} />
                    </label>
                    <button type="button"
                      onClick={() => { setThumbnailFile(null); setThumbnailPreview(null); }}
                      className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition">
                      ลบรูป
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-xl cursor-pointer transition border-[#D1D9E6] hover:border-[#3674B5] hover:bg-[#F0F6FF]">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <span className="mt-1.5 text-xs text-gray-500 font-medium">คลิกเพื่อเลือกรูปปก</span>
                  <span className="text-[11px] text-gray-400">JPEG, PNG · สูงสุด 5 MB</span>
                  <input type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                    onChange={handleThumbnailChange} className="hidden" disabled={isSubmitting} />
                </label>
              )}
              {thumbError && (
                <div className="mt-2 flex items-center gap-2 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />{thumbError}
                </div>
              )}
            </div>

            {/* ── เปลี่ยนไฟล์ (ใต้ thumbnail) ── */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                เปลี่ยนไฟล์
                <span className="ml-1.5 text-gray-400 font-normal text-xs">(ถ้าต้องการ)</span>
              </label>
              {!file ? (
                <label className={`flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-xl cursor-pointer transition ${
                  fileError ? 'border-red-300 bg-red-50' : 'border-[#D1D9E6] hover:border-[#3674B5] hover:bg-[#F0F6FF]'
                }`}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={fileError ? '#F87171' : '#9CA3AF'} strokeWidth="1.5" strokeLinecap="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <span className="mt-1.5 text-xs text-gray-600 font-medium">คลิกเพื่อเลือกไฟล์ใหม่</span>
                  <span className="text-[11px] text-gray-400">PDF, JPEG, PNG · สูงสุด 20 MB</span>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    onChange={handleFileChange} className="hidden" disabled={isSubmitting} />
                </label>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3.5 bg-[#EBF3FC] border border-[#BFDBFE] rounded-xl">
                  <div className="w-9 h-9 bg-[#3674B5] rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button type="button" onClick={handleRemoveFile} disabled={isSubmitting}
                    className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-gray-400 hover:text-red-500 transition flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              )}
              {fileError && (
                <div className="mt-2 flex items-center gap-2 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />{fileError}
                </div>
              )}
              {!file && <p className="mt-1 text-xs text-gray-400">ถ้าไม่เลือกไฟล์ใหม่ ไฟล์เดิมจะไม่เปลี่ยนแปลง · เปลี่ยนไฟล์จะอัปเดต thumbnail อัตโนมัติ</p>}
            </div>

            {/* ── ระดับการเข้าถึง ── */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                ระดับการเข้าถึง <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {accessOptions.map(opt => {
                  const sel = accessLevel === opt.value;
                  return (
                    <button key={opt.value} type="button"
                      onClick={() => setAccessLevel(opt.value as 'public' | 'private')}
                      className={`relative flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                        sel ? 'border-[#3674B5] bg-[#EBF3FC]' : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}>
                      <span className={sel ? 'text-[#3674B5]' : 'text-gray-400'}>{opt.icon}</span>
                      <div>
                        <p className={`text-sm font-semibold ${sel ? 'text-[#3674B5]' : 'text-gray-700'}`}>{opt.label}</p>
                        <p className={`text-[11px] mt-0.5 ${sel ? 'text-[#3674B5]/70' : 'text-gray-400'}`}>{opt.desc}</p>
                      </div>
                      {sel && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-[#3674B5] rounded-full flex items-center justify-center">
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── สถานะ ── */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                สถานะ <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { value: 'unpublish', label: 'ยังไม่เผยแพร่', desc: 'เก็บไว้ภายในระบบ',    dot: '#9CA3AF' },
                  { value: 'publish',   label: 'เผยแพร่',        desc: 'แสดงให้ผู้เข้าชมเห็น', dot: '#16A34A' },
                ].map(opt => {
                  const sel = status === opt.value;
                  return (
                    <button key={opt.value} type="button"
                      onClick={() => setStatus(opt.value as 'publish' | 'unpublish')}
                      className={`relative flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                        sel ? 'border-[#3674B5] bg-[#EBF3FC]' : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}>
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: opt.dot }} />
                      <div>
                        <p className={`text-sm font-semibold ${sel ? 'text-[#3674B5]' : 'text-gray-700'}`}>{opt.label}</p>
                        <p className={`text-[11px] mt-0.5 ${sel ? 'text-[#3674B5]/70' : 'text-gray-400'}`}>{opt.desc}</p>
                      </div>
                      {sel && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-[#3674B5] rounded-full flex items-center justify-center">
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="px-6 py-[18px] border-t border-gray-100 flex gap-3 flex-shrink-0">
            <button type="button" onClick={onClose} disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50">
              ยกเลิก
            </button>
            <button type="submit" disabled={isSubmitting || !!fileError || isGeneratingThumb}
              onClick={handleSubmit as any}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#3674B5,#498AC3)' }}>
              {isSubmitting
                ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle className="opacity-25" cx="12" cy="12" r="10"/><path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>กำลังบันทึก...</>
                : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>บันทึกการเปลี่ยนแปลง</>
              }
            </button>
          </div>
        </div>
      </div>
    </>
  );
}