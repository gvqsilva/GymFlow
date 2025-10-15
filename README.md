# 📱 App GymFlow

**Data da Versão:** 12 de outubro de 2025  
**Status:** Funcionalidade Local Completa (V.2.0)

---

## 📑 Sumário

- [🎯 Visão Geral](#visão-geral)
- [🏗️ Arquitetura e Tecnologias](#arquitetura-e-tecnologias)
- [⚙️ Funcionalidades Implementadas](#funcionalidades-implementadas)
  - [🏠 Home (Tela Principal)](#home-tela-principal)
  - [🏋️ Esportes (Hub de Atividades)](#esportes-hub-de-atividades)
  - [🍎 Alimentação (Diário Nutricional)](#alimentação-diário-nutricional)
  - [⚙️ Configurações (Hub de Gestão)](#configurações-hub-de-gestão)
- [🚧 Roadmap (Próximos Passos)](#roadmap-próximos-passos)

---

## 🎯 Visão Geral

Aplicação móvel pessoal (iOS/Android) que atua como **"Diário de Atleta Completo"**, permitindo monitorizar toda a rotina de treinos, suplementação e nutrição.

**Objetivos Principais:**

- Centralizar registos de treinos (diversas modalidades)
- Acompanhar suplementação e nutrição de forma dinâmica e inteligente
- Fornecer métricas de progresso acionáveis
- Funcionar 100% offline, sem dependência de APIs externas para funcionalidades críticas

**Evolução:** Diário de musculação → Hub de performance completo

---

## 🏗️ Arquitetura e Tecnologias

| Categoria | Componentes Chave | Notas |
| --- | --- | --- |
| Framework | React Native (Expo) / TypeScript | Base do projeto |
| Navegação | Expo Router (file-based) | Estrutura de abas e navegação em stack |
| Armazenamento | AsyncStorage | Fonte única de verdade para todos os dados do utilizador |
| Base de Dados | JSON Local (`data/foodData.json`) | Base interna com mais de 300 alimentos, estruturada por categorias |
| Lógica de Cálculo | `utils/calorieCalculator.ts` | Contém a fórmula de TDEE (Harris-Benedict) |
| Controle de Estado | Custom Hooks (`useWorkouts`, etc.) | Gerenciamento de dados centralizado |
| Componentes Nativos | `expo-notifications`, `react-native-calendars`, `react-native-chart-kit` | Utilizados para lembretes, calendário e gráficos |

---

## ⚙️ Funcionalidades Implementadas

### 🏠 Home (Tela Principal)

- **Dashboard Diário:** Resumo dos compromissos do dia
- **Acompanhamento de Suplementos Dinâmico:** Cards interativos para todos os suplementos configurados
- **Gasto Calórico Diário:** Exibe o total de calorias gastas nas atividades do dia
- **Atalho de Musculação Dinâmico:** Sugere automaticamente o próximo treino da sequência
- **Resumo Semanal de Atividades:** Gráfico de barras com ícones dos desportos, mostrando a frequência

---

### 🏋️ Esportes (Hub de Atividades)

- **Hub Central:** Ponto de partida para registar qualquer atividade física
- **Lista de Desportos Dinâmica:** O utilizador pode adicionar, editar e apagar os seus próprios desportos
- **Gráfico de Evolução de Carga:** Dentro da tela de detalhe de cada exercício de musculação, um gráfico de linhas exibe a progressão de peso (PR)

**Fluxos Diferenciados:**

- **Academia:** Redireciona para as fichas de treino detalhadas (A, B, C, etc.)
- **Outros Desportos:** Abre um ecrã de registo rápido com campos especializados (ex: "Metros Nadados" para Natação)

---

### 🍎 Alimentação (Diário Nutricional)

- **Busca Inteligente com Autocomplete:** Lista de sugestões de alimentos que aparece enquanto o utilizador digita
- **Input Robusto e Flexível:** Interpreta quantidades em g, ml, "colher de sopa" e "unidade"
- **Balanço Diário Visível:** Mostra o Total Consumido e o Total Gasto em calorias no topo do ecrã
- **Categorização e Detalhes:** Permite registar alimentos por refeição e visualizar um histórico diário agrupado por categoria

---

### ⚙️ Configurações (Hub de Gestão)

- **Hub Central de Gestão:** Centraliza o acesso a todas as áreas de personalização da aplicação

**Perfil do Utilizador (`perfil.tsx` e `perfil-modal.tsx`):**

- Visualização Clara: Dados como nome, idade, altura, peso e IMC
- Edição Avançada: Definição de Peso Meta e Prazo, calculando automaticamente a meta de calorias diárias

**Gestão de Suplementos (`gerir-suplementos.tsx`):**

- CRUD Completo: Criar, editar e apagar suplementos
- Lembretes Dinâmicos: Cada suplemento possui um botão Switch para ativar/desativar lembrete diário com horário personalizado

**Gestão de Fichas de Treino (`gerir-fichas.tsx`):**

- CRUD Completo: Criar, editar e apagar fichas de treino e exercícios

**Gestão de Esportes (`gerir-esportes.tsx`):**

- CRUD Completo: Criar, editar e apagar desportos personalizados, incluindo seleção de ícones

**Histórico e Dados (`gestao-dados.tsx`):**

- Calendário Inteligente: Exibe um ponto em cada dia com registos, colorido para indicar balanço calórico (Verde = déficit, Vermelho = superávit)
- Resumo Detalhado no Modal: Ao clicar num dia, modal exibe balanço completo, suplementos e atividades da data
- Modo de Edição: Permite excluir registos de atividades ou adicionar novas atividades a dias passados

---

## 🚧 Roadmap (Próximos Passos)

- ☁️ Longo Prazo: Integrar Firebase para autenticação e sincronização na nuvem
