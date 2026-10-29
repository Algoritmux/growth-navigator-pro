import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

/**
 * Avisos de privacidade e opção de marketing dos formulários.
 *
 * A política abre em nova aba para não perder o que já foi preenchido.
 * A opção de marketing é separada do envio, opcional e começa desmarcada:
 * enviar um contato não autoriza campanhas, e o consentimento de cookies
 * analíticos também não.
 */

function PolicyLink() {
  return (
    <a href="/privacidade" target="_blank" rel="noopener" className="underline underline-offset-2 hover:text-foreground">
      Política de Privacidade
    </a>
  );
}

export function ContactPrivacyNotice({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs leading-relaxed text-muted-foreground", className)}>
      Usamos seus dados para responder à sua solicitação e fazer o atendimento comercial, conforme a <PolicyLink />.
    </p>
  );
}

export function NewsletterPrivacyNotice({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs leading-relaxed text-muted-foreground", className)}>
      Sem spam. Ao se inscrever, você recebe nossos conteúdos por e-mail e seu contato pode ser organizado no CRM da
      Algoritmux. Cancele quando quiser. Veja a <PolicyLink />.
    </p>
  );
}

export function MarketingOptIn({
  id,
  checked,
  onCheckedChange,
}: {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Checkbox
        id={id}
        name="marketing_opt_in"
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        className="mt-0.5"
      />
      <label htmlFor={id} className="text-xs leading-relaxed text-muted-foreground">
        Quero receber conteúdos e comunicações de marketing da Algoritmux por e-mail (opcional). Posso cancelar quando
        quiser.
      </label>
    </div>
  );
}
