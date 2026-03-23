// src/features/events/components/forms/ExpoFormResultsModal.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Star, BarChart3, MessageSquare, RefreshCw, Users, FileText } from 'lucide-react';
import { getExpoFormAvg, getExpoFormRatingCount, getExpoFormResponse } from '../../api/expoFormApi';

const GENDER_TH: Record<string, string> = { female: 'หญิง', male: 'ชาย', other: 'อื่นๆ' };

function isRatingValue(val: string) {
  return ['1','2','3','4','5'].includes((val ?? '').trim());
}

interface ExpoFormResultsModalProps {
  expoId: string;
  onClose: () => void;
}

export function ExpoFormResultsModal({ expoId, onClose }: ExpoFormResultsModalProps) {
  const [formAvg, setFormAvg]       = useState<any[]>([]);
  const [formRating, setFormRating] = useState<any[]>([]);
  const [formResp, setFormResp]     = useState<{ questions: Record<string,string>; responses: Record<string,string>[] } | null>(null);
  const [isLoading, setIsLoading]   = useState(true);
  const [selectedKey, setSelectedKey] = useState('');

  useEffect(() => { loadAll(); }, [expoId]);

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [avg, rating, resp] = await Promise.all([
        getExpoFormAvg(expoId),
        getExpoFormRatingCount(expoId),
        getExpoFormResponse(expoId),
      ]);
      setFormAvg(avg);
      setFormRating(rating);
      setFormResp(resp);
      const firstKey = resp && Object.keys(resp.questions).length > 0
        ? Object.keys(resp.questions)[0]
        : avg.length > 0 ? avg[0].responseId : '';
      setSelectedKey(firstKey);
    } catch (err) {
      console.error('Failed to load expo form results:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const allQuestions = useMemo(() => {
    const map: Record<string, { key: string; title: string; type: 'rating' | 'text' }> = {};
    if (formResp) {
      Object.entries(formResp.questions).forEach(([key, title]) => {
        const sample = formResp.responses[0]?.[key] ?? '';
        map[key] = { key, title, type: isRatingValue(sample) ? 'rating' : 'text' };
      });
    }
    formAvg.forEach(a => {
      if (!map[a.responseId]) map[a.responseId] = { key: a.responseId, title: a.title, type: 'rating' };
    });
    return Object.values(map).sort((a, b) => Number(a.key) - Number(b.key));
  }, [formResp, formAvg]);

  const totalResponses = formResp?.responses.length ?? (formAvg[0]?.responseCount ?? 0);
  const selectedQ = allQuestions.find(q => q.key === selectedKey);

  const renderRating = (key: string) => {
    const avg    = formAvg.find(a => a.responseId === key);
    const rating = formRating.find(r => r.questionNo === key);
    if (!avg && !rating) return <div className="flex flex-col items-center justify-center py-14 text-gray-300"><Users className="h-10 w-10 mb-2" /><p className="text-sm">ยังไม่มีข้อมูล</p></div>;
    const avgVal = avg?.averageRating ?? 0;
    const total  = avg?.responseCount ?? 0;
    const dist   = rating ? [
      { star: 5, count: rating.rating5 }, { star: 4, count: rating.rating4 },
      { star: 3, count: rating.rating3 }, { star: 2, count: rating.rating2 },
      { star: 1, count: rating.rating1 },
    ] : [];
    const maxCount = Math.max(...dist.map(d => d.count), 1);
    return (
      <div className="space-y-4">
        <div className="bg-[#EBF3FC] rounded-xl px-5 py-4 flex items-center gap-4">
          <p className="text-[36px] font-extrabold text-[#3674B5] leading-none tabular-nums">{avgVal.toFixed(1)}</p>
          <div>
            <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} className={`h-5 w-5 ${s <= Math.round(avgVal) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />)}</div>
            <p className="text-xs text-[#3674B5]/70 mt-1">เฉลี่ยจาก {total.toLocaleString()} คะแนน</p>
          </div>
        </div>
        {dist.length > 0 && (
          <>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[.06em]">การกระจายคะแนน</p>
            <div className="space-y-2">
              {dist.map(({ star, count }) => (
                <div key={star} className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1 w-10 flex-shrink-0 justify-end">
                    <span className="text-sm font-semibold text-gray-600">{star}</span>
                    <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="flex-1 h-3 bg-[#F0F4F8] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.round((count / maxCount) * 100)}%`, background: 'linear-gradient(90deg,#3674B5,#498AC3)' }} />
                  </div>
                  <span className="text-xs text-gray-400 w-12 text-right flex-shrink-0">{count > 0 ? `${count} คน` : '—'}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderText = (key: string) => {
    if (!formResp) return null;
    const answers = formResp.responses
      .filter(r => r[key]?.trim() && !isRatingValue(r[key]))
      .map(r => ({ text: r[key], gender: r['gender'] ?? '', age: r['age_group'] ?? '' }));
    if (answers.length === 0) return <div className="flex flex-col items-center justify-center py-14 text-gray-300"><MessageSquare className="h-10 w-10 mb-2" /><p className="text-sm">ยังไม่มีคำตอบ</p></div>;
    return (
      <div className="space-y-2.5">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[.06em]">คำตอบทั้งหมด ({answers.length})</p>
        {answers.map((a, i) => (
          <div key={i} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3">
            <p className="text-[13px] text-gray-700 leading-relaxed">{a.text}</p>
            {(a.gender || a.age) && (
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {a.gender && <span className="text-[10px] font-medium bg-[#F0F4F8] text-gray-500 px-2 py-0.5 rounded-md">{GENDER_TH[a.gender] ?? a.gender}</span>}
                {a.age && <span className="text-[10px] font-medium bg-[#F0F4F8] text-gray-500 px-2 py-0.5 rounded-md">{a.age}</span>}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full flex flex-col overflow-hidden"
          style={{ maxWidth: '740px', maxHeight: '90vh' }}
          onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#3674B5,#498AC3)' }}>
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-[16px] font-bold text-gray-900">ผลสรุปแบบสอบถาม</h2>
                <p className="text-xs text-gray-400">วิเคราะห์ความพึงพอใจจากผู้เข้าร่วมงาน</p>
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
              <X className="w-4 h-4" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="h-6 w-6 text-[#3674B5] animate-spin" />
            </div>
          ) : (
            <>
              {/* Stat strip */}
              <div className="grid grid-cols-3 divide-x divide-[#F0F4F8] border-b border-[#F0F4F8] flex-shrink-0">
                <div className="py-3 text-center"><p className="text-[18px] font-bold text-[#3674B5]">{allQuestions.length}</p><p className="text-xs text-gray-400 mt-0.5">คำถาม</p></div>
                <div className="py-3 text-center"><p className="text-[18px] font-bold text-green-600">{totalResponses.toLocaleString()}</p><p className="text-xs text-gray-400 mt-0.5">ผู้ตอบ</p></div>
                <div className="py-3 text-center"><p className="text-[18px] font-bold text-[#3674B5]">{allQuestions.filter(q => q.type === 'rating').length}</p><p className="text-xs text-gray-400 mt-0.5">คำถาม Rating</p></div>
              </div>

              {allQuestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-300">
                  <FileText className="h-12 w-12 mb-3" /><p className="text-sm font-medium text-gray-400">ยังไม่มีข้อมูลผลสรุป</p>
                </div>
              ) : (
                <div className="flex flex-1 overflow-hidden min-h-0">
                  {/* Sidebar */}
                  <div className="w-[188px] flex-shrink-0 border-r border-[#F0F4F8] bg-[#FAFBFC] overflow-y-auto p-3">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[.07em] px-1 mb-2">คำถาม</p>
                    {allQuestions.map(q => {
                      const active = q.key === selectedKey;
                      return (
                        <button key={q.key} onClick={() => setSelectedKey(q.key)}
                          className={`w-full text-left px-2.5 py-2.5 rounded-xl mb-1 flex items-start gap-2 transition-colors ${active ? 'bg-[#EBF3FC]' : 'hover:bg-gray-100'}`}>
                          <span className={`flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold mt-0.5 ${active ? 'bg-[#3674B5] text-white' : 'bg-[#E2E8F0] text-gray-500'}`}>{q.key}</span>
                          <div className="min-w-0">
                            <p className={`text-[11px] font-semibold leading-snug line-clamp-2 ${active ? 'text-[#3674B5]' : 'text-gray-700'}`}>{q.title}</p>
                            <span className={`inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded mt-1 ${q.type === 'rating' ? 'bg-[#FEF3C7] text-amber-600' : 'bg-[#EBF3FC] text-[#3674B5]'}`}>
                              {q.type === 'rating' ? '★ Rating' : '✎ Text'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {/* Content */}
                  <div className="flex-1 overflow-y-auto p-5">
                    {selectedQ && (
                      <>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[.06em] mb-4">{selectedQ.title}</p>
                        {selectedQ.type === 'rating' ? renderRating(selectedQ.key) : renderText(selectedQ.key)}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
                <button onClick={onClose}
                  className="w-full py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition">
                  ปิด
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}