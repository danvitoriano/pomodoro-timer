# 📋 Regras de Negócio - Pomodoro Timer

Este documento descreve todas as regras de negócio implementadas no aplicativo Pomodoro Timer.

## 🎯 1. Gerenciamento de Modos do Timer

### RN-001: Durações dos Modos
- **Pomodoro**: 25 minutos (1500 segundos)
- **Pausa Curta**: 5 minutos (300 segundos)
- **Pausa Longa**: 15 minutos (900 segundos)

### RN-002: Troca de Modo
- Ao trocar de modo, o timer deve:
  - Pausar automaticamente
  - Resetar para a duração do novo modo
  - Limpar referências de tempo de início

### RN-003: Estado Inicial
- O aplicativo inicia no modo "Pomodoro"
- O timer inicia pausado
- O contador de pomodoros completados inicia em 0

## ⏱️ 2. Funcionamento do Timer

### RN-004: Cálculo de Tempo Baseado em Timestamp
- O timer usa `Date.now()` para calcular o tempo decorrido
- Fórmula: `timeLeft = initialTime - Math.floor((Date.now() - startTime) / 1000)`
- Garante precisão mesmo quando:
  - A tela do dispositivo trava
  - O app fica em background
  - O JavaScript é suspenso pelo navegador

### RN-005: Atualização do Timer
- O timer atualiza a cada 100ms quando está rodando
- Garante visualização suave da contagem regressiva

### RN-006: Conclusão do Timer
- Quando `timeLeft` chega a 0:
  - O timer para automaticamente
  - Dispara notificações (som + visual + vibração + sistema)
  - Incrementa contador se for modo Pomodoro
  - Limpa estado do localStorage

### RN-007: Controles do Timer
- **Iniciar**: Começa a contagem regressiva
- **Pausar**: Para a contagem mantendo o tempo restante
- **Reset**: Volta para a duração completa do modo atual

## 💾 3. Persistência de Dados

### RN-008: Salvamento Automático
- O estado do timer é salvo no localStorage quando:
  - O timer está rodando
  - Qualquer mudança de estado ocorre
- Dados salvos:
  ```json
  {
    "startTime": number,     // Timestamp Unix de início
    "initialTime": number,   // Duração total em segundos
    "mode": string,          // 'pomodoro' | 'shortBreak' | 'longBreak'
    "isRunning": boolean     // Estado atual
  }
  ```

### RN-009: Recuperação de Estado
- Ao abrir o app, verifica localStorage
- Se encontrar estado salvo e timer estava rodando:
  - Calcula tempo decorrido
  - Se ainda há tempo: continua de onde parou
  - Se tempo acabou: dispara notificação imediatamente

### RN-010: Limpeza de Estado
- Remove estado do localStorage quando:
  - Timer é pausado manualmente
  - Timer completa (chega a 0)
  - Modo é trocado

## 🔔 4. Sistema de Notificações

### RN-011: Tipos de Notificação
Quando o timer completa, dispara 4 tipos de alerta:
1. **Som personalizado** (Web Audio API)
2. **Notificação do sistema** (Notification API)
3. **Vibração** (Vibration API - mobile)
4. **Alerta visual** (banner na tela)

### RN-012: Mensagens de Notificação
- **Pomodoro completo**: "🎉 Pomodoro completo! Hora de fazer uma pausa!"
- **Pausa terminada**: "✨ Pausa terminada! Hora de voltar ao trabalho!"

### RN-013: Permissão de Notificação
- Solicita permissão automaticamente ao iniciar timer pela primeira vez
- Botão dedicado para solicitar permissão manualmente
- Exibe status da permissão (concedida/negada/padrão)

### RN-014: Som de Alarme
- 6 bips alternados entre duas frequências (880Hz e 1046.5Hz)
- Volume alto (0.8)
- Duração: ~1.5 segundos
- Onda quadrada para som mais penetrante

### RN-015: Vibração
- Padrão forte: `[500, 200, 500, 200, 500, 200, 500, 200, 500]`
- Duração total: ~3 segundos
- Apenas em dispositivos que suportam

### RN-016: Alerta Visual
- Banner verde no topo da tela
- Animação de bounce
- Duração: 5 segundos (foreground) ou 10 segundos (background)
- Desaparece automaticamente

### RN-017: Notificação do Sistema
- Título: "🍅 Pomodoro Timer"
- Ícone: `/pwa-192x192.png`
- `requireInteraction: true` - não desaparece automaticamente
- `tag: 'pomodoro-complete'` - evita duplicatas
- `silent: false` - tenta tocar som do sistema
- Clique na notificação: foca na janela do app

## 🔄 5. Verificador em Background

### RN-018: Monitoramento Contínuo
- `setInterval` independente roda a cada 1 segundo
- Verifica localStorage mesmo quando app está em background
- Detecta quando timer completa mesmo com app fechado

### RN-019: Detecção de Conclusão em Background
- Compara tempo atual com tempo salvo
- Se timer terminou em background:
  - Dispara notificação do sistema
  - Vibra o dispositivo
  - Marca flag `timerCompletedInBackground`
  - Remove estado do localStorage

### RN-020: Recuperação ao Voltar ao App
- Escuta eventos `visibilitychange` e `focus`
- Ao voltar ao app após conclusão em background:
  - Exibe alerta visual
  - Toca som
  - Vibração extra forte
  - Atualiza estado do timer

## 🔒 6. Wake Lock API

### RN-021: Ativação Automática
- Wake Lock é ativado automaticamente quando timer inicia
- Mantém a tela do dispositivo ligada
- Previne que o timer pare por economia de energia

### RN-022: Desativação Automática
- Wake Lock é liberado quando:
  - Timer é pausado
  - Timer completa
  - Componente é desmontado

### RN-023: Indicador Visual
- Ícone 🔒 verde aparece quando Wake Lock está ativo
- Mensagem no footer: "🔒 Tela mantida ativa durante o timer"
- Animação de pulse no ícone

### RN-024: Tratamento de Erros
- Se Wake Lock não for suportado: continua funcionando normalmente
- Se falhar ao ativar: registra erro e continua
- Re-ativa automaticamente se a tela for desbloqueada

## 📊 7. Estatísticas

### RN-025: Contador de Pomodoros
- Incrementa apenas quando modo "Pomodoro" completa
- Não incrementa para pausas (curta ou longa)
- Persiste durante a sessão (não salvo no localStorage)
- Reseta ao recarregar a página

## 🎨 8. Interface do Usuário

### RN-026: Formatação de Tempo
- Formato: `MM:SS`
- Padding com zeros à esquerda
- Exemplo: `25:00`, `05:30`, `00:15`

### RN-027: Progresso Visual
- Círculo SVG mostra progresso do timer
- Cores por modo:
  - Pomodoro: Vermelho (`text-red-500`)
  - Pausa Curta: Verde (`text-green-500`)
  - Pausa Longa: Azul (`text-blue-500`)
- Animação suave de transição (1 segundo)

### RN-028: Botão Iniciar/Pausar
- Texto dinâmico: "▶ Iniciar" ou "⏸ Pausar"
- Cor dinâmica baseada no modo atual
- Amarelo quando pausando
- Cor do modo quando iniciando

### RN-029: Responsividade
- Layout adaptado para mobile, tablet e desktop
- Breakpoints: `sm:`, `md:`
- Textos abreviados em telas pequenas
- Tamanhos de fonte escaláveis

### RN-030: Acessibilidade
- Labels descritivos em botões
- Títulos em elementos interativos
- Cores com contraste adequado
- Textos legíveis em todos os tamanhos

## 🌐 9. Compatibilidade e Limitações

### RN-031: Safari iOS
- Notificações em background não funcionam
- Wake Lock API não suportado
- Recomendação: adicionar à tela inicial
- Aviso exibido no footer do app

### RN-032: Navegadores Antigos
- Verifica suporte a cada API antes de usar
- Degrada graciosamente se API não disponível
- Registra avisos no console

### RN-033: AudioContext
- Retoma automaticamente em interação do usuário
- Necessário para bypass de políticas de autoplay
- Fecha ao desmontar componente

## 🧪 10. Testes e Qualidade

### RN-034: Casos de Teste Obrigatórios
Cada regra de negócio deve ter testes cobrindo:
- ✅ Caso de sucesso (happy path)
- ❌ Casos de erro
- 🔄 Estados de transição
- 🎯 Valores limites (boundary)

### RN-035: Cobertura de Código
- Meta: > 80% de cobertura
- Foco em lógica de negócio
- Mocks para APIs do navegador

---

## 📝 Resumo Executivo

**Total de Regras de Negócio**: 35

**Categorias**:
- 🎯 Gerenciamento de Modos: 3 regras
- ⏱️ Funcionamento do Timer: 4 regras
- 💾 Persistência: 3 regras
- 🔔 Notificações: 7 regras
- 🔄 Background: 3 regras
- 🔒 Wake Lock: 4 regras
- 📊 Estatísticas: 1 regra
- 🎨 Interface: 5 regras
- 🌐 Compatibilidade: 3 regras
- 🧪 Qualidade: 2 regras

**Complexidade**: Alta
**Prioridade de Testes**: Crítica
**Status**: ✅ Documentado

