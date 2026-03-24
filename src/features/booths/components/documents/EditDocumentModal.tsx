// src/features/booths/components/documents/EditDocumentModal.tsx
'use client';
import { toast } from '@/src/lib/toast';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { updateDocument } from '../../api/documentApi';
import type { BoothDocument } from '../../types/document.types';

interface EditDocumentModalProps {
  document: BoothDocument;
  expoId: string;
  boothId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditDocumentModal({ document, expoId, boothId, onClose, onSuccess }: EditDocumentModalProps) {
  const [title, setTitle] = useState(document.Title);
  const [status, setStatus] = useState<'publish' | 'unpublish'>(document.Status);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileError, setFileError] = useState('');

  const MAX_FILE_SIZE = 20 * 1024 * 1024;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.warning('กรุณาระบุชื่อเอกสาร'); return; }
    if (file && file.size > MAX_FILE_SIZE) { setFileError('ไฟล์เกินขนาดที่อนุญาต (20 MB)'); return; }
    try {
      setIsSubmitting(true);
      await updateDocument(expoId, boothId, {
        doc_id: document.DocID, title: title.trim(), status, file: file || undefined,
      });
      toast.success('แก้ไขเอกสารสำเร็จ');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'ไม่สามารถแก้ไขเอกสารได้');
    } finally { setIsSubmitting(false); }
  };

  const inputCls = 'w-full px-3.5 py-3 rounded-xl border border-gray-200 text-[15px] focus:outline-none focus:border-[#3674B5] focus:ring-2 focus:ring-[#3674B5]/15 transition bg-white';

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col" onClick={e => e.stopPropagation()}>

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

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                ชื่อเอกสาร <span className="text-red-500">*</span>
              </label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                placeholder="ระบุชื่อเอกสาร" disabled={isSubmitting} className={inputCls} />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                สถานะ <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { value: 'unpublish', label: 'ยังไม่เผยแพร่', desc: 'เก็บไว้ภายในระบบ',   dot: '#9CA3AF' },
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

            {/* File (optional) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                เปลี่ยนไฟล์ <span className="text-gray-400 font-normal">(ถ้าต้องการ)</span>
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
                  <button type="button" onClick={() => { setFile(null); setFileError(''); }} disabled={isSubmitting}
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
              {!file && <p className="mt-1 text-xs text-gray-400">ถ้าไม่เลือกไฟล์ใหม่ ไฟล์เดิมจะไม่เปลี่ยนแปลง</p>}
            </div>
          </form>

          {/* Footer */}
          <div className="px-6 py-[18px] border-t border-gray-100 flex gap-3 flex-shrink-0">
            <button type="button" onClick={onClose} disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50">
              ยกเลิก
            </button>
            <button type="submit" disabled={isSubmitting || !!fileError}
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