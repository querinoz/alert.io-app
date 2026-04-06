# Alert.io — Plataforma de Segurança Comunitária

Aplicação multiplataforma de segurança comunitária construída com **React Native + Expo**, com mapeamento de incidentes em tempo real, câmeras públicas ao vivo, proteção familiar, e análise de credibilidade por IA. Funciona em **Web**, **iOS** e **Android**.

> **Idioma padrão**: Português (Brasil) — com opções para English, Español e Deutsch.

## Plataformas Suportadas

| Plataforma | Motor de Mapa | Como Executar |
|------------|--------------|---------------|
| **Web** (Desktop / Mobile) | MapLibre GL JS + OpenFreeMap | `npx expo start --web` |
| **Android** | MapLibre GL JS (web view) | Expo Go / `npx expo start --android` |
| **iOS** | MapLibre GL JS (web view) | Expo Go / `npx expo start --ios` |

## Início Rápido

### Pré-requisitos

- **Node.js 20+** — [nodejs.org](https://nodejs.org)
- **Expo Go** — Instale no telemóvel via App Store / Google Play (para testes mobile)

### Instalação

```bash
cd attention-app
npm install
```

Se ocorrerem conflitos de versão:

```bash
npx expo install --fix
```

### Executar a Aplicação

```bash
# Web — abre no navegador em http://localhost:8081
npx expo start --web --port 8081

# Mobile (modo LAN — escaneie QR com Expo Go)
npx expo start --lan --port 8081

# Landing page (separada)
npx serve -s -l 8080 ../alert-io
```

## Layout Desktop

Em ecrãs ≥ 768px, a app renderiza um **layout split-panel**:

- **Barra lateral esquerda** — Branding, perfil resumido do utilizador (nome, nível, badge, relatórios), botões de navegação (Chain, Família, Perfil, Condução, alert.io), feed ao vivo (5 incidentes em ciclo a cada 8s), lista de incidentes próximos com hover-to-highlight no mapa
- **Painel direito** — Mapa interativo MapLibre GL com tiles escuros, marcadores animados por categoria, tooltips flutuantes, popups glassmórficos, sobreposição de câmeras públicas e raio GuardScan

## Funcionalidades

### Mapa de Incidentes em Tempo Real
- Mapa temático escuro com MapLibre GL JS + OpenFreeMap
- Marcadores animados por categoria com emojis, indicadores de severidade e badges de verificação
- Tooltips flutuantes ao passar o rato (estáticos, sem escala)
- Popups com informação completa, votação e comentários
- Viewport culling e decluttering por grelha para performance
- Marcador do utilizador com animação glow (sempre no topo)

### Reporte e Verificação de Incidentes
- Fluxo guiado em 3 passos: categoria → detalhes → confirmação
- Sistema comunitário de confirmar/negar por votação
- Motor de credibilidade IA com scoring heurístico: qualidade textual, plausibilidade geográfica, referência cruzada, histórico do repórter, evidência fotográfica, recência temporal e autoridade da fonte
- Badges Verificado / Reporte Falso com indicadores visuais

### Integração de Dados Públicos
- Dados em tempo real de APIs de segurança pública (UK Police, DC Open Data, Portugal dados.gov.pt)
- Feed auto-atualizado a cada 30 segundos
- Scoring de credibilidade heurístico para cada reporte recebido

### Câmeras Públicas ao Vivo
- 22+ câmeras verificadas (YouTube Live embeds + MJPG streams)
- Sem chaves de API — 100% gratuito e aberto
- Sempre visíveis e fixas no mapa (sem culling ou escala)
- Tooltips ao hover com informação da câmera
- Clique para abrir visualizador de stream em tempo real com auto-refresh
- Classificação por tipo: trânsito, urbana, costeira, natureza

### Navegação & Modo Condução
- Navegação turn-by-turn com OSRM
- Deteção de câmeras de velocidade via Overpass API (OpenStreetMap)
- HUD modo condução: velocímetro, alertas de limite, avisos de incidentes próximos
- Pesquisa de endereço com geocodificação Nominatim

### GuardScan Radar
- Varredura visual em radar descobrindo incidentes em raio configurável (500m – 25km)
- **Circunferência visível no mapa** assim que o painel abre — atualiza em tempo real ao mudar raio
- Linha sólida verde + tracejada branca para máxima visibilidade
- Resultados animados com informação de distância/direção

### Sistema Chain
- Conecte membros com acesso direto à localização no mapa
- Rastreamento em tempo real de membros

### Família & Segurança
- Grupos familiares privados com códigos de convite e mapa partilhado
- Modo Criança: monitoramento de zona segura, botão SOS, rastreamento de bateria, alertas de violação de zona
- Partilha de localização via links temporários
- Modo Fantasma: ocultar do mapa público mantendo visibilidade familiar

### Sistema de Badges — 32 Níveis de Segurança

Todos os nomes focados em **segurança, vigilância, proteção e guardianismo**:

| Nível | Ícone | Nome (PT-BR) | Nome (EN) |
|-------|-------|-------------|-----------|
| 0 | 👀 | Observador Iniciante | Beginner observer |
| 1 | 👁️‍🗨️ | Vigia Desperto | Awakened watcher |
| 2 | 🧭 | Batedor Novato | Rookie scout |
| 3 | 📰 | Repórter de Rua | Street reporter |
| 4 | 🏘️ | Olheiro do Bairro | Neighborhood lookout |
| 5 | 🔦 | Ronda Noturna | Night patrol |
| 6 | 📡 | Vigia de Sinais | Signal watcher |
| 7 | 🗼 | Guarda da Torre | Tower guard |
| 8 | 🔩 | Sentinela de Ferro | Iron sentinel |
| 9 | 🚧 | Intendente de Rua | Street warden |
| 10 | 🌆 | Vigia da Cidade | City watchman |
| 11 | 👮 | Defensor da Lei | Law enforcer |
| 12 | 🕵️ | Agente de Campo | Field agent |
| 13 | 🦅 | Falcão Vigilante | Vigilant hawk |
| 14 | 🏛️ | Protetor do Distrito | District protector |
| 15 | 🛡️ | Porta-Escudo | Shield bearer |
| 16 | 🎯 | Observador Tático | Tactical observer |
| 17 | 📯 | Comandante de Zona | Zone commander |
| 18 | 🔮 | Oráculo da Segurança | Security oracle |
| 19 | 🔭 | Vigia de Elite | Elite watcher |
| 20 | 🥇 | Guardião de Ouro | Gold guardian |
| 21 | ⭐ | Sentinela Estelar | Star sentinel |
| 22 | 🦾 | Protetor Supremo | Supreme protector |
| 23 | 👑 | Guardião da Coroa | Crown warden |
| 24 | 📜 | Chefe da Vigília | Chief of watch |
| 25 | 🌟 | Guardião Lendário | Legendary guardian |
| 26 | 🧱 | Escudo Mítico | Mythic shield |
| 27 | ⚡ | Guardião do Trovão | Thunder guardian |
| 28 | 🕰️ | Sentinela Eterna | Eternal sentinel |
| 29 | ⭕ | Vigia Ômega | Omega watcher |
| 30 | 🏆 | Guardião Grão-Mestre | Grand master guardian |
| 31 | 🔐 | Guardião Supremo | Supreme guardian |

### Perfil Compacto com Tooltip
- Badge atual exibida no cabeçalho do perfil
- **Hover sobre o badge** abre janela flutuante glassmórfica com todos os 32 níveis em grelha compacta
- Nível atual destacado, badges bloqueadas atenuadas
- Informação resumida do perfil na barra lateral do mapa (nome, nível, relatórios, reputação)

### Acessibilidade

| Deficiência | Funcionalidades |
|-------------|----------------|
| **Visual** | Labels VoiceOver/TalkBack, modo Alto Contraste, Texto Grande, Orientação por Voz |
| **Motora** | Touch targets 48px+, feedback háptico, modo Movimento Reduzido |
| **Auditiva** | Alertas visuais, vibração háptica, notificações só texto |
| **Cognitiva** | Modo UI simplificado, fluxos passo-a-passo, navegação consistente |

### Tutorial In-App
- Guia interativo em 5 passos com overlay e destaques spotlight
- Aponta elementos-chave da UI e explica funcionalidade
- Dispensável, persiste estado de conclusão via localStorage

## Arquitetura

```
attention-app/
├── app/                              # Expo Router screens
│   ├── +html.tsx                     # Web HTML shell (tema escuro, animações)
│   ├── _layout.tsx                   # Navegação raiz + AuthGate (auto-login)
│   ├── (auth)/                       # Sign-in, Sign-up
│   ├── (tabs)/                       # Tabs principais
│   │   ├── index.tsx                 # Ecrã do mapa (sidebar responsiva/mobile)
│   │   ├── chain.tsx                 # Gestão de membros Chain
│   │   ├── family.tsx                # Grupos familiares & Modo Criança
│   │   ├── feed.tsx                  # Feed de atividade
│   │   ├── profile.tsx               # Perfil & badges com tooltip hover
│   │   └── scan.tsx                  # GuardScan
│   ├── incident/report.tsx           # Wizard de reporte em 3 passos
│   └── settings/                     # Configurações + acessibilidade
├── src/
│   ├── components/
│   │   ├── map/                      # AttentionMap (MapLibre GL JS)
│   │   ├── camera/                   # CameraViewer (streams ao vivo)
│   │   ├── ui/                       # GlassCard, NeonText, BadgeIcon, LogoMark, etc.
│   │   └── incident/                 # IncidentCard
│   ├── services/
│   │   ├── publicDataService.ts      # APIs de dados públicos
│   │   ├── cameraService.ts          # Agregação de câmeras (22+ verificadas)
│   │   ├── credibilityEngine.ts      # Motor IA de scoring
│   │   └── mockData.ts              # Dados mock & utilitários
│   ├── stores/                       # Zustand (auth, incidents, family, accessibility)
│   ├── constants/                    # 32 Badges, 10+ Categorias
│   ├── i18n/                         # Multilíngue (pt-BR, en, es, de)
│   └── types/                        # TypeScript interfaces
└── assets/                           # Ícones & imagens
```

## Design System

| Token | Valor |
|-------|-------|
| **Background** | `#0A0A0F` (escuro profundo) |
| **Primária** | `#00FFAA` (verde néon) |
| **Secundária** | `#7B61FF` (roxo elétrico) |
| **Acento** | `#FF3B7A` (rosa quente) |
| **Aviso** | `#FFB800` (âmbar) |
| **Efeito Glass** | `backdrop-filter: blur(24px)` com bordas semi-transparentes |
| **Tipografia** | Courier New (monospace) + system sans-serif |
| **Animações** | Marcadores pulsantes, varredura radar, efeitos glow, CSS keyframes |

## Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| **Framework** | React Native + Expo (SDK 52) |
| **Routing** | Expo Router |
| **Estado** | Zustand |
| **Mapa** | MapLibre GL JS + OpenFreeMap.org |
| **Geocodificação** | Nominatim (OpenStreetMap) |
| **Motor de Rotas** | OSRM |
| **Câmeras de Velocidade** | Overpass API (OSM) |
| **Dados Públicos** | UK Police API, DC Open Data, dados.gov.pt |
| **Câmeras** | YouTube Live, Iowa Mesonet, MJPG streams |
| **Auth** | Firebase Authentication (configurável) |
| **Idiomas** | Português (BR), English, Español, Deutsch |

## Plano Premium

**€4,99/mês** — Desbloqueia:
- Sistema Chain (localização de membros)
- Navegação completa com alertas de velocidade
- Sistema Familiar (grupos, Modo Criança, zonas seguras)

## Landing Page

A landing page Alert.io é servida separadamente:

```bash
npx serve -s -l 8080 ../alert-io
```

Funcionalidades: hero animado, demo de mapa ao vivo com incidentes, showcase de funcionalidades, secção de preços, seletor de idioma (PT/EN/ES), formulário de login com redirecionamento direto para a app.

## Licença

MIT
