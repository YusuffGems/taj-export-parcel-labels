import type { SenderAddress } from "@/types/printing";
import type { AppSettings } from "@/types/settings";

export const APP_NAME = "TAJ EXPORT";
export const APP_VERSION = "1.0.0";

export const DEFAULT_SENDER: SenderAddress = {
  name: "TAJ EXPORT",
  businessName: "",
  mobile: "",
  address1: "477Q+MWJ, Singara Thottam 3rd St",
  address2: "Singara Garden, Old Washermenpet",
  area: "",
  city: "Chennai",
  state: "Tamil Nadu",
  pin: "600021",
};

export const EMPTY_SENDER: SenderAddress = {
  name: "",
  businessName: "",
  mobile: "",
  address1: "",
  address2: "",
  area: "",
  city: "",
  state: "",
  pin: "",
};

export const DEFAULT_SETTINGS: AppSettings = {
  businessName: "TAJ EXPORT",
  businessAddress:
    "477Q+MWJ, Singara Thottam 3rd St, Singara Garden, Old Washermenpet, Chennai, Tamil Nadu – 600021",
  businessMobile: "",
  businessEmail: "",
  defaultSenderMode: "default",
  customSender: EMPTY_SENDER,
  showCutLine: true,
  fontScale: 1,
  paperSize: "A4",
  theme: "light",
  lastBackupAt: null,
};

export const LEGACY_STORAGE_KEY = "taj-export-customers-v1";
export const MIGRATED_FLAG_KEY = "taj-export-migrated-v1";
export const THEME_KEY = "taj-theme";
