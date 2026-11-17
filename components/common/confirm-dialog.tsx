"use client";

import { useState, type ReactNode } from "react";
import { Modal } from "./modal";
import { Button } from "./button";

interface Props {
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  /** When set, the user must type this word before the destructive action is enabled. */
  requireText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmDialog({ title, message, confirmLabel = "Delete", requireText, onConfirm, onCancel }: Props) {
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const blocked = Boolean(requireText) && typed.trim() !== requireText;

  return (
    <Modal title={title} onClose={onCancel} size="sm"
      footer={<>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button variant="danger" disabled={blocked || busy} onClick={async () => { setBusy(true); try { await onConfirm(); } finally { setBusy(false); } }}>{confirmLabel}</Button>
      </>}>
      <div className="space-y-3 text-sm">
        <div>{message}</div>
        {requireText && (
          <label className="block">
            <span className="mb-1 block text-muted">Type <b>{requireText}</b> to confirm</span>
            <input value={typed} onChange={(e) => setTyped(e.target.value)} className="w-full rounded-lg border border-line bg-input px-3 py-2" autoFocus />
          </label>
        )}
      </div>
    </Modal>
  );
}
