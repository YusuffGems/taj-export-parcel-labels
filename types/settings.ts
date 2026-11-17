import type { SenderAddress, SenderMode } from "./printing";

export interface AppSettings {
  businessName: string;
  businessAddress: string;
  businessMobile: string;
  businessEmail: string;
  defaultSenderMode: SenderMode;
  customSender: SenderAddress;
  showCutLine: boolean;
  fontScale: number;
  paperSize: "A4";
  theme: "light" | "dark";
  lastBackupAt: string | null;
}
