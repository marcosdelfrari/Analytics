import Link from "next/link";
import type { ReactNode } from "react";
import type { ShellMode } from "@/lib/shell-mode";

type GuideContentProps = {
  mode: ShellMode;
};

function DocSection({
  id,
  step,
  title,
  children,
}: {
  id: string;
  step?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-4 border border-border bg-surface"
    >
      <div className="border-b border-border px-4 py-3">
        <div className="flex flex-wrap items-baseline gap-2">
          {step && (
            <span className="font-mono text-[11px] text-muted">{step}</span>
          )}
          <h2 className="text-sm font-medium">{title}</h2>
        </div>
      </div>
      <div className="space-y-3 px-4 py-4 text-[13px] leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

function Tip({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-sm border border-border-subtle bg-surface-elevated px-3 py-2 text-[12px] leading-relaxed text-foreground">
      <span className="font-medium text-muted-foreground">Dica: </span>
      {children}
    </p>
  );
}

function InternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="font-medium text-foreground underline decoration-border underline-offset-2 hover:decoration-foreground"
    >
      {children}
    </Link>
  );
}

export function GuideContent({ mode }: GuideContentProps) {
  return (
    <div className="space-y-6">
      <header className="max-w-2xl">
        <p className="text-[11px] uppercase tracking-wider text-muted">Guia</p>
        <h2 className="mt-1 text-lg font-medium tracking-tight">
          Como usar o Lótus
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Passo a passo para instalar a coleta no site, alinhar URLs de campanha
          e acompanhar mídia paga junto com o tráfego real. Use o menu à esquerda
          (ou &quot;Menu&quot; no celular) para ir direto a cada área.
        </p>
      </header>

      <nav
        aria-label="Índice do guia"
        className="border border-border bg-surface px-4 py-3"
      >
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted">
          Nesta página
        </p>
        <ol className="mt-2 list-decimal space-y-1 pl-4 text-[13px] text-muted-foreground">
          <li>
            <a href="#visao-geral" className="hover:text-foreground">
              Visão geral
            </a>
          </li>
          <li>
            <a href="#script" className="hover:text-foreground">
              Instalar o script
            </a>
          </li>
          <li>
            <a href="#urls" className="hover:text-foreground">
              URLs e parâmetros nos anúncios
            </a>
          </li>
          {mode === "client" && (
            <>
              <li>
                <a href="#dashboard" className="hover:text-foreground">
                  Dashboard e relatórios
                </a>
              </li>
              <li>
                <a href="#campanhas" className="hover:text-foreground">
                  Campanhas
                </a>
              </li>
            </>
          )}
          {mode === "agency" && (
            <li>
              <a href="#agencia" className="hover:text-foreground">
                Painel da agência
              </a>
            </li>
          )}
          <li>
            <a href="#encurtador" className="hover:text-foreground">
              Encurtador
            </a>
          </li>
          <li>
            <a href="#dicas" className="hover:text-foreground">
              Dicas e boas práticas
            </a>
          </li>
        </ol>
      </nav>

      <DocSection id="visao-geral" step="01" title="Visão geral">
        <p>
          O Lótus reúne dois tipos de informação:{" "}
          <strong className="font-medium text-foreground">
            relatórios de mídia paga
          </strong>{" "}
          (Google Ads e Meta Ads, publicados pela equipe) e{" "}
          <strong className="font-medium text-foreground">
            coleta no site
          </strong>{" "}
          (visitas e eventos via script). Os números de anúncio e o tráfego do
          site aparecem juntos no dashboard quando o plano está ativo e há dados
          no período.
        </p>
        <p>
          Ordem recomendada na primeira configuração: instale o{" "}
          <InternalLink href="/rastreamento">Script</InternalLink>, cadastre os
          domínios permitidos, publique o tag no site, configure UTMs nos anúncios
          (use <InternalLink href="/parametros">Parâmetros</InternalLink> só como
          referência) e só então valide visitas em Script → Últimas coletas.
        </p>
      </DocSection>

      <DocSection id="script" step="02" title="Instalar o script no site">
        <p>
          Em <InternalLink href="/rastreamento">Script</InternalLink>, copie o
          snippet exclusivo da conta e cole no{" "}
          <code className="font-mono text-[12px] text-foreground">&lt;head&gt;</code>{" "}
          de todas as páginas do site (ou no template global do CMS).
        </p>
        <ol className="list-decimal space-y-2 pl-4">
          <li>
            Adicione cada domínio do site (com e sem{" "}
            <code className="font-mono text-[12px]">www</code>) em domínios
            permitidos — a coleta só aceita origens cadastradas.
          </li>
          <li>
            Publique o script e use o teste de instalação na mesma página para
            confirmar que a primeira visita chegou.
          </li>
          <li>
            Para botões importantes (WhatsApp, formulário, simulação), dispare{" "}
            <code className="font-mono text-[12px] text-foreground">
              lotus.track(&quot;nome_do_evento&quot;, {"{ ... }"})
            </code>{" "}
            depois que o script carregar; a campanha da sessão vai junto no
            evento.
          </li>
        </ol>
        <Tip>
          O script guarda na sessão os parâmetros da primeira URL (UTM, gclid,
          fbclid, gbraid, etc.). Se o visitante entrar sem parâmetros e navegar
          por páginas internas, a origem continua atribuída até fechar o navegador.
        </Tip>
      </DocSection>

      <DocSection id="urls" step="03" title="URLs e parâmetros nos anúncios">
        <p>
          UTMs e URL final são definidos no{" "}
          <strong className="font-medium text-foreground">Google Ads</strong> ou{" "}
          <strong className="font-medium text-foreground">Meta Ads</strong> — não
          no Lótus. A página{" "}
          <InternalLink href="/parametros">Parâmetros</InternalLink> monta um{" "}
          <em>exemplo</em> de URL para você copiar o formato correto.
        </p>
        <ul className="list-disc space-y-2 pl-4">
          <li>
            Mantenha{" "}
            <code className="font-mono text-[12px]">utm_source</code> alinhado à
            plataforma (ex.: google, meta) para os relatórios filtrarem certo.
          </li>
          <li>
            No Google, deixe o auto-tagging ligado:{" "}
            <code className="font-mono text-[12px]">gclid</code> e parâmetros
            relacionados chegam no clique sem digitar manualmente.
          </li>
          <li>
            No Meta, o{" "}
            <code className="font-mono text-[12px]">fbclid</code> vem do clique;
            complemente com UTMs no modelo de URL do anúncio quando fizer sentido.
          </li>
        </ul>
        <Tip>
          Teste sempre a URL final em uma aba anônima antes de escalar budget:
          confira se os parâmetros aparecem na barra de endereço na landing.
        </Tip>
      </DocSection>

      {mode === "client" && (
        <>
          <DocSection id="dashboard" step="04" title="Dashboard e relatórios">
            <p>
              O <InternalLink href="/dashboard">Dashboard</InternalLink> resume o
              período publicado: investimento, conversões e evolução, além do
              bloco de tráfego coletado pelo script (visitas e eventos).
            </p>
            <p>
              Em <InternalLink href="/relatorios">Relatórios</InternalLink>, você
              alterna Google Ads e Meta Ads. Cada aba mostra o relatório de mídia
              da plataforma e, abaixo, o tráfego do site filtrado por{" "}
              <code className="font-mono text-[12px]">utm_source</code> — útil
              para comparar o que a plataforma reporta com o que de fato chegou
              no site.
            </p>
            <Tip>
              Sem plano ativo ou sem publicação recente, as telas podem exibir
              demonstração ou ficar vazias; isso não significa que o script parou
              de coletar — veja Script → Últimas coletas.
            </Tip>
          </DocSection>

          <DocSection id="campanhas" step="05" title="Campanhas">
            <p>
              <InternalLink href="/campanhas">Campanhas</InternalLink> lista a
              hierarquia publicada: campanha → grupo de anúnsios → anúncio, por
              plataforma. Use para localizar nomes e IDs ao cruzar com UTMs ou
              com eventos no site.
            </p>
          </DocSection>
        </>
      )}

      {mode === "agency" && (
        <DocSection id="agencia" step="04" title="Painel da agência">
          <p>
            No <InternalLink href="/admin">Painel</InternalLink>, crie clientes,
            ative ou desative planos e publique relatórios de Google Ads ou Meta
            Ads para cada conta. Só depois da publicação os números aparecem no
            dashboard do cliente.
          </p>
          <p>
            Cada cliente tem script e chave próprios em{" "}
            <InternalLink href="/rastreamento">Script</InternalLink> quando acessa
            com a conta dele; no modo agência, você gerencia links e parâmetros
            nas mesmas telas de ferramentas.
          </p>
        </DocSection>
      )}

      <DocSection
        id="encurtador"
        step={mode === "client" ? "06" : "05"}
        title="Encurtador de links"
      >
        <p>
          <InternalLink href="/encurtador">Encurtador</InternalLink> gera atalhos
          no seu domínio para usar em bio, QR code ou materiais offline. Informe
          a URL de destino já com UTMs (montadas no ads ou copiadas do exemplo em
          Parâmetros) para não perder atribuição no clique.
        </p>
      </DocSection>

      <DocSection id="dicas" title="Dicas e boas práticas">
        <ul className="space-y-3">
          <li>
            <strong className="font-medium text-foreground">
              Nomenclatura de eventos:
            </strong>{" "}
            use nomes curtos e estáveis (
            <code className="font-mono text-[12px]">contato</code>,{" "}
            <code className="font-mono text-[12px]">ver_obra</code>) — facilita
            ler totais nos relatórios de tráfego.
          </li>
          <li>
            <strong className="font-medium text-foreground">
              Um domínio, uma chave:
            </strong>{" "}
            não reutilize o snippet de outra conta; cada cliente tem chave
            isolada.
          </li>
          <li>
            <strong className="font-medium text-foreground">
              SPA e tags atrasadas:
            </strong>{" "}
            se o site é single-page, garanta que o script rode no carregamento
            inicial; eventos customizados podem ir nos handlers dos botões.
          </li>
          <li>
            <strong className="font-medium text-foreground">
              Privacidade e plano:
            </strong>{" "}
            recursos completos dependem do plano contratado; dúvidas sobre
            limites aparecem na área de upgrade quando aplicável.
          </li>
        </ul>
        <p className="pt-1 text-[12px] text-muted">
          Precisa de ajuda humana? Entre em contato pelo canal indicado na landing
          ou fale com quem publica seus relatórios no painel da agência.
        </p>
      </DocSection>
    </div>
  );
}
