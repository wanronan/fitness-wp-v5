# Implementação da V5

## Repositório-alvo

`wanronan/fitness-casal`

A V5 foi planejada para substituir a aplicação simples atual por uma PWA de treino com dois perfis, preservando o conceito Wanderson + Fernanda.

## Fontes utilizadas

1. Planilha `Fitness_WP_Treino_Conjunto_Wanderson_Fernanda_Nov2026` como fonte oficial dos dados de treino e referências.
2. `wanronan/protocol-fitness` como referência de funcionalidades já existentes no projeto: registro de treino, cronômetro, histórico e evolução.
3. `wanronan/fitness-casal` como referência de dois perfis e funcionamento PWA.
4. Referências open source pesquisadas anteriormente apenas como inspiração de UX/arquitetura; nenhum código foi copiado diretamente.

## Decisões

- Interface 100% em português.
- Dois perfis no mesmo app.
- Dados separados por perfil no IndexedDB.
- A carga/repetições da sessão anterior são reaproveitadas como ponto de partida na nova sessão.
- RIR continua sendo registrado por série.
- Ao concluir uma série, o cronômetro de descanso abre automaticamente.
- Backup local em JSON.
- Referências nutricionais permanecem como estimativas da planilha, não prescrição.
- Dados ausentes na planilha não foram inventados.

## Pendências de dados da fonte

- Altura e idade de Fernanda ainda precisam ser confirmadas.
- Baseline completo de Wanderson não consta na aba `Dia Zero e Revisão`.

## Publicação

O workflow `Publicar Fitness WP` foi preparado para GitHub Pages via GitHub Actions. Após o código chegar à branch `main`, o build produz `dist/` e publica o app.
