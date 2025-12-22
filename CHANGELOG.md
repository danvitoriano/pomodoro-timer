# 📝 Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2025-12-22

### ✨ Adicionado
- Timer Pomodoro completo (25/5/15 minutos)
- Interface responsiva com Tailwind CSS
- Progressive Web App (PWA) com Service Worker
- Wake Lock API para manter tela ligada
- Notificações web quando timer termina
- Som de alarme personalizado usando Web Audio API
- Vibração forte em dispositivos móveis (3 segundos)
- Timer baseado em timestamp real para precisão absoluta
- Persistência de estado no LocalStorage
- Recuperação automática do timer ao voltar ao app
- Verificador em background (checa a cada 1 segundo)
- Contador de pomodoros completados
- Botão para ativar notificações manualmente
- Indicador visual de status de notificações
- Aviso sobre limitações do Safari iOS
- Alerta visual persistente quando timer termina
- Suporte completo para mobile (iOS e Android)
- Design dark mode elegante
- Layout otimizado para diferentes tamanhos de tela

### 🔧 Técnico
- React 18 com TypeScript
- Vite 7 como build tool
- Tailwind CSS para estilos
- ESLint para linting
- PWA configurado com vite-plugin-pwa
- Hot Module Replacement (HMR) em desenvolvimento

### 📱 Mobile
- Wake Lock API funcional
- Vibração forte (9 pulsos de 500ms)
- Notificações adaptadas para iOS
- Layout totalmente responsivo
- Touch targets otimizados (mínimo 44px)
- Prevenção de zoom no Safari iOS

### 🐛 Correções
- Timer mantém precisão mesmo com tela travada
- Notificações funcionam ao voltar ao app
- Layout não quebra em telas pequenas (320px+)
- SVG do timer mantém proporções corretas
- Overflow horizontal prevenido em mobile

### 📚 Documentação
- README completo e profissional
- Guia de contribuição
- Templates de issues e PRs
- Licença MIT
- Changelog

---

## [Unreleased]

### 🎯 Planejado
- Estatísticas detalhadas de produtividade
- Gráficos de progresso semanal/mensal
- Temas de cores customizáveis
- Sons de alarme personalizáveis
- Integração com Notion/Todoist
- Modo escuro/claro toggle
- Configurações de tempo personalizadas
- Histórico de pomodoros completados
- Exportação de dados
- Sincronização entre dispositivos

---

**Legenda:**
- ✨ `Adicionado` - Novas funcionalidades
- 🔧 `Modificado` - Mudanças em funcionalidades existentes
- ❌ `Removido` - Funcionalidades removidas
- 🐛 `Corrigido` - Correções de bugs
- 🔒 `Segurança` - Correções de vulnerabilidades

