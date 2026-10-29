import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import CookiePreferencesButton from "@/components/privacy/CookiePreferencesButton";

/**
 * VERSÃO PRELIMINAR para revisão jurídica.
 * Enquanto PRIVACY_POLICY_DRAFT for true, a página mostra um aviso de versão
 * preliminar e não é indexada. Pendências em docs/privacidade-pendencias.md.
 */
export const PRIVACY_POLICY_DRAFT = true;
export const PRIVACY_POLICY_UPDATED_AT = "29 de outubro de 2026";

const CONTROLLER = {
  name: "ALGORITMUX LTDA",
  tradeName: "Algoritmux",
  cnpj: "42.324.675/0001-36",
  email: "contato@guilhermecorreia.com.br",
  site: "guilhermecorreia.com.br",
};

const sectionClass = "mt-10";
const h2Class = "text-xl font-bold text-foreground";
const pClass = "mt-3 leading-relaxed text-muted-foreground";
const listClass = "mt-3 list-disc space-y-2 pl-5 leading-relaxed text-muted-foreground";
const tableClass = "mt-4 w-full border-collapse text-left text-sm";
const thClass = "border border-border bg-muted px-3 py-2 font-semibold text-foreground";
const tdClass = "border border-border px-3 py-2 align-top text-muted-foreground";

function Email() {
  return (
    <a href={`mailto:${CONTROLLER.email}`} className="font-medium text-foreground underline underline-offset-4">
      {CONTROLLER.email}
    </a>
  );
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SEO
        title="Política de Privacidade"
        description="Como a Algoritmux trata os dados pessoais coletados no site guilhermecorreia.com.br, uso de cookies e direitos dos titulares."
        path="/privacidade"
        noindex={PRIVACY_POLICY_DRAFT}
      />

      <article className="mx-auto w-full max-w-3xl px-5 py-10 sm:py-14">
        <Link to="/" className="text-sm text-muted-foreground hover:underline">
          &larr; Voltar para o site
        </Link>

        <h1 className="mt-6 text-3xl font-bold sm:text-4xl">Política de Privacidade</h1>
        <p className="mt-2 text-sm text-muted-foreground">Última atualização: {PRIVACY_POLICY_UPDATED_AT}</p>
        <section className={sectionClass}>
          <h2 className={h2Class}>1. Quem é responsável pelos seus dados</h2>
          <p className={pClass}>
            A controladora dos dados pessoais tratados por meio do site {CONTROLLER.site} é a{" "}
            <strong className="text-foreground">{CONTROLLER.name}</strong> ({CONTROLLER.tradeName}), inscrita no CNPJ
            sob o nº {CONTROLLER.cnpj}.
          </p>
          <p className={pClass}>
            Dúvidas e solicitações sobre privacidade e proteção de dados são recebidas e atendidas pela Algoritmux pelo
            e-mail <Email />.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>2. Quais dados coletamos</h2>
          <ul className={listClass}>
            <li>
              <strong className="text-foreground">Formulário de contato:</strong> nome, e-mail, telefone (opcional),
              mensagem e serviço de interesse.
            </li>
            <li>
              <strong className="text-foreground">Formulário de acesso a materiais:</strong> nome, e-mail, telefone,
              cargo e o material solicitado.
            </li>
            <li>
              <strong className="text-foreground">Newsletter:</strong> nome (opcional) e e-mail.
            </li>
            <li>
              <strong className="text-foreground">Contexto do envio:</strong> junto com cada formulário registramos a
              página do site em que ele foi enviado. Se você tiver aceitado os cookies analíticos, registramos também a
              primeira página visitada na sessão e o site de origem (por exemplo, um buscador).
            </li>
            <li>
              <strong className="text-foreground">Preferência de marketing:</strong> nos formulários de contato e de
              materiais, se você marcar a opção de receber comunicações de marketing, registramos essa escolha e a data.
            </li>
            <li>
              <strong className="text-foreground">Navegação, somente com seu consentimento:</strong> páginas visitadas,
              tempo de visita, tipo de dispositivo e navegador, e localização aproximada, coletados pelo Google
              Analytics (ver seção 6).
            </li>
            <li>
              <strong className="text-foreground">Registros técnicos:</strong> como em qualquer site, o servidor de
              hospedagem registra dados técnicos de acesso, como endereço IP, data, hora e página acessada, para
              funcionamento e segurança.
            </li>
          </ul>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>3. Para que usamos e com qual base legal</h2>
          <p className={pClass}>
            Separamos o uso necessário para responder ao que você pediu do uso para comunicações de marketing. Enviar um
            formulário de contato ou de material não autoriza, por si só, o envio de campanhas.
          </p>
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>Finalidade</th>
                  <th className={thClass}>Dados</th>
                  <th className={thClass}>Base legal (LGPD)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={tdClass}>Responder à sua solicitação, entregar o material pedido e fazer o atendimento comercial</td>
                  <td className={tdClass}>Dados do formulário e contexto do envio</td>
                  <td className={tdClass}>Procedimentos preliminares a contrato, a seu pedido (art. 7º, V)</td>
                </tr>
                <tr>
                  <td className={tdClass}>Organizar oportunidades de negócio e segmentar contatos no CRM da Algoritmux</td>
                  <td className={tdClass}>Dados do formulário e contexto do envio</td>
                  <td className={tdClass}>Legítimo interesse (art. 7º, IX)</td>
                </tr>
                <tr>
                  <td className={tdClass}>Enviar a newsletter, conteúdos e campanhas de marketing por e-mail</td>
                  <td className={tdClass}>Nome e e-mail</td>
                  <td className={tdClass}>
                    Consentimento (art. 7º, I): inscrição na newsletter ou opção de marketing marcada no formulário
                  </td>
                </tr>
                <tr>
                  <td className={tdClass}>Medir a audiência do site e melhorar os conteúdos</td>
                  <td className={tdClass}>Dados de navegação (Google Analytics)</td>
                  <td className={tdClass}>Consentimento (art. 7º, I), dado no aviso de cookies</td>
                </tr>
                <tr>
                  <td className={tdClass}>Funcionamento, segurança e prevenção de fraudes</td>
                  <td className={tdClass}>Registros técnicos de acesso</td>
                  <td className={tdClass}>Cumprimento de obrigação legal (art. 7º, II) e legítimo interesse (art. 7º, IX)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className={pClass}>
            O consentimento para cookies analíticos não autoriza o envio de e-mails de marketing. São escolhas separadas.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>4. Quem tem acesso aos dados</h2>
          <p className={pClass}>
            Somente a Algoritmux acessa os contatos para fins operacionais e comerciais. Não vendemos dados pessoais.
          </p>
          <p className={pClass}>
            Para o site funcionar, alguns fornecedores técnicos tratam dados em nosso nome, apenas para prestar o
            serviço contratado:
          </p>
          <ul className={listClass}>
            <li>
              <strong className="text-foreground">Hospedagem (HostGator):</strong> armazena o site, o banco de dados e os
              registros técnicos de acesso.
            </li>
            <li>
              <strong className="text-foreground">Envio de e-mails e newsletter:</strong> ferramentas usadas para
              notificações internas de novos contatos e para o envio da newsletter.
            </li>
            <li>
              <strong className="text-foreground">Google Analytics (Google):</strong> medição de audiência, somente com
              seu consentimento.
            </li>
            <li>
              <strong className="text-foreground">Google Fonts (Google):</strong> fornece a fonte usada no site. Ao
              carregar a página, o navegador solicita a fonte aos servidores do Google, que recebem dados técnicos como
              o endereço IP.
            </li>
          </ul>
          <p className={pClass}>
            Também podemos compartilhar dados quando exigido por lei ou por ordem de autoridade competente.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>5. Transferência internacional</h2>
          <p className={pClass}>
            Alguns fornecedores, como o Google, podem tratar dados em servidores localizados fora do Brasil. Nesses
            casos, a transferência segue as hipóteses previstas na LGPD.
          </p>
        </section>

        <section className={sectionClass} id="cookies">
          <h2 className={h2Class}>6. Cookies e tecnologias semelhantes</h2>
          <p className={pClass}>
            Cookies são pequenos arquivos guardados no seu navegador; o armazenamento local e o da sessão funcionam de
            forma parecida. Usamos apenas duas categorias. Os itens analíticos ficam desativados até você aceitar, e
            você pode mudar sua escolha a qualquer momento.
          </p>
          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>Nome</th>
                  <th className={thClass}>Categoria</th>
                  <th className={thClass}>Finalidade</th>
                  <th className={thClass}>Duração</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={tdClass}>gc_consent (armazenamento local)</td>
                  <td className={tdClass}>Necessário</td>
                  <td className={tdClass}>Guardar sua escolha sobre cookies</td>
                  <td className={tdClass}>12 meses, depois perguntamos de novo</td>
                </tr>
                <tr>
                  <td className={tdClass}>sidebar:state</td>
                  <td className={tdClass}>Necessário</td>
                  <td className={tdClass}>Lembrar se o menu lateral da Biblioteca está aberto ou fechado</td>
                  <td className={tdClass}>7 dias</td>
                </tr>
                <tr>
                  <td className={tdClass}>admin_user (armazenamento local)</td>
                  <td className={tdClass}>Necessário</td>
                  <td className={tdClass}>Manter o login no painel administrativo, apenas para administradores</td>
                  <td className={tdClass}>Até sair do painel</td>
                </tr>
                <tr>
                  <td className={tdClass}>_ga e _ga_8PJTEYT1PV</td>
                  <td className={tdClass}>Analítico (opcional)</td>
                  <td className={tdClass}>Google Analytics: distinguir visitantes e sessões para medir a audiência</td>
                  <td className={tdClass}>Até 2 anos</td>
                </tr>
                <tr>
                  <td className={tdClass}>gc_attribution (armazenamento da sessão)</td>
                  <td className={tdClass}>Analítico (opcional)</td>
                  <td className={tdClass}>Lembrar a primeira página visitada e o site de origem durante a visita</td>
                  <td className={tdClass}>Até fechar a aba</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className={pClass}>
            Não usamos cookies de publicidade. Os sinais de anúncios e de personalização publicitária do Google ficam
            desativados.
          </p>
          <p className={pClass}>
            Você também pode bloquear ou apagar cookies nas configurações do seu navegador. O site continua funcionando
            sem cookies analíticos.
          </p>
          <div className="mt-4">
            <CookiePreferencesButton className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted" />
          </div>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>7. Por quanto tempo guardamos</h2>
          <ul className={listClass}>
            <li>
              <strong className="text-foreground">Contatos comerciais</strong> (formulários de contato e de materiais):
              6 meses, salvo quando a conservação for necessária para cumprir obrigação legal ou exercer direitos.
            </li>
            <li>
              <strong className="text-foreground">Newsletter e CRM:</strong> o prazo de conservação está em definição e
              será informado nesta política.
            </li>
            <li>
              <strong className="text-foreground">Cookies:</strong> pelos prazos indicados na seção 6.
            </li>
          </ul>
          <p className={pClass}>Ao fim do prazo, os dados são eliminados ou anonimizados.</p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>8. Newsletter e comunicações de marketing</h2>
          <p className={pClass}>
            Os contatos da newsletter podem ser organizados e segmentados no CRM da Algoritmux para gerenciar o
            relacionamento e as campanhas. Você pode cancelar a qualquer momento pelo link de cancelamento nos e-mails
            ou escrevendo para <Email />. Também pode se opor ao uso dos seus dados para fins comerciais ou pedir a
            exclusão pelo mesmo e-mail.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>9. Seus direitos</h2>
          <p className={pClass}>Pela LGPD (art. 18), você pode pedir:</p>
          <ul className={listClass}>
            <li>confirmação de que tratamos seus dados e acesso a eles;</li>
            <li>correção de dados incompletos, inexatos ou desatualizados;</li>
            <li>anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade;</li>
            <li>portabilidade dos dados;</li>
            <li>eliminação dos dados tratados com base no seu consentimento;</li>
            <li>informação sobre com quem compartilhamos seus dados;</li>
            <li>informação sobre a possibilidade de não consentir e suas consequências;</li>
            <li>revogação do consentimento;</li>
            <li>oposição a tratamento feito com base em outras hipóteses legais, quando houver descumprimento da LGPD.</li>
          </ul>
          <p className={pClass}>
            Para exercer seus direitos, escreva para <Email />. Você também pode apresentar reclamação à Autoridade
            Nacional de Proteção de Dados (ANPD).
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>10. Segurança</h2>
          <p className={pClass}>
            Adotamos medidas técnicas e administrativas para proteger os dados, como conexão criptografada (HTTPS) e
            acesso ao painel administrativo restrito a contas autorizadas.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={h2Class}>11. Alterações desta política</h2>
          <p className={pClass}>
            Podemos atualizar esta política. A data da última atualização fica no topo da página. Quando a mudança
            afetar o uso de cookies, pediremos sua escolha novamente.
          </p>
        </section>
      </article>
    </main>
  );
}
