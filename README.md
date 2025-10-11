# 📱 App GymFlow

**📅 Data da Versão:** 11 de outubro de 2025  
**🚀 Status:** Funcionalidade Local Completa (**V.2.0**)

---

## 📑 Sumário

1. [Visão Geral](#1-🎯-visão-geral)  
2. [Arquitetura e Tecnologias](#2-🏗️-arquitetura-e-tecnologias)  
3. [Funcionalidades Implementadas](#3-⚙️-funcionalidades-implementadas)  
  3.1 [Home (Tela Principal)](#31-🏠-home-tela-principal)  
  3.2 [Esportes (Hub de Atividades)](#32-🏋️-esportes-hub-de-atividades)  
  3.3 [Alimentação (Diário Nutricional)](#33-🍎-alimentação-diário-nutricional)  
  3.4 [Configurações (Gestão e Personalização)](#34-⚙️-configurações-gestão-e-personalização)  
4. [Roadmap (Próximos Passos)](#4-🚧-roadmap-próximos-passos)

---

## 1. 🎯 Visão Geral

Aplicação móvel pessoal (**iOS/Android**) que atua como um **“Diário de Atleta Completo”**, permitindo monitorizar toda a rotina de treinos, suplementação e nutrição.

### **Objetivos Principais**

- Centralizar registos de treinos (diversas modalidades)
- Acompanhar suplementação e nutrição de forma dinâmica
- Fornecer métricas de progresso acionáveis
- Funcionar **100% offline**, sem dependência de APIs externas para funcionalidades críticas

**Evolução:** Diário de musculação → Hub de performance completo.

---

## 2. 🏗️ Arquitetura e Tecnologias

| **Categoria** | **Componentes Chave** | **Notas** |
| --- | --- | --- |
| **Framework** | React Native (Expo) / TypeScript | Base do projeto |
| **Navegação** | Expo Router (file-based) | Estrutura de abas e navegação em stack |
| **Armazenamento** | AsyncStorage | Fonte única de verdade para todos os dados do utilizador |
| **Base de Dados** | JSON Local (`data/foodData.json`) | Implementado para análise nutricional, substituindo APIs externas |
| **Lógica de Cálculo** | `utils/calorieCalculator.ts` | Contém a fórmula de TDEE (Harris-Benedict) |
| **Controle de Estado** | Custom Hooks (`useWorkouts`, `useSupplements`, `useSports`) | Gerenciamento de dados centralizado e eficiente |
| **Componentes Nativos** | expo-haptics, expo-notifications, react-native-calendars | Feedback tátil, lembretes e visualização de histórico |

---

## 3. ⚙️ Funcionalidades Implementadas

### 3.1 🏠 Home (Tela Principal)

- **Dashboard Diário:** Resumo dos compromissos do dia  
- **Acompanhamento de Suplementos Dinâmico:** Cards interativos para suplementos configurados, com lógica de marcação (`daily_check`) ou contador (`counter`)  
- **Gasto Calórico Diário:** Exibe o total de calorias gastas nas atividades do dia, com um botão que permite compartilhar o resumo diário de atividades e kcal gastas  
- **Atalho de Musculação Dinâmico:** Sugere automaticamente o próximo treino da sequência  
- **Resumo Semanal de Atividades:** Gráfico de barras com ícones dos desportos, mostrando a frequência de treinos  

---

### 3.2 🏋️ Esportes (Hub de Atividades)

- **Hub Central:** Ponto de partida para registar qualquer atividade física  
- **Lista de Desportos Dinâmica:** Permite adicionar, remover e personalizar desportos e seus ícones  
- **Gráfico de Evolução de Carga:** Mostra a progressão de peso (PR) nas fichas de exercícios  
- **Fluxos Diferenciados:**  
  - **Academia:** Redireciona para fichas detalhadas de musculação  
  - **Outros Desportos:** Ecrã de registo rápido com campos específicos (ex: “Metros Nadados” para Natação)  

---

### 3.3 🍎 Alimentação (Diário Nutricional)

*(Antigo `historico.tsx`)*

- **Registo Baseado em JSON Local:** Lê base interna com mais de **300 alimentos**  
- **Input Robusto:** Aceita entradas com quantidades em g ou ml (`150g Frango`, `300ml Leite`)  
- **Balanço Diário Visível:** Mostra o **Total Consumido** e **Total Gasto** no topo  
- **Categorização de Refeição:** Permite escolher a refeição (Café, Almoço, etc.)  
- **Visualização Detalhada:** Histórico diário agrupado por refeição, exibindo total de Kcal por bloco  

---

### 3.4 ⚙️ Configurações (Gestão e Personalização)

- **Perfil do Utilizador:** Peso, altura, idade e género  
- **Hub de Gestão:** Centraliza o acesso para:  
  - **Gerir Suplementos:** CRUD completo + lembrete de creatina  
  - **Gerir Fichas de Treino:** CRUD completo de fichas e exercícios  
  - **Gerir Esportes:** CRUD de desportos personalizados  
- **Histórico e Dados (antigo `gestao-dados`):**  
  - **Modo de Edição:** Botão no cabeçalho ativa edição para excluir ou adicionar registros  

---

## 4. 🚧 Roadmap (Próximos Passos)

- 📊 Implementar ecrã de **Progresso** com gráficos de longo prazo (ex: volume de treino)  
- 🧮 **Cálculo de TDEE Preciso:** Aprimorar o cálculo com base em histórico e tendências de peso  
- 🗓️ **Calendário e Balanço:** Exibir o histórico de kcal com **pontos coloridos dinâmicos** (🟢 déficit / 🔴 superávit), representando também intensidade e consistência de treino  
- ⏱️ Criar **Modo Treino** ativo com cronómetro de descanso  
- 💾 Adicionar **Backup e Restauração Local** (Exportar/Importar JSON)  
- ☁️ **Longo Prazo:** Integrar Firebase para autenticação e sincronização na nuvem  
