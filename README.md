# 📱 Projeto: App GymFlow 

---

## 📑 Sumário

1. [Visão Geral](#visão-geral)
2. [Tecnologias Utilizadas](#tecnologias-utilizadas)
3. [Funcionalidades Implementadas](#funcionalidades-implementadas)
   - [Home](#31-home-tela-principal)
   - [Esportes](#32-esportes-registo-multi-desportivo)
   - [Histórico](#33-histórico-interativo)
   - [Configurações](#34-configurações)
4. [Roadmap](#roadmap)

---

## 🧭 Visão Geral

O **GymFlow** é uma aplicação móvel pessoal desenvolvida para **iOS e Android**, atuando como um **"Diário de Atleta Completo"**.  
Seu objetivo é oferecer uma experiência centralizada de acompanhamento esportivo e nutricional, ideal para atletas que praticam múltiplas modalidades.

### 🎯 Objetivos Principais
- Centralizar registos de treinos (diversas modalidades).  
- Acompanhar suplementação diária.  
- Visualizar progresso físico e de performance.  
- Funcionar como parceiro inteligente de performance esportiva.

### 🧬 Evolução
O projeto teve início como um simples diário de musculação e evoluiu para um **“nexo desportivo”**, abrangendo múltiplas modalidades e estatísticas de performance.

---

## 🛠️ Tecnologias Utilizadas

- **Framework:** React Native (Expo)  
- **Linguagem:** TypeScript  
- **Navegação:** Expo Router (file-based)  
- **Armazenamento:** AsyncStorage (local)  

### 📦 Bibliotecas e Componentes
- `expo-haptics` — feedback tátil nativo  
- `expo-notifications` — notificações locais e lembretes  
- `react-native-calendars` — exibição e controle de calendário  
- `react-native-draggable-flatlist` — ordenação dinâmica por drag-and-drop  

---

## ⚙️ Funcionalidades Implementadas

### 3.1. 🏠 Home (Tela Principal)
- Dashboard **diário/semanal**.  
- **Saudação personalizada** conforme horário e nome do usuário.  
- **Acompanhamento de Suplementos** (Creatina + Whey).  
- **Gasto Calórico Diário** (com modal interativo).
  -  **Opção de Compartilhar Resumo Diario** (Compartilhar seu desempenho diario)
- **Atalho de Musculação Dinâmico** (sequência automática).  
- **Resumo Semanal de Atividades** (gráfico de barras).

---

### 3.2. 🏋️ Esportes (Registo Multi-Desportivo)
- Hub central de atividades.  
- Lista de desportos: **Musculação, Vólei, Futebol, Boxe**.  
- Gráfico de progressão de carga e destaque de **PR (Personal Record)**.  
- Mini-calendário mensal de frequência.  
- **Fluxos diferenciados**:
  - *Academia*: fichas de musculação detalhadas.  
  - *Outros esportes*: registo rápido (duração, intensidade, calorias).  

---

### 3.3. 📅 Histórico (Interativo)
- **Calendário Heatmap** para exibir intensidade de treinos por dia.  
- **Resumo Diário** com lista de atividades e duração total.  

---

### 3.4. ⚙️ Configurações
- **Perfil do Utilizador:** nome, peso, altura, idade e cálculo automático do IMC (com indicador colorido).  
- **Gestão de Fichas de Treino:** criar, editar e apagar fichas com **drag-and-drop**.  
- **Lembretes de Creatina:** notificações diárias e reforços automáticos.  
- **Gestão de Dados:** opção para excluir atividades específicas.  

---

## 🗺️ Roadmap

| Fase | Descrição | Status |
|------|------------|--------|
| 1 | Estruturação do projeto e navegação base | ✅ Concluída |
| 2 | Implementação de dashboard e esportes | ✅ Concluída |
| 3 | Sistema de notificações e lembretes | ✅ Concluída |
| 4 | Otimização e testes finais | ✅ Concluída |
| 5 | Publicação e documentação | ✅ Finalizado |

---

### 🧾 Licença
Este projeto é de uso **educacional e pessoal**, não sendo destinado à distribuição comercial.

---
