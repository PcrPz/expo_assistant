// src/app/(protected)/events/[eventId]/edit/page.tsx
import EditEventClient from "@/src/features/events/components/edit/EditEventClient";

// ✅ ไม่ต้องส่ง props แล้ว
export default function EditEventPage() {
  return <EditEventClient />;
}