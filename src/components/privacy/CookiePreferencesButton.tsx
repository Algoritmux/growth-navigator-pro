import { openConsentPreferences } from "@/lib/consent";

/** Reabre o aviso de cookies para o visitante mudar ou retirar a escolha. */
export default function CookiePreferencesButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={openConsentPreferences} className={className}>
      Preferências de cookies
    </button>
  );
}
