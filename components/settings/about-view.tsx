"use client";

import { Download } from "lucide-react";
import { APP_NAME, APP_VERSION } from "@/constants/business";
import { useInstallPrompt } from "@/hooks/use-install-prompt";
import { Button } from "@/components/common/button";
import { Card, PageHeader } from "@/components/common/page-header";

export function AboutView() {
  const { canInstall, installed, install } = useInstallPrompt();
  return (
    <>
      <PageHeader title="About & Installation" description={`${APP_NAME} · Version ${APP_VERSION}`} />
      <div className="space-y-5">
        <Card title="Install as an app">
          {installed ? <p className="text-sm text-fg">TAJ EXPORT is installed and running as an app on this device.</p> : (
            <>
              {canInstall && <Button variant="gold" className="mb-4" onClick={install}><Download className="h-4 w-4" /> Install TAJ EXPORT</Button>}
              <div className="grid gap-4 text-sm text-fg md:grid-cols-2">
                <div><h3 className="font-semibold">Windows / macOS (Chrome or Edge)</h3><p className="text-muted">Click the install icon in the address bar (or menu → &quot;Install TAJ EXPORT&quot;). The app opens in its own window.</p></div>
                <div><h3 className="font-semibold">Android (Chrome)</h3><p className="text-muted">Menu (⋮) → &quot;Install app&quot; or &quot;Add to Home screen&quot;.</p></div>
                <div><h3 className="font-semibold">iPhone / iPad (Safari)</h3><p className="text-muted">Tap Share → &quot;Add to Home Screen&quot; → Add. (Safari is required on iOS.)</p></div>
                <div><h3 className="font-semibold">macOS (Safari)</h3><p className="text-muted">File → &quot;Add to Dock&quot;.</p></div>
              </div>
            </>
          )}
        </Card>
        <Card title="Offline use & your data">
          <ul className="list-disc space-y-1 pl-5 text-sm text-fg">
            <li>After the first load, the app works without internet: add, edit, search, print and export customers.</li>
            <li>Customer data is stored on this device only (IndexedDB). Nothing is sent to any server.</li>
            <li>Data is not shared between devices. Use <b>Backup</b> on one device and <b>Restore</b> on another.</li>
            <li>Clearing browser data or uninstalling the app can delete your customers — keep regular backups.</li>
            <li>This is an installable web app (PWA), not an App Store / Google Play app.</li>
          </ul>
        </Card>
        <Card title="Printing two addresses on one A4 page">
          <p className="text-sm text-muted">Printing → select customers → Print selected → choose FROM address → Preview → Print. In the print dialog use A4, Portrait, margins None, scale 100%, Background graphics on. 1 customer = 1 page, 2 = 1 page, 3 = 2 pages, and so on.</p>
        </Card>
      </div>
    </>
  );
}
