// src/components/layout/DashboardSidebar.tsx
'use client';
import { ConfirmModal } from '@/src/components/ui/ConfirmModal';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEventStore } from '@/src/features/events/store/eventStore';
import { useLoadEvents } from '@/src/features/events/hooks/useLoadEvent';
import { JoinExpoModal } from '@/src/features/events/components/JoinExpoModal';
import { useAuthStore } from '@/src/features/auth/store/authStore';

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Icons ────────────────────────────────────────────────────
const IcHome     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IcCalendar = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcBooth    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>;
const IcSearch   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const IcDoc      = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const IcMail     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const IcLogout   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IcChevron  = ({ open }: { open: boolean }) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`ml-auto opacity-60 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"/></svg>;
const IcPlus     = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcKey      = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;

// ─── Reusable pieces ──────────────────────────────────────────

// เส้นคั่น
const Divider = () => <div className="my-2 border-t border-white/[0.12]" />;

// เมนูหลัก (nav-level)
function NavItem({ icon, label, href, active, onClick, children, open, onToggle }: {
  icon: React.ReactNode; label: string;
  href?: string; active?: boolean; onClick?: () => void;
  children?: React.ReactNode; open?: boolean; onToggle?: () => void;
}) {
  const cls = `flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
    ${active ? 'bg-white/[0.18] text-white' : 'text-white/75 hover:bg-white/[0.1] hover:text-white'}`;

  if (children !== undefined) {
    return (
      <div>
        <button className={cls} onClick={onToggle}>
          {icon}<span>{label}</span><IcChevron open={!!open} />
        </button>
        {open && <div className="mt-0.5">{children}</div>}
      </div>
    );
  }
  if (href) return <Link href={href} onClick={onClick} className={cls}>{icon}<span>{label}</span></Link>;
  return <button className={cls} onClick={onClick}>{icon}<span>{label}</span></button>;
}

// sub-link ใต้ dropdown
function SubLink({ label, href, active, onClick }: { label: string; href: string; active?: boolean; onClick?: () => void }) {
  return (
    <Link href={href} onClick={onClick}
      className={`flex items-center gap-2 w-full pl-[2.2rem] pr-3 py-2 rounded-lg text-sm transition-colors
        ${active ? 'bg-white/[0.14] text-white font-medium' : 'text-white/55 hover:bg-white/[0.08] hover:text-white/90'}`}
    >
      <span className="w-1 h-1 rounded-full bg-current opacity-50 flex-shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

// ปุ่ม action — มี background ชัด เห็นว่าเป็น "ปุ่ม"
function ActionBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg
        bg-white/[0.12] border border-white/[0.15]
        hover:bg-white/[0.2] hover:border-white/[0.25]
        text-white/80 hover:text-white
        text-xs font-medium transition-all"
    >
      {icon}<span>{label}</span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
export function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();

  const [eventsOpen,    setEventsOpen]    = useState(true);
  const [boothOpen,     setBoothOpen]     = useState(true);
  const [joinExpoModal, setJoinExpoModal] = useState(false);

  const { user }  = useAuthStore();
  const userRole  = user?.Role;

  useLoadEvents();
  const { organizedEvents } = useEventStore();

  // TODO: เปลี่ยนเมื่อ API พร้อม
  const hasBoothGlobal = false;
  const boothName      = 'ABC Tech Booth';
  const eventsJoined: { id: string; name: string }[] = [];

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const go = (path: string) => { router.push(path); onClose(); };
  const handleLogout = () => setShowLogoutConfirm(true);
  const handleConfirmLogout = () => { window.location.href = '/login'; };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/40 z-20" onClick={onClose} />}

      <aside className={`
        fixed top-14 left-0 h-[calc(100vh-3.5rem)] w-56
        bg-[#3674B5] z-30 flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>

        {/* ── scroll area ── */}
        <nav className="flex-1 overflow-y-auto px-3 pt-4 pb-3 space-y-0.5">

          {/* ═══════ ORGANIZER ═══════ */}
          {userRole === 'organizer' && (
            <>
              <NavItem icon={<IcHome />} label="หน้าแรก"
                href="/home" active={pathname === '/home'} onClick={onClose} />

              <Divider />

              <NavItem icon={<IcSearch />} label="ค้นหาบูธ"
                href="/events/explore-booths"
                active={pathname === '/events/explore-booths'}
                onClick={onClose} />

              <Divider />

              {/* งานของฉัน dropdown */}
              <NavItem
                icon={<IcCalendar />} label="งานของฉัน"
                open={eventsOpen} onToggle={() => setEventsOpen(!eventsOpen)}
              >
                <div className="space-y-0.5 mb-2">
                  {/* รายการงาน */}
                  {organizedEvents.length > 0
                    ? organizedEvents.map((ev) => (
                        <SubLink key={ev.id} label={ev.name}
                          href={`/events/${ev.id}`}
                          active={pathname === `/events/${ev.id}`}
                          onClick={onClose} />
                      ))
                    : <p className="pl-[2.2rem] py-1.5 text-xs text-white/35">ยังไม่มีงาน</p>
                  }
                </div>

                {/* Action buttons */}
                <div className="space-y-1.5 pb-1">
                  <ActionBtn icon={<IcPlus />} label="สร้างงาน Expo"
                    onClick={() => go('/events/create')} />
                  <ActionBtn icon={<IcKey />} label="ใส่โค้ดเข้าร่วมงาน"
                    onClick={() => setJoinExpoModal(true)} />
                </div>
              </NavItem>
            </>
          )}

          {/* ═══════ BOOTH MANAGER ═══════ */}
          {userRole === 'booth_manager' && (
            <>
              {hasBoothGlobal ? (
                /* มีบูธแล้ว → dropdown */
                <NavItem
                  icon={<IcBooth />} label="บูธของฉัน"
                  open={boothOpen} onToggle={() => setBoothOpen(!boothOpen)}
                >
                  <div className="space-y-0.5 pb-1">
                    <SubLink label={boothName} href="/booths/my-booth"
                      active={pathname === '/booths/my-booth'} onClick={onClose} />
                    {eventsJoined.map((ev) => (
                      <SubLink key={ev.id} label={ev.name}
                        href={`/events/${ev.id}`}
                        active={pathname === `/events/${ev.id}`}
                        onClick={onClose} />
                    ))}
                  </div>
                </NavItem>
              ) : (
                /* ยังไม่มีบูธ */
                <>
                  <div className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-white/40 cursor-default">
                    <IcBooth /><span>บูธของฉัน</span>
                  </div>
                  <div className="space-y-1.5 pb-1">
                    <ActionBtn icon={<IcPlus />} label="สร้างบูธ"
                      onClick={() => go('/booths/create')} />
                    <ActionBtn icon={<IcKey />} label="ใส่รหัสเข้าร่วมบูธ"
                      onClick={() => go('/booths/my-booth')} />
                  </div>
                </>
              )}

              <Divider />

              <NavItem icon={<IcSearch />} label="ค้นหางาน Expo"
                href="/booths/explore-events"
                active={pathname.startsWith('/booths/explore-events')}
                onClick={onClose} />

              <Divider />

              <NavItem icon={<IcDoc />} label="คำขอของฉัน"
                href="/booths/my-applications"
                active={pathname === '/booths/my-applications'}
                onClick={onClose} />

              <NavItem icon={<IcMail />} label="คำเชิญที่ได้รับ"
                href="/booths/my-invitations"
                active={pathname === '/booths/my-invitations'}
                onClick={onClose} />
            </>
          )}
        </nav>

        {/* ── bottom ── */}
        <div className="px-3 py-3 border-t border-white/[0.12]">
          <NavItem icon={<IcLogout />} label="ออกจากระบบ" onClick={handleLogout} />
        </div>
      </aside>

      {joinExpoModal && <JoinExpoModal onClose={() => setJoinExpoModal(false)} />}
      <ConfirmModal
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmLogout}
        title="ออกจากระบบ"
        description="คุณต้องการออกจากระบบหรือไม่?"
        confirmLabel="ออกจากระบบ"
        confirmColor="#DC2626"
      />
    </>
  );
}