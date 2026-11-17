"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import type { AppSettings } from "@/types/settings";
import type { SenderMode } from "@/types/printing";
import { DEFAULT_SENDER } from "@/constants/business";
import { useSettings } from "@/hooks/use-customers";
import { useToast } from "@/hooks/use-toast";
import { saveSettings } from "@/lib/customer-storage";
import { buildSenderLines } from "@/lib/format";
import { isValidMobile } from "@/lib/customer-validation";
import { Button } from "@/components/common/button";
import { Card, PageHeader } from "@/components/common/page-header";
import { LoadingState } from "@/components/common/empty-state";
import { inputClass, TextField } from "@/components/common/text-field";
import { SenderFields } from "@/components/printing/sender-fields";
import { BackupPanel } from "@/components/import-export/backup-panel";
import { DataManagement } from "./data-management";

export function SettingsView() {
  const { settings, loading } = useSettings();
  const { toast } = useToast();
  const [draft, setDraft] = useState<AppSettings | null>(null);
  const [mobileError, setMobileError] = useState("");

  useEffect(() => { if (!loading && !draft) setDraft(settings); }, [loading, settings, draft]);
  if (!draft) return <LoadingState />;

  const patch = (p: Partial<AppSettings>) => setDraft((d) => (d ? { ...d, ...p } : d));

  async function save() {
    if (!draft) return;
    if (draft.businessMobile.trim() && !isValidMobile(draft.businessMobile)) { setMobileError("Enter a valid 10-digit mobile number."); return; }
    setMobileError("");
    await saveSettings(draft);
    toast("Settings saved.");
  }

  async function setTheme(theme: AppSettings["theme"]) {
    patch({ theme });
    await saveSettings({ theme });
  }

  return (
    <>
      <PageHeader title="Settings" actions={<Button variant="gold" onClick={save}><Save className="h-4 w-4" /> Save settings</Button>} />
      <div className="space-y-5">
        <Card title="Business information">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Business Name" value={draft.businessName} onChange={(v) => patch({ businessName: v })} />
            <TextField label="Business Mobile Number" value={draft.businessMobile} onChange={(v) => patch({ businessMobile: v })} error={mobileError} inputMode="tel" type="tel" />
            <TextField label="Business Email" value={draft.businessEmail} onChange={(v) => patch({ businessEmail: v })} type="email" inputMode="email" />
            <TextField label="Business Address" value={draft.businessAddress} onChange={(v) => patch({ businessAddress: v })} multiline className="sm:col-span-2" />
          </div>
          <div className="mt-4 rounded-lg border border-line bg-bg p-3 text-sm">
            <div className="font-medium text-fg">Default sender address</div>
            <div className="text-muted">{buildSenderLines(DEFAULT_SENDER).join(", ")}</div>
          </div>
        </Card>

        <Card title="Printing">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="paper" className="mb-1 block text-sm font-medium text-fg">Default paper size</label>
              <select id="paper" className={inputClass} value={draft.paperSize} onChange={() => patch({ paperSize: "A4" })}><option value="A4">A4 portrait (2 labels per page)</option></select>
            </div>
            <div>
              <label htmlFor="sender-mode" className="mb-1 block text-sm font-medium text-fg">Default FROM address</label>
              <select id="sender-mode" className={inputClass} value={draft.defaultSenderMode} onChange={(e) => patch({ defaultSenderMode: e.target.value as SenderMode })}>
                <option value="default">TAJ EXPORT default address</option>
                <option value="custom">Saved custom address</option>
                <option value="none">Hide FROM address</option>
              </select>
            </div>
            <div>
              <label htmlFor="scale" className="mb-1 block text-sm font-medium text-fg">Label text size</label>
              <select id="scale" className={inputClass} value={String(draft.fontScale)} onChange={(e) => patch({ fontScale: Number(e.target.value) })}>
                <option value="0.85">Smaller</option><option value="1">Standard</option><option value="1.15">Larger</option>
              </select>
            </div>
            <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium text-fg"><input type="checkbox" checked={draft.showCutLine} onChange={(e) => patch({ showCutLine: e.target.checked })} className="h-4 w-4 accent-[#c9a227]" /> Show dashed cutting line between labels</label>
          </div>
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium text-fg">Saved custom sender address</summary>
            <div className="mt-3"><SenderFields value={draft.customSender} onChange={(customSender) => patch({ customSender })} idPrefix="Saved" /></div>
          </details>
        </Card>

        <Card title="Appearance">
          <div className="flex gap-2">
            <Button variant={draft.theme === "light" ? "gold" : "outline"} onClick={() => setTheme("light")}>Light</Button>
            <Button variant={draft.theme === "dark" ? "gold" : "outline"} onClick={() => setTheme("dark")}>Dark</Button>
          </div>
        </Card>

        <BackupPanel />
        <DataManagement />
      </div>
    </>
  );
}
