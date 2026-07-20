import { resolveAllEspaces } from "@/lib/espaces";
import EspaceDirectory from "./EspaceDirectory";

// Broker-facing directory: reflects admin visibility toggles immediately.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Espaces disponibles | Snapdesk",
  description: "Parcourez l'ensemble des espaces de bureaux Snapdesk disponibles pour les brokers.",
};

export default async function EspacesDirectoryPage() {
  const all = await resolveAllEspaces();

  const visible = all
    .filter((espace) => espace.brokerDirectoryVisible !== false)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return <EspaceDirectory espaces={visible} />;
}
