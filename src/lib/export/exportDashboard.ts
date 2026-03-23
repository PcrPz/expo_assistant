// src/lib/export/exportDashboard.ts
/**
 * Export Dashboard → PDF
 * ใช้ html-to-image แทน html2canvas
 */

export async function exportDashboardPDF(
  elementId: string,
  title: string = 'Dashboard'
): Promise<void> {
  const [{ toPng }, { default: jsPDF }] = await Promise.all([
    import('html-to-image'),
    import('jspdf'),
  ]);

  const el = document.getElementById(elementId);
  if (!el) {
    console.error(`Element #${elementId} not found`);
    return;
  }

  // ── ซ่อนปุ่ม Download ชั่วคราว แต่ยัง occupy space ไว้
  // ใช้ opacity แทน visibility เพื่อไม่ให้ layout เปลี่ยน
  const noPrintEls = el.querySelectorAll<HTMLElement>('[data-no-print]');
  noPrintEls.forEach(e => {
    e.dataset.origOpacity = e.style.opacity;
    e.style.opacity = '0';
  });

  // ── เพิ่ม padding ด้านบนชั่วคราวเพื่อให้ header แสดงครบ
  const origPadding = el.style.paddingTop;
  el.style.paddingTop = '16px';

  try {
    const dataUrl = await toPng(el, {
      quality: 1,
      pixelRatio: 2,
      backgroundColor: '#F9FAFB',
      // ขยาย capture area ให้ครอบ scroll content ทั้งหมด
      width:  el.scrollWidth,
      height: el.scrollHeight,
      style: {
        overflow: 'visible',
        maxHeight: 'none',
      },
    });

    const img = new Image();
    await new Promise<void>(resolve => {
      img.onload = () => resolve();
      img.src = dataUrl;
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfW     = pdf.internal.pageSize.getWidth();   // 210mm
    const pdfH     = pdf.internal.pageSize.getHeight();  // 297mm
    const margin   = 10; // mm
    const contentW = pdfW - margin * 2;
    const contentH = pdfH - margin * 2;

    // scale factor: mm per pixel
    const scale    = contentW / img.width;
    const totalImgH = img.height * scale; // total height in mm

    // ── Smart page break ─────────────────────────────────────
    // หา section boundaries จาก DOM เพื่อไม่ให้ตัดกลาง card
    const sectionEls = el.querySelectorAll<HTMLElement>(
      '[class*="rounded-2xl"], [class*="rounded-xl"], [class*="bg-white"]'
    );

    // เก็บ top position (mm) ของทุก section
    const elRect    = el.getBoundingClientRect();
    const breakPoints: number[] = [0];

    sectionEls.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      const topMM = (rect.top - elRect.top) * scale * (img.width / el.scrollWidth);
      const botMM = (rect.bottom - elRect.top) * scale * (img.width / el.scrollWidth);
      if (botMM > 0 && topMM < totalImgH) {
        breakPoints.push(topMM);
        breakPoints.push(botMM);
      }
    });
    breakPoints.push(totalImgH);

    // ── สร้าง pages โดยใช้ natural break points ──────────────
    let pageStart = 0;

    while (pageStart < totalImgH - 0.5) {
      if (pageStart > 0) pdf.addPage();

      // หา break point ที่ดีที่สุด ห่างจาก pageStart ไม่เกิน contentH
      const maxEnd = pageStart + contentH;

      let pageEnd = maxEnd;
      if (pageEnd < totalImgH) {
        // หา break point ที่อยู่ใกล้ maxEnd มากที่สุดโดยไม่เกิน
        const candidates = breakPoints.filter(p => p > pageStart && p <= maxEnd);
        if (candidates.length > 0) {
          pageEnd = Math.max(...candidates);
        }
        // ถ้าไม่มี candidate ดี ใช้ maxEnd เลย
        if (pageEnd <= pageStart) pageEnd = maxEnd;
      } else {
        pageEnd = totalImgH;
      }

      const actualPageH = pageEnd - pageStart;

      // crop ส่วนนี้ออกมาจาก full image
      const srcY  = (pageStart / totalImgH) * img.height;
      const srcH  = (actualPageH / totalImgH) * img.height;

      const pageCanvas = document.createElement('canvas');
      pageCanvas.width  = img.width;
      pageCanvas.height = Math.ceil(srcH);
      const ctx = pageCanvas.getContext('2d');
      ctx?.drawImage(img, 0, srcY, img.width, srcH, 0, 0, img.width, srcH);

      pdf.addImage(
        pageCanvas.toDataURL('image/png'),
        'PNG',
        margin, margin,
        contentW, Math.min(actualPageH, contentH)
      );

      pageStart = pageEnd;
    }

    const safeName = title.replace(/[^a-zA-Z0-9ก-๙]/g, '_').slice(0, 40);
    pdf.save(`Dashboard_${safeName}.pdf`);

  } finally {
    // restore
    noPrintEls.forEach(e => {
      e.style.opacity = e.dataset.origOpacity ?? '';
      delete e.dataset.origOpacity;
    });
    el.style.paddingTop = origPadding;
  }
}