'use client';

import { useState } from 'react';
import { Printer, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getKids } from '@/lib/data';
import type { Kid } from '@/lib/types';

const CLASSES = ['discoverer', 'explorer', 'adventurer', 'warrior'] as const;
const HOUSES = ['Red', 'Blue', 'Green', 'Yellow'] as const;

const HOUSE_HEX: Record<string, string> = {
  Red: '#ef4444', Blue: '#3b82f6', Green: '#22c55e', Yellow: '#eab308',
};
const CLASS_HEX: Record<string, string> = {
  discoverer: '#8b5cf6', explorer: '#f59e0b', adventurer: '#10b981', warrior: '#ef4444',
};

function initials(kid: Kid) {
  return `${kid.firstName[0] ?? ''}${kid.lastName[0] ?? ''}`.toUpperCase();
}

function generateRosterHTML(kids: Kid[], title: string, subtitle: string): string {
  const date = new Date().toLocaleDateString('en-SG', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const fallbackSvg = (kid: Kid, houseColor?: string) => {
    const color = houseColor ? HOUSE_HEX[houseColor] : '#6366f1';
    const bg = color + '22';
    const text = initials(kid);
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Ccircle cx='60' cy='60' r='60' fill='${encodeURIComponent(bg)}'/%3E%3Ctext x='60' y='75' text-anchor='middle' font-family='system-ui' font-size='40' font-weight='700' fill='${encodeURIComponent(color)}'%3E${text}%3C/text%3E%3C/svg%3E`;
  };

  const cards = kids.map(kid => {
    const ringColor = kid.houseColor ? HOUSE_HEX[kid.houseColor] : '#e2e8f0';
    const classBg = kid.className ? (CLASS_HEX[kid.className] + '18') : '';
    const classColor = kid.className ? CLASS_HEX[kid.className] : '#64748b';
    const fb = fallbackSvg(kid, kid.houseColor);
    return `
      <div class="card">
        <div class="photo-wrap" style="border-color:${ringColor}">
          <img src="${kid.photoUrl || fb}" alt="${kid.firstName}" onerror="this.src='${fb}'" />
        </div>
        <div class="name">${kid.firstName}<br><span>${kid.lastName}</span></div>
        <div class="badges">
          ${kid.className ? `<span class="badge class-badge" style="background:${classBg};color:${classColor}">${kid.className}</span>` : ''}
          ${kid.houseColor ? `<span class="badge house-badge"><span class="dot" style="background:${HOUSE_HEX[kid.houseColor]}"></span>${kid.houseColor}</span>` : ''}
        </div>
      </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title} — MightyKidz</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #fff;
    color: #1e293b;
    padding: 24px 32px;
  }

  /* ── Header ── */
  .header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    border-bottom: 3px solid #1e293b;
    padding-bottom: 14px;
    margin-bottom: 28px;
  }
  .header-left .org { font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #64748b; }
  .header-left .title { font-size: 26px; font-weight: 800; line-height: 1.15; color: #0f172a; margin-top: 2px; }
  .header-left .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
  .header-right { text-align: right; }
  .header-right .count { font-size: 32px; font-weight: 800; color: #0f172a; line-height: 1; }
  .header-right .count-label { font-size: 11px; color: #94a3b8; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; }
  .header-right .date { font-size: 11px; color: #94a3b8; margin-top: 6px; }

  /* ── Grid ── */
  .grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 18px 14px;
  }

  /* ── Card ── */
  .card {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .photo-wrap {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    border: 3px solid #e2e8f0;
    overflow: hidden;
    margin-bottom: 8px;
    flex-shrink: 0;
  }
  .photo-wrap img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .name {
    font-size: 12.5px;
    font-weight: 700;
    line-height: 1.3;
    color: #0f172a;
  }
  .name span { font-weight: 500; color: #334155; }
  .badges {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 3px;
    margin-top: 5px;
  }
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 9.5px;
    font-weight: 600;
    padding: 1.5px 6px;
    border-radius: 99px;
    text-transform: capitalize;
    white-space: nowrap;
  }
  .house-badge { background: #f1f5f9; color: #475569; }
  .dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

  /* ── Footer ── */
  .footer {
    margin-top: 32px;
    padding-top: 12px;
    border-top: 1px solid #e2e8f0;
    font-size: 10px;
    color: #94a3b8;
    display: flex;
    justify-content: space-between;
  }

  /* ── Print button (hidden when printing) ── */
  .print-bar {
    position: fixed;
    bottom: 24px;
    right: 24px;
    display: flex;
    gap: 10px;
    z-index: 999;
  }
  .print-btn {
    background: #0f172a;
    color: #fff;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,.25);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .print-btn:hover { background: #1e293b; }

  @media print {
    body { padding: 0; }
    .print-bar { display: none !important; }
    .header { border-bottom-color: #000; }
    .footer { border-top-color: #cbd5e1; }
  }
  @page { margin: 14mm 12mm; size: A4 portrait; }
</style>
</head>
<body>

<div class="header">
  <div class="header-left">
    <div class="org">MightyKidz Ministry</div>
    <div class="title">${title}</div>
    <div class="subtitle">${subtitle}</div>
  </div>
  <div class="header-right">
    <div class="count">${kids.length}</div>
    <div class="count-label">Students</div>
    <div class="date">${date}</div>
  </div>
</div>

<div class="grid">${cards}</div>

<div class="footer">
  <span>MightyKidz Ministry Management — Confidential</span>
  <span>Generated ${date}</span>
</div>

<div class="print-bar">
  <button class="print-btn" onclick="window.print()">
    🖨️ Print / Save as PDF
  </button>
</div>

</body>
</html>`;
}

export function RosterDialog() {
  const [open, setOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedHouse, setSelectedHouse] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleGenerate() {
    setLoading(true);
    try {
      const allKids = await getKids();

      let filtered = allKids;
      if (selectedClass !== 'all') filtered = filtered.filter(k => k.className === selectedClass);
      if (selectedHouse !== 'all') filtered = filtered.filter(k => k.houseColor === selectedHouse);

      if (filtered.length === 0) {
        toast({ variant: 'destructive', title: 'No Students Found', description: 'No students match the selected filters.' });
        return;
      }

      // Build a readable title
      const classLabel = selectedClass !== 'all'
        ? selectedClass.charAt(0).toUpperCase() + selectedClass.slice(1) + ' Class'
        : null;
      const houseLabel = selectedHouse !== 'all' ? selectedHouse + ' House' : null;
      const title = [classLabel, houseLabel].filter(Boolean).join(' — ') || 'All Students';
      const subtitle = [classLabel && `Class: ${classLabel}`, houseLabel && `House: ${houseLabel}`].filter(Boolean).join(' · ') || 'All classes and houses';

      const html = generateRosterHTML(filtered, title, subtitle);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, '_blank');
      if (!win) {
        toast({ variant: 'destructive', title: 'Popup Blocked', description: 'Please allow popups for this site.' });
      }
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      setOpen(false);
    } catch {
      toast({ variant: 'destructive', title: 'Failed', description: 'Could not generate the roster.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Printer className="mr-2 h-4 w-4" />
        Roster
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Download Student Roster</DialogTitle>
            <DialogDescription>
              Choose a class and/or house to filter. Leave as "All" to include everyone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {CLASSES.map(c => (
                    <SelectItem key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">House</label>
              <Select value={selectedHouse} onValueChange={setSelectedHouse}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Houses</SelectItem>
                  {HOUSES.map(h => (
                    <SelectItem key={h} value={h}>
                      <span className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: HOUSE_HEX[h] }} />
                        {h} House
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
            <Button onClick={handleGenerate} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Roster
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
