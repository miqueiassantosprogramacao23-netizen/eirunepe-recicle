# Eirunepé Recicla REEE

Protótipo comunitário e educativo de logística reversa de resíduos de equipamentos eletroeletrônicos (REEE) para Eirunepé-AM. A plataforma demonstra solicitação, voucher simbólico, mapa, rastreio, interesse de parceiros, métricas e preparação segura de aparelhos.

> **Importante:** este projeto não é serviço oficial de coleta, não tem parceria confirmada com Correios, IFAM, marcas, transportadoras ou operadores ambientais. O voucher é simbólico/educacional, não é etiqueta oficial nem comprova postagem ou reciclagem. Pontos, endereços, coordenadas, horários, status e métricas são exemplos a confirmar.

## Requisitos

- Node.js 20.19+ (ou 22.12+) e npm
- Acesso à internet para baixar dependências e os tiles do OpenStreetMap

## Executar localmente

```bash
npm install
npm run dev
```

Abra a URL exibida pelo Vite. O projeto não requer backend nem chaves de API para os fluxos demonstrativos.

## Scripts

```bash
npm run dev       # desenvolvimento
npm run build     # verificação TypeScript e build de produção
npm run preview   # pré-visualização do build
npm run lint      # ESLint
npm run format    # Prettier
npm run test      # testes Vitest + Testing Library
```

## Funcionalidades

- Wizard de solicitação em quatro etapas, rascunho local, alerta de bateria e voucher simbólico com QR Code.
- Lista e mapa OpenStreetMap com filtro, localização aproximada e link externo de rota.
- Busca de códigos locais e código demonstrativo com timeline simulada.
- Cadastro de interesse de parceiros com validação local de CPF/CNPJ; documentos são validados e não persistidos integralmente. Cadastros permanecem pendentes.
- Dashboard com série mockada, seletor de período e exportação CSV.
- Checklist persistente no navegador, alerta de segurança para baterias e FAQ legal/educacional.
- Navegação desktop e inferior mobile com seis áreas; privacidade resumida e estados responsivos.

## Estrutura

```text
src/
  App.tsx
  features/
    Education.tsx
    Overview.tsx
    Partners.tsx
    PointCard.tsx
    Points.tsx
    RequestWizard.tsx
    Tracking.tsx
    TrackingTimeline.tsx
    components.test.tsx
  mocks/seed.ts
  services/storage.ts
  store/useAppStore.ts
  styles/app.css
  test/setup.ts
  types/index.ts
  utils/domain.ts
  utils/domain.test.ts
public/
.env.example
eslint.config.js
index.html
package.json
postcss.config.js
tailwind.config.ts
tsconfig*.json
vite.config.ts
```

## Dados, privacidade e estimativas

O estado é guardado em `localStorage` neste navegador, sem envio de rede. Solicitações contêm dados de formulário e parceiros guardam campos de contato; use somente dados fictícios. O CPF/CNPJ é usado para validar dígitos em memória e não é gravado completo. Limpe os dados do site no navegador para removê-los.

O QR Code contém um payload compacto com código, data, id do ponto e checksum simples; o checksum não é assinatura criptográfica nem prova de autenticidade. Códigos são sequenciais apenas dentro do armazenamento local, não há garantia de unicidade entre dispositivos.

Os fatores de impacto do código são aproximações educativas: peso por categoria entre 0,05 kg e 0,35 kg por item; CO₂ equivalente = peso × 2,4 kg/kg; água potencialmente protegida = peso × 38 L/kg; metais = peso × 0,012 g/kg. São parâmetros ilustrativos, não fatores oficiais nem medição, laudo ou certificação. Os números iniciais do dashboard são uma série de demonstração e não são somados às solicitações locais.

## Legislação e fontes

As referências são informativas e não constituem aconselhamento jurídico nem declaração de conformidade. A Política Nacional de Resíduos Sólidos é estabelecida pela Lei nº 12.305/2010. O Decreto nº 10.240/2020 trata da implementação de sistema de logística reversa de produtos eletroeletrônicos de uso doméstico e seus componentes. A LGPD é a Lei nº 13.709/2018.

**Consulte sempre o texto vigente no Portal da Legislação/Planalto e normas municipais/estaduais aplicáveis.** Confirme o escopo dos dispositivos com assessoria responsável antes de usar em operação real.

## Como validar informações oficiais

1. Confirme endereço, horário, acessibilidade e categorias aceitas diretamente com o responsável por cada local.
2. Solicite autorização formal antes de publicar instituição como ponto ou parceira.
3. Verifique a situação e licença do operador ambiental e documente a cadeia de custódia.
4. Confira legislação e regras municipais/estaduais em fontes oficiais atualizadas.
5. Revise avisos de privacidade, base legal, retenção e segurança com responsável legal e encarregado de dados.
6. Audite fatores e resultados ambientais por metodologia técnica verificável.
7. Teste os fluxos de teclado, leitores de tela, contraste e dispositivos reais com usuários.

## Pendências para virar serviço real

- Integração Correios/transportadora, com contrato e autorização técnica; nenhum endpoint está implementado.
- Contrato com operador ambiental licenciado e evidências de destinação.
- Validação de pontos físicos, endereços, horários, coordenadas, categorias e acessibilidade.
- Política de privacidade revisada por responsável legal, base legal definida, backend seguro e controles de retenção.
- Métricas auditadas por metodologia técnica e fontes rastreáveis.
- Acessibilidade testada com usuários reais e tecnologias assistivas.
- Backend de autenticação/autorização, auditoria, rate limiting, proteção antiabuso e estratégia de consentimento, se necessário.

## Variáveis para evolução

Copie `.env.example` para `.env.local` quando for integrar serviços. As variáveis são apenas placeholders: nenhuma chamada aos Correios ou API própria é executada neste protótipo. O mapa usa tiles públicos do OpenStreetMap, sujeitos à política de uso do provedor.

## Deploy no Vercel

O arquivo `vercel.json` reescreve as rotas do React Router (`/painel`, `/solicitar`, `/pontos`, `/rastreio`, `/parceiros` e `/educacao`) para `index.html`, permitindo abrir ou atualizar diretamente essas URLs. `public/robots.txt` permite rastreamento geral e aponta para `public/sitemap.xml`.

Esses arquivos não contornam Deployment Protection, autenticação, firewall ou regras de bot do projeto Vercel. Como o conteúdo das páginas é renderizado no navegador, crawlers que não executam JavaScript podem ler apenas o shell inicial. Para indexação consistente por mecanismos e agentes que não executam JavaScript, será necessário prerenderização/SSR, por exemplo com uma camada de geração estática.
