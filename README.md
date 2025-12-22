<div align="center">
  <h1>🍅 Pomodoro Timer</h1>
  <p><strong>Timer Pomodoro moderno com notificações, sons e Wake Lock API</strong></p>
  
  <p>
    <a href="https://pomodoro-timer-beryl-rho.vercel.app">🚀 Demo ao Vivo</a> •
    <a href="https://danvitoriano.github.io/pomodoro-timer/">📚 Documentação</a> •
    <a href="#-funcionalidades">Funcionalidades</a> •
    <a href="#-como-usar">Como Usar</a> •
    <a href="#-tecnologias">Tecnologias</a>
  </p>

  <img src="https://img.shields.io/badge/React-18-blue?logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/PWA-Enabled-success" alt="PWA">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
</div>

---

## 📖 Sobre

Um timer Pomodoro moderno e eficiente que ajuda você a manter o foco e aumentar a produtividade usando a técnica Pomodoro. Com suporte a notificações web, sons personalizados, vibração e Wake Lock API para manter a tela ligada durante o timer.

> 📚 **[Documentação Completa](https://danvitoriano.github.io/pomodoro-timer/)** - Visite nossa página de documentação para informações detalhadas sobre funcionalidades, APIs utilizadas, guias de instalação e muito mais!

### 🎯 Técnica Pomodoro

A técnica Pomodoro é um método de gerenciamento de tempo que usa um timer para dividir o trabalho em intervalos:
- **25 minutos** de foco intenso (Pomodoro)
- **5 minutos** de pausa curta
- **15 minutos** de pausa longa (após 4 pomodoros)

## ✨ Funcionalidades

### Core Features
- ⏱️ **Timer Pomodoro Completo** - 25 min trabalho, 5 min pausa curta, 15 min pausa longa
- 🔄 **Timer Baseado em Timestamp** - Continua rodando mesmo quando a tela trava ou app fica em background
- 💾 **Persistência de Estado** - Timer continua mesmo se você fechar o app
- 📊 **Contador de Pomodoros** - Acompanhe quantos pomodoros você completou

### Notificações & Alertas
- 🔔 **Notificações Web** - Alertas automáticos quando o timer termina
- 🔊 **Som Personalizado** - Alarme alto e chamativo usando Web Audio API
- 📳 **Vibração Forte** - Feedback tátil de 3 segundos em dispositivos móveis
- ✅ **Alerta Visual** - Banner verde grande e persistente

### Mobile & PWA
- 🔒 **Wake Lock API** - Mantém a tela do celular ligada durante o timer
- 📱 **Progressive Web App** - Instalável como app nativo no celular
- 🎨 **Layout Responsivo** - Interface adaptada para mobile, tablet e desktop
- 🌙 **Dark Mode** - Design elegante com tema escuro

### Tecnologias Avançadas
- ⚡ **Verificador em Background** - Checa o timer a cada segundo mesmo em background
- 🔄 **Recuperação Automática** - Recalcula o tempo correto ao voltar ao app
- 💾 **LocalStorage** - Salva o estado do timer automaticamente

## 🎯 Como Usar

### 💻 Desktop

1. Acesse [pomodoro-timer-beryl-rho.vercel.app](https://pomodoro-timer-beryl-rho.vercel.app)
2. Clique em **"🔔 Ativar Notificações"** quando aparecer
3. Escolha o modo:
   - **Pomodoro** (25 min) - Para trabalho focado
   - **Pausa Curta** (5 min) - Descanso rápido
   - **Pausa Longa** (15 min) - Descanso prolongado
4. Clique em **"▶ Iniciar"**
5. Trabalhe focado! 🎯
6. Receba alerta quando terminar

### 📱 iOS/Safari

> ⚠️ **Importante:** Devido a limitações da Apple, notificações em background não funcionam no Safari iOS. O app precisa estar aberto ou na lista de apps recentes.

**Para melhor experiência no iOS:**

1. **Adicione à Tela Inicial:**
   - Toque no botão **"Compartilhar"** (quadrado com seta)
   - Role e selecione **"Adicionar à Tela de Início"**
   - Toque em **"Adicionar"**

2. **Use o App:**
   - Abra o app pelo ícone na tela inicial
   - Ative notificações quando solicitado
   - Inicie o timer
   - **Mantenha o app aberto** ou na lista de apps recentes
   - A Wake Lock API manterá a tela ligada ✨

3. **Ao Voltar:**
   - Quando você reabrir o app após o timer terminar
   - Receberá **som + vibração + alerta visual** imediatamente

### 🤖 Android/Chrome

Funcionamento completo! Notificações funcionam mesmo com o app fechado.

## 🛠️ Tecnologias

### Frontend
- **React 18** - Biblioteca UI
- **TypeScript** - Type safety
- **Vite 7** - Build tool ultra-rápido
- **Tailwind CSS** - Styling utility-first

### PWA & APIs
- **Service Worker** - Cache e offline support
- **Web App Manifest** - Instalação como app
- **Wake Lock API** - Mantém tela ligada
- **Notification API** - Notificações web
- **Vibration API** - Feedback tátil
- **Web Audio API** - Sons personalizados
- **LocalStorage API** - Persistência de dados

## 📦 Instalação & Desenvolvimento

### Pré-requisitos
- Node.js 20.19+ ou 22.12+
- npm ou yarn

### Instalação Local

```bash
# Clone o repositório
git clone https://github.com/danvitoriano/pomodoro-timer.git
cd pomodoro-timer

# Instale as dependências
npm install

# Execute em desenvolvimento
npm run dev

# Acesse http://localhost:5173
```

### Build para Produção

```bash
# Criar build otimizado
npm run build

# Preview do build localmente
npm run preview
```

### Scripts Disponíveis

```bash
npm run dev            # Inicia servidor de desenvolvimento
npm run build          # Cria build de produção
npm run preview        # Preview do build
npm run lint           # Verifica erros de código
npm test               # Executa testes em modo watch
npm run test:run       # Executa testes uma vez
npm run test:ui        # Interface visual dos testes
npm run test:coverage  # Relatório de cobertura
```

## 🏗️ Estrutura do Projeto

```
pomodoro-timer/
├── public/                 # Assets estáticos
│   ├── pwa-192x192.png    # Ícone PWA 192x192
│   ├── pwa-512x512.png    # Ícone PWA 512x512
│   └── apple-touch-icon.png
├── src/
│   ├── App.tsx            # Componente principal com toda a lógica
│   ├── App.test.tsx       # Testes unitários (31 testes)
│   ├── App.css            # Estilos customizados e responsividade
│   ├── main.tsx           # Entry point da aplicação
│   ├── index.css          # Importação do Tailwind CSS
│   └── test/
│       └── setup.ts       # Configuração dos testes
├── docs/                  # Documentação (GitHub Pages)
│   ├── index.html         # Página principal
│   └── tests.html         # Documentação de testes
├── vite.config.ts         # Config Vite + PWA + Vitest
├── tsconfig.json          # Config TypeScript
├── BUSINESS_RULES.md      # Documentação de regras de negócio
└── package.json           # Dependências e scripts
```

## 🧪 Testes e Qualidade

### Cobertura de Testes

- **31 testes unitários** implementados
- **21 testes passando** (68% de taxa de sucesso)
- **35 regras de negócio** documentadas
- Testes cobrem funcionalidades críticas:
  - ✅ Gerenciamento de modos do timer
  - ✅ Controles (iniciar, pausar, reset)
  - ✅ Persistência de estado
  - ✅ Sistema de notificações
  - ✅ Wake Lock API
  - ✅ Interface e formatação

### Executar Testes

```bash
# Modo watch (recomendado para desenvolvimento)
npm test

# Executar todos os testes uma vez
npm run test:run

# Interface visual interativa
npm run test:ui

# Gerar relatório de cobertura
npm run test:coverage
```

### Documentação de Testes

- 📚 **[Documentação Completa de Testes](https://danvitoriano.github.io/pomodoro-timer/tests.html)**
- 📋 **[Regras de Negócio](BUSINESS_RULES.md)** - Todas as 35 regras documentadas
- 💻 **[Código dos Testes](src/App.test.tsx)** - Implementação dos testes

### Tecnologias de Teste

- **Vitest** - Framework de testes rápido e moderno
- **Testing Library** - Testes centrados no usuário
- **jsdom** - Ambiente DOM para testes
- **Vitest UI** - Interface visual para testes

## 💡 Funcionalidades Técnicas

### ⏰ Timer Baseado em Timestamp

O timer usa `Date.now()` ao invés de simples `setInterval`, garantindo precisão absoluta mesmo quando:
- A tela do celular trava
- O app fica em background
- O navegador suspende JavaScript
- O sistema operacional economiza bateria

```typescript
// Cálculo preciso do tempo restante
const elapsed = Math.floor((Date.now() - startTime) / 1000)
const timeLeft = Math.max(0, initialTime - elapsed)
```

### 💾 Persistência no LocalStorage

O estado do timer é salvo automaticamente a cada mudança:

```typescript
{
  startTime: number,      // Timestamp Unix de início
  initialTime: number,    // Duração total em segundos
  mode: string,          // 'pomodoro' | 'shortBreak' | 'longBreak'
  isRunning: boolean     // Estado atual do timer
}
```

### 🔄 Verificador em Background

Um `setInterval` independente roda a cada 1 segundo, verificando constantemente se o timer terminou:

```typescript
setInterval(() => {
  const savedState = localStorage.getItem('pomodoroState')
  if (timerFinished) {
    // Dispara notificação + som + vibração
    new Notification('🍅 Pomodoro Timer', { ... })
  }
}, 1000)
```

### 🔔 Sistema de Notificações

Três camadas de alertas para garantir que você nunca perca:

1. **Notificação Web** - Sistema operacional
2. **Som Personalizado** - Web Audio API
3. **Vibração** - Vibration API (3 segundos de pulsos)

### 🔒 Wake Lock API

Mantém a tela ligada automaticamente durante o timer:

```typescript
const wakeLock = await navigator.wakeLock.request('screen')
// Tela não apaga durante o timer! ✨
```

## 🌐 Deploy

### Vercel (Recomendado)

Este projeto está otimizado para deploy na Vercel com CI/CD automático:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/danvitoriano/pomodoro-timer)

### GitHub Pages

A documentação do projeto está hospedada no GitHub Pages:
- **URL:** https://danvitoriano.github.io/pomodoro-timer/
- **Deploy:** Automático via GitHub Actions (pasta `docs/`)

### Outros Serviços

- **Netlify** - `npm run build` → pasta `dist/`
- **Firebase Hosting** - `firebase deploy`

## 🤝 Contribuindo

Contribuições são muito bem-vindas! Seja correção de bugs, novas funcionalidades ou melhorias na documentação.

### Como Contribuir

1. **Fork** o projeto
2. Crie uma **branch** para sua feature (`git checkout -b feature/MinhaFeature`)
3. **Commit** suas mudanças (`git commit -m 'feat: adiciona MinhaFeature'`)
4. **Push** para a branch (`git push origin feature/MinhaFeature`)
5. Abra um **Pull Request**

### Convenção de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Mudanças na documentação
- `style:` - Formatação, ponto e vírgula, etc
- `refactor:` - Refatoração de código
- `test:` - Adição de testes
- `chore:` - Tarefas de build, configurações, etc

## 📝 Roadmap

- [ ] Estatísticas detalhadas de produtividade
- [ ] Gráficos de progresso semanal/mensal
- [ ] Temas de cores customizáveis
- [ ] Sons de alarme personalizáveis
- [ ] Integração com Notion/Todoist
- [ ] Modo escuro/claro toggle
- [ ] Configurações de tempo personalizadas
- [ ] Histórico de pomodoros completados

## ❓ FAQ

### Por que as notificações não funcionam no Safari iOS?

É uma limitação da Apple. O Safari iOS não suporta notificações web em background. Recomendamos manter o app aberto ou usar a Wake Lock API para manter a tela ligada.

### O timer continua rodando se eu fechar o navegador?

Sim! O estado é salvo no LocalStorage. Ao reabrir, o timer calcula quanto tempo passou e dispara a notificação se já terminou.

### Posso usar offline?

Sim! Como é uma PWA, o app funciona offline após a primeira visita.

### Como instalar como app?

No mobile: toque em "Adicionar à Tela Inicial" no menu do navegador.
No desktop: clique no ícone de instalação na barra de endereço.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🙏 Agradecimentos

- **Francesco Cirillo** - Criador da Técnica Pomodoro
- **Comunidade React** - Pela excelente biblioteca
- **Vercel** - Pelo hosting gratuito
- Todos os contribuidores que ajudaram a melhorar o projeto

## 📧 Contato

**Dan Vitoriano**

- GitHub: [@danvitoriano](https://github.com/danvitoriano)
- Email: vitoriano08@gmail.com

## 🔗 Links

- **🚀 Aplicativo:** [pomodoro-timer-beryl-rho.vercel.app](https://pomodoro-timer-beryl-rho.vercel.app)
- **📚 Documentação:** [danvitoriano.github.io/pomodoro-timer](https://danvitoriano.github.io/pomodoro-timer/)
- **🧪 Testes e Regras:** [danvitoriano.github.io/pomodoro-timer/tests.html](https://danvitoriano.github.io/pomodoro-timer/tests.html)
- **💻 Repositório:** [github.com/danvitoriano/pomodoro-timer](https://github.com/danvitoriano/pomodoro-timer)
- **🐛 Issues:** [Reportar Bug](https://github.com/danvitoriano/pomodoro-timer/issues)

---

<div align="center">
  <p>Feito com ❤️ e muitos ☕ pomodoros</p>
  <p>Se este projeto te ajudou, considere dar uma ⭐!</p>
</div>
