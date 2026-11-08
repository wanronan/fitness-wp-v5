# Fitness WP V5

Aplicativo PWA mobile-first de treino para **Wanderson e Fernanda**, criado a partir da planilha `Fitness_WP_Treino_Conjunto_Wanderson_Fernanda_Nov2026`.

## O que entra nesta versão

- Dois perfis independentes: Wanderson e Fernanda
- Treino do dia e semana completa
- Séries, repetições, intervalo e RIR específicos por perfil
- Quarta-feira exclusiva para Wanderson; descanso para Fernanda
- Registro de carga, repetições, RIR e série concluída
- Cronômetro automático de descanso
- Histórico de sessões
- Evolução física com medidas e gráfico de peso
- Baseline da Fernanda conforme a planilha
- Painel de referências calóricas/proteicas da planilha, explicitamente marcado como estimativa e não prescrição
- Orientações do plano em português
- Backup e restauração em JSON
- IndexedDB via Dexie
- PWA instalável/offline via Workbox

## Arquitetura

- React
- TypeScript
- Vite
- Dexie / IndexedDB
- vite-plugin-pwa / Workbox
- lucide-react

## Desenvolvimento

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## GitHub Pages

O workflow em `.github/workflows/deploy.yml` publica automaticamente o conteúdo da pasta `dist` a cada push na branch `main`.

## Fonte dos dados

Os treinos, orientações, referências de calorias/proteínas e baseline inicial foram transcritos da planilha fornecida pelo usuário. O app não inventa os dados ausentes. Em especial:

- altura e idade de Fernanda seguem pendentes na planilha;
- o baseline completo de Wanderson não está presente na aba Dia Zero e Revisão;
- as faixas calóricas da planilha são tratadas como estimativas, não prescrição nutricional.
