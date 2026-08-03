import { getSettings } from "@/actions/settings.actions";
import { SettingsForm } from "@/components/admin/settings-form";
import { PageHeader } from "@/components/ui/page-header";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-6 animate-fade-up max-w-3xl">
      <PageHeader
        eyebrow="Configurações gerais"
        title="Configurações"
        description="Ajuste as informações do evento, funcionalidades ativas e mensagens automáticas."
      />
      <SettingsForm settings={settings} />
    </div>
  );
}
