// src/features/events/components/PublishReadinessSection.tsx
'use client';

interface PublishReadinessSectionProps {
  hasTickets: boolean;
  hasBooths: boolean;
  onGoToTickets: () => void;
  onGoToBooth: () => void;
}

interface CheckItemProps {
  done: boolean;
  label: string;
  actionLabel?: string;
  onAction?: () => void;
}

function CheckItem({ done, label, actionLabel, onAction }: CheckItemProps) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3 bg-white rounded-xl border transition-all ${
        done ? 'border-emerald-200' : 'border-red-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-[22px] h-[22px] rounded-[6px] flex items-center justify-center flex-shrink-0 ${
            done ? 'bg-emerald-100' : 'bg-red-100'
          }`}
        >
          {done ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          )}
        </div>
        <span className="text-[13px] font-semibold text-gray-700">{label}</span>
      </div>

      {done ? (
        <span className="text-[11px] font-bold text-emerald-600">เรียบร้อย</span>
      ) : (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-[11px] font-bold transition"
        >
          {actionLabel}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      )}
    </div>
  );
}

export function PublishReadinessSection({
  hasTickets,
  hasBooths,
  onGoToTickets,
  onGoToBooth,
}: PublishReadinessSectionProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-start gap-4">

        {/* Icon */}
        <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-bold text-gray-900 mb-1">ยังไม่สามารถเผยแพร่งานได้</h3>
          <p className="text-[13px] text-gray-500 mb-3">กรุณาดำเนินการให้ครบก่อนเผยแพร่งาน</p>

          <div className="flex flex-col gap-2">
            <CheckItem
              done={hasBooths}
              label="สร้างบูธอย่างน้อย 1 บูธ"
              actionLabel="ไปสร้างบูธ"
              onAction={onGoToBooth}
            />
            <CheckItem
              done={hasTickets}
              label="สร้างประเภทตั๋วอย่างน้อย 1 ประเภท"
              actionLabel="ไปสร้างตั๋ว"
              onAction={onGoToTickets}
            />
          </div>
        </div>
      </div>
    </div>
  );
}