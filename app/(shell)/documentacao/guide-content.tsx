import Link from "next/link";
import type { ReactNode } from "react";

function DocSection({
  id,
  step,
  title,
  audience,
  children,
}: {
  id: string;
  step?: string;
  title: string;
  audience?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-4 overflow-hidden rounded-2xl border border-border bg-surface"
    >
      <div className="border-b border-border px-5 py-3.5">
        <div className="flex flex-wrap items-baseline gap-2">
          {step && (
            <span className="font-mono text-[11px] text-muted">{step}</span>
          )}
          <h2 className="text-sm font-medium">{title}</h2>
          {audience && (
            <span className="rounded-md border border-border bg-background/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted">
              {audience}
            </span>
          )}
        </div>
      </div>
      <div className="space-y-3 px-5 py-4 text-[13px] leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

function Tip({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-border-subtle bg-surface-elevated px-3.5 py-2.5 text-[12px] leading-relaxed text-foreground">
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

export function GuideContent() {
  return (
    <div className="space-y-6">
      <header className="max-w-2xl">
        <p className="text-[11px] uppercase tracking-wider text-muted">Guia</p>
        <h2 className="mt-1 text-lg font-medium tracking-tight">
          Como usar o Fractal
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          O analista consulta e exporta os dados das empresas liberadas para a
          conta. O proprietário vê os mesmos números e é quem cadastra empresas,
          acessos, script, links e formulários. Use o menu à esquerda (ou
          &quot;Menu&quot; no celular) para ir direto a cada área.
        </p>
      </header>

      <nav
        aria-label="Índice do guia"
        className="rounded-2xl border border-border bg-surface px-5 py-4"
      >
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted">
          Nesta página
        </p>
        <ol className="mt-2 list-decimal space-y-1 pl-4 text-[13px] text-muted-foreground">
          <li>
            <a href="#papeis" className="hover:text-foreground">
              Analista e proprietário
            </a>
          </li>
          <li>
            <a href="#empresa" className="hover:text-foreground">
              Empresa ativa
            </a>
          </li>
          <li>
            <a href="#analista" className="hover:text-foreground">
              Ver e exportar dados
            </a>
          </li>
          <li>
            <a href="#dashboard" className="hover:text-foreground">
              Dashboard, relatórios e campanhas
            </a>
          </li>
          <li>
            <a href="#leads" className="hover:text-foreground">
              Leads capturados
            </a>
          </li>
          <li>
            <a href="#organizacao" className="hover:text-foreground">
              Empresas e acessos
            </a>
          </li>
          <li>
            <a href="#script" className="hover:text-foreground">
              Script, pixel e parâmetros
            </a>
          </li>
          <li>
            <a href="#formularios" className="hover:text-foreground">
              Formulários e encurtador
            </a>
          </li>
          <li>
            <a href="#dicas" className="hover:text-foreground">
              Dicas
            </a>
          </li>
        </ol>
      </nav>

      <DocSection
        id="papeis"
        step="01"
        title="Analista e proprietário"
        audience="os dois papéis"
      >
        <p>
          Na organização, o cadastro chama esses papéis de{" "}
          <strong className="font-medium text-foreground">usuário comum</strong>{" "}
          e{" "}
          <strong className="font-medium text-foreground">proprietário</strong>.
          No menu, o usuário comum aparece como analista.
        </p>
        <p>
          <strong className="font-medium text-foreground">Analista</strong> abre
          só leitura e exportação, nas empresas que o proprietário marcou para
          o e-mail dele:
        </p>
        <ul className="list-disc space-y-1.5 pl-4">
          <li>
            <InternalLink href="/dashboard">Dashboard</InternalLink>,{" "}
            <InternalLink href="/relatorios">Relatórios</InternalLink> e{" "}
            <InternalLink href="/campanhas">Campanhas</InternalLink>
          </li>
          <li>
            <InternalLink href="/organizacao/leads">
              Leads capturados
            </InternalLink>{" "}
            dessas empresas
          </li>
          <li>
            Exportar CSV do relatório e dos leads, e baixar o arquivo publicado
            de mídia quando existir
          </li>
        </ul>
        <p>
          <strong className="font-medium text-foreground">Proprietário</strong>{" "}
          vê tudo isso em todas as empresas da organização e cadastra o que a
          conta usa:
        </p>
        <ul className="list-disc space-y-1.5 pl-4">
          <li>
            <InternalLink href="/organizacao">Empresas e acessos</InternalLink>
          </li>
          <li>
            <InternalLink href="/rastreamento">Script e Pixel</InternalLink>,{" "}
            <InternalLink href="/parametros">Parâmetros UTM</InternalLink> e{" "}
            <InternalLink href="/encurtador">Encurtador</InternalLink>
          </li>
          <li>
            <InternalLink href="/organizacao/formularios">
              Criar formulário
            </InternalLink>{" "}
            e{" "}
            <InternalLink href="/organizacao/formularios/instalar">
              Instalar formulário
            </InternalLink>
          </li>
        </ul>
      </DocSection>

      <DocSection
        id="empresa"
        step="02"
        title="Empresa ativa"
        audience="analista e proprietário"
      >
        <p>
          Com mais de uma empresa na conta, o seletor{" "}
          <strong className="font-medium text-foreground">Empresa ativa</strong>{" "}
          no topo do menu troca o contexto. Dashboard, relatórios, campanhas e
          a exportação passam a ser os da empresa escolhida.
        </p>
        <p>
          O analista só encontra as empresas liberadas para ele. O proprietário
          encontra todas as empresas da organização.
        </p>
      </DocSection>

      <DocSection
        id="analista"
        step="03"
        title="Ver e exportar dados"
        audience="analista e proprietário"
      >
        <p>
          As telas de análise são de consulta. Em{" "}
          <InternalLink href="/relatorios">Relatórios</InternalLink>,{" "}
          <strong className="font-medium text-foreground">Exportar CSV</strong>{" "}
          baixa o resumo de mídia, a evolução, os relatórios publicados, o
          tráfego do site e os eventos da empresa ativa. No histórico de cada
          plataforma, <strong className="font-medium text-foreground">Baixar</strong>{" "}
          entrega o arquivo publicado (planilha ou PDF) quando a equipe anexou
          um.
        </p>
        <p>
          Em{" "}
          <InternalLink href="/organizacao/leads">Leads capturados</InternalLink>
          , filtre por organização, formulário e empresa e use{" "}
          <strong className="font-medium text-foreground">Exportar CSV</strong>{" "}
          para levar data, formulário, empresa, página, UTMs e os campos
          preenchidos. O analista exporta só as empresas da própria conta.
        </p>
        <Tip>
          Com plano gratuito, a mídia pode aparecer como demonstração. A coluna
          &quot;base&quot; do CSV marca cada linha como demonstração ou
          publicado.
        </Tip>
      </DocSection>

      <DocSection
        id="dashboard"
        step="04"
        title="Dashboard, relatórios e campanhas"
        audience="analista e proprietário"
      >
        <p>
          O <InternalLink href="/dashboard">Dashboard</InternalLink> resume o
          período da empresa ativa: investimento, conversões, CTR, custo por
          conversão, evolução e os cartões de Google Ads e Meta Ads. A coleta
          do site (visitas e eventos) entra no topo quando o script já está
          publicando.
        </p>
        <p>
          Em <InternalLink href="/relatorios">Relatórios</InternalLink>, as abas
          separam Google Ads e Meta Ads. Cada uma mostra o tráfego filtrado por{" "}
          <code className="font-mono text-[12px]">utm_source</code> e o
          relatório de mídia. Abaixo, a visão geral junta todas as origens.
        </p>
        <p>
          <InternalLink href="/campanhas">Campanhas</InternalLink> lista a
          estrutura publicada: campanha, grupo de anúncios e anúncio, com
          status (ativa, pausada ou aprendizado), investimento, cliques e
          conversões.
        </p>
      </DocSection>

      <DocSection
        id="leads"
        step="05"
        title="Leads capturados"
        audience="analista e proprietário"
      >
        <p>
          A lista mostra quando o envio chegou, o formulário, a empresa, os
          campos e a página de origem. O analista vê os leads das empresas
          liberadas. O proprietário vê os leads de todas as empresas da
          organização e, no topo da página, volta para os formulários para
          ajustar o cadastro.
        </p>
      </DocSection>

      <DocSection
        id="organizacao"
        step="06"
        title="Empresas e acessos"
        audience="proprietário"
      >
        <p>
          Em <InternalLink href="/organizacao">Empresas e acessos</InternalLink>{" "}
          o proprietário monta quem entra em cada empresa. Quem gerencia mais
          de uma organização troca o nome no topo da página.
        </p>
        <ul className="list-disc space-y-2 pl-4">
          <li>
            Arraste uma empresa até um usuário (ou o contrário) no fluxo visual
            para conceder o acesso.
          </li>
          <li>
            Inclua uma empresa pelo nome. A tabela mostra o plano (ativo ou
            gratuito) e quais usuários já abrem aquela conta.
          </li>
          <li>
            Inclua um analista com nome e e-mail. Marque todas as empresas ou
            só as que ele deve consultar. Depois, clique nos nomes na linha dele
            para incluir ou tirar o acesso.
          </li>
          <li>
            O proprietário permanece com acesso total. Analistas podem ser
            removidos da organização.
          </li>
        </ul>
        <Tip>
          O analista passa a ver a empresa no seletor do menu assim que o
          acesso é salvo. Peça para atualizar a página se o nome ainda não
          aparecer.
        </Tip>
      </DocSection>

      <DocSection
        id="script"
        step="07"
        title="Script, pixel e parâmetros"
        audience="proprietário"
      >
        <p>
          Em <InternalLink href="/rastreamento">Script e Pixel</InternalLink>, a
          chave é da empresa ativa. Cadastre ao menos um domínio autorizado
          (subdomínios entram junto) e cole o snippet no{" "}
          <code className="font-mono text-[12px] text-foreground">
            &lt;head&gt;
          </code>{" "}
          do site. Eventos de botão usam{" "}
          <code className="font-mono text-[12px] text-foreground">
            fractal.track(&quot;nome_do_evento&quot;, {"{ ... }"})
          </code>
          . O teste confere a tag no HTML e espera a visita (até 2 minutos).
          Últimas coletas lista o que chegou.
        </p>
        <p>
          <InternalLink href="/parametros">Parâmetros UTM</InternalLink> monta
          um exemplo de URL para copiar no Google Ads ou no Meta Ads: origem,
          mídia, campanha, conteúdo, termo e identificadores de clique. Analistas
          e proprietários podem consultar essa página como referência; a URL
          final fica no anúncio. Mantenha{" "}
          <code className="font-mono text-[12px]">utm_source</code> alinhado à
          plataforma (google, meta, facebook ou instagram) para os relatórios
          separarem a origem.
        </p>
        <Tip>
          O script guarda na sessão os parâmetros da primeira URL. O analista
          acompanha visitas e eventos no dashboard e nos relatórios, sem
          precisar abrir o cadastro do script.
        </Tip>
      </DocSection>

      <DocSection
        id="formularios"
        step="08"
        title="Formulários e encurtador"
        audience="proprietário"
      >
        <p>
          Em{" "}
          <InternalLink href="/organizacao/formularios">
            Criar formulário
          </InternalLink>
          , o assistente pede nome e formato (botão de WhatsApp, popup ou saída
          da página), textos, campos, personalização opcional e ativação. Os
          campos podem ser texto, e-mail, telefone, texto longo, seleção,
          checkbox ou número. Dá para ligar o formulário a uma empresa e enviar
          um e-mail de confirmação.
        </p>
        <p>
          Em{" "}
          <InternalLink href="/organizacao/formularios/instalar">
            Instalar formulário
          </InternalLink>
          , escolha o formulário ativo e copie o script para o site. Formulário
          ativo é o que gera o snippet.
        </p>
        <p>
          <InternalLink href="/encurtador">Encurtador</InternalLink> cria
          atalhos da empresa ativa para bio, QR code ou material offline.
          Informe o destino já com UTMs, um nome e, se quiser, um código curto.
          A lista mostra cliques e permite copiar ou remover o atalho.
        </p>
      </DocSection>

      <DocSection id="dicas" title="Dicas">
        <ul className="space-y-3">
          <li>
            <strong className="font-medium text-foreground">
              Uma empresa, uma chave:
            </strong>{" "}
            o proprietário troca a empresa ativa antes de copiar o script ou
            criar um link curto.
          </li>
          <li>
            <strong className="font-medium text-foreground">
              Nomes de evento estáveis:
            </strong>{" "}
            rótulos curtos (
            <code className="font-mono text-[12px]">contato</code>,{" "}
            <code className="font-mono text-[12px]">ver_obra</code>) aparecem
            legíveis na exportação e nos relatórios.
          </li>
          <li>
            <strong className="font-medium text-foreground">
              Acesso a outra empresa:
            </strong>{" "}
            o analista pede ao proprietário para marcar a empresa em Empresas e
            acessos. A partir daí ele consulta e exporta os dados dela.
          </li>
        </ul>
      </DocSection>
    </div>
  );
}
