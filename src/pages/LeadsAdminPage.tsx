import { useEffect, useMemo, useState } from "react";
import { Mail, Phone, RefreshCw, Search, Users } from "lucide-react";
import AdminHeader from "@/components/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  fetchLeads,
  fetchNewsletterSubscribers,
  updateLeadStatus,
  type Lead,
  type LeadStatus,
  type NewsletterSubscriber,
} from "@/lib/leadsApi";

const LEAD_STATUS_OPTIONS: Array<{ value: LeadStatus; label: string }> = [
  { value: "novo", label: "Novo" },
  { value: "contatado", label: "Contatado" },
  { value: "convertido", label: "Convertido" },
  { value: "descartado", label: "Descartado" },
];

function formatDate(value: string) {
  if (!value) return "-";

  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function LeadsAdminPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null);

  async function refresh() {
    setIsLoading(true);

    try {
      const [nextLeads, nextSubscribers] = await Promise.all([
        fetchLeads(),
        fetchNewsletterSubscribers(),
      ]);

      setLeads(nextLeads);
      setSubscribers(nextSubscribers);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Não foi possível carregar os leads.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleStatusChange(lead: Lead, status: LeadStatus) {
    if (lead.status === status) return;

    const previousStatus = lead.status;
    setUpdatingLeadId(lead.id);
    setLeads((current) =>
      current.map((item) => (item.id === lead.id ? { ...item, status } : item))
    );

    try {
      await updateLeadStatus(lead.id, status);
    } catch (error) {
      setLeads((current) =>
        current.map((item) => (item.id === lead.id ? { ...item, status: previousStatus } : item))
      );
      console.error(error);
      alert(error instanceof Error ? error.message : "Não foi possível atualizar o status.");
    } finally {
      setUpdatingLeadId(null);
    }
  }

  const filteredLeads = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return leads;

    return leads.filter((lead) =>
      [
        lead.name,
        lead.email,
        lead.phone,
        lead.service,
        lead.source,
        lead.status,
        lead.message,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [leads, query]);

  const filteredSubscribers = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return subscribers;

    return subscribers.filter((subscriber) =>
      [subscriber.name, subscriber.email, subscriber.source]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [subscribers, query]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <AdminHeader />

      <header className="border-b bg-card mt-6 mx-auto max-w-6xl rounded-2xl border px-5 py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-bold">
              <Users className="h-6 w-6 text-primary" />
              Gestão de Leads
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Acompanhe solicitações de contato e inscrições da newsletter.
            </p>
          </div>

          <Button onClick={refresh} disabled={isLoading} className="gap-2 rounded-xl">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-5 py-10">
        <div className="mb-6 flex items-center gap-2 rounded-xl border bg-background px-3 py-2 md:max-w-md">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nome, e-mail, serviço..."
            className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border bg-card p-5">
            <div className="text-sm text-muted-foreground">Leads</div>
            <div className="mt-2 text-3xl font-bold">{leads.length}</div>
          </div>
          <div className="rounded-2xl border bg-card p-5">
            <div className="text-sm text-muted-foreground">Newsletter</div>
            <div className="mt-2 text-3xl font-bold">{subscribers.length}</div>
          </div>
          <div className="rounded-2xl border bg-card p-5">
            <div className="text-sm text-muted-foreground">Contatados</div>
            <div className="mt-2 text-3xl font-bold">
              {leads.filter((lead) => lead.status === "contatado").length}
            </div>
          </div>
          <div className="rounded-2xl border bg-card p-5">
            <div className="text-sm text-muted-foreground">Convertidos</div>
            <div className="mt-2 text-3xl font-bold">
              {leads.filter((lead) => lead.status === "convertido").length}
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border bg-card">
          <div className="border-b p-5">
            <h2 className="text-xl font-bold">Solicitações de contato</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Formulários enviados pelo site.
            </p>
          </div>

          <div className="divide-y">
            {isLoading ? (
              <div className="p-5 text-sm text-muted-foreground">Carregando leads...</div>
            ) : filteredLeads.length === 0 ? (
              <div className="p-5 text-sm text-muted-foreground">Nenhum lead encontrado.</div>
            ) : (
              filteredLeads.map((lead) => (
                <article key={lead.id} className="p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{lead.name}</h3>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {lead.email}
                        </span>
                        {lead.phone && (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {lead.phone}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground md:text-right">
                      <div>{formatDate(lead.created_at)}</div>
                      <label className="mt-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Status
                      </label>
                      <select
                        value={lead.status}
                        disabled={updatingLeadId === lead.id}
                        onChange={(event) => handleStatusChange(lead, event.target.value as LeadStatus)}
                        className="mt-1 h-9 rounded-lg border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                      >
                        {LEAD_STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                    <div>
                      <span className="font-medium">Serviço:</span> {lead.service || "-"}
                    </div>
                    <div>
                      <span className="font-medium">Origem:</span> {lead.source || "-"}
                    </div>
                    <div>
                      <span className="font-medium">Aceita marketing:</span>{" "}
                      {Number(lead.marketing_opt_in) === 1
                        ? `Sim${lead.marketing_opt_in_at ? ` (desde ${lead.marketing_opt_in_at})` : ""}`
                        : "Não"}
                    </div>
                  </div>

                  {lead.message && (
                    <p className="mt-4 rounded-xl bg-muted/50 p-4 text-sm leading-relaxed text-muted-foreground">
                      {lead.message}
                    </p>
                  )}
                </article>
              ))
            )}
          </div>
        </div>

        <div className="mt-8 rounded-2xl border bg-card">
          <div className="border-b p-5">
            <h2 className="text-xl font-bold">Inscritos na newsletter</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              E-mails capturados pelos formulários de inscrição.
            </p>
          </div>

          <div className="divide-y">
            {isLoading ? (
              <div className="p-5 text-sm text-muted-foreground">Carregando inscritos...</div>
            ) : filteredSubscribers.length === 0 ? (
              <div className="p-5 text-sm text-muted-foreground">Nenhum inscrito encontrado.</div>
            ) : (
              filteredSubscribers.map((subscriber) => (
                <article key={subscriber.id} className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="font-semibold">{subscriber.name || "Sem nome"}</h3>
                    <div className="mt-1 text-sm text-muted-foreground">{subscriber.email}</div>
                    <div className="mt-1 text-xs text-muted-foreground">Origem: {subscriber.source}</div>
                  </div>

                  <div className="text-sm text-muted-foreground md:text-right">
                    <div>{formatDate(subscriber.created_at)}</div>
                    <div className="mt-1">{Number(subscriber.is_active) === 1 ? "Ativo" : "Inativo"}</div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
