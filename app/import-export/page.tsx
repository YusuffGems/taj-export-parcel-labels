import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { ImportWizard } from "@/components/import-export/import-wizard";
import { ExportPanel } from "@/components/import-export/export-panel";
import { BackupPanel } from "@/components/import-export/backup-panel";

export const metadata: Metadata = { title: "Import / Export" };

export default function Page() {
  return (
    <>
      <PageHeader title="Import / Export" description="Bring customers in from CSV or Excel, export them, or back up everything." />
      <div className="space-y-5">
        <ImportWizard />
        <ExportPanel />
        <BackupPanel />
      </div>
    </>
  );
}
