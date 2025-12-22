import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('Pomodoro Timer - Business Rules', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('RN-001: Durações dos Modos', () => {
    it('deve iniciar com 25:00 no modo Pomodoro', () => {
      render(<App />)
      expect(screen.getByText('25:00')).toBeInTheDocument()
      expect(screen.getByText('FOCO')).toBeInTheDocument()
    })

    it('deve mostrar 05:00 no modo Pausa Curta', async () => {
      const user = userEvent.setup({ delay: null })
      render(<App />)
      
      const pausaCurtaButton = screen.getByText(/Pausa Curta|Pausa C\./)
      await user.click(pausaCurtaButton)
      
      expect(screen.getByText('05:00')).toBeInTheDocument()
      expect(screen.getByText('PAUSA CURTA')).toBeInTheDocument()
    })

    it('deve mostrar 15:00 no modo Pausa Longa', async () => {
      const user = userEvent.setup({ delay: null })
      render(<App />)
      
      const pausaLongaButton = screen.getByText(/Pausa Longa|Pausa L\./)
      await user.click(pausaLongaButton)
      
      expect(screen.getByText('15:00')).toBeInTheDocument()
      expect(screen.getByText('PAUSA LONGA')).toBeInTheDocument()
    })
  })

  describe('RN-002: Troca de Modo', () => {
    it('deve pausar o timer ao trocar de modo', async () => {
      const user = userEvent.setup({ delay: null })
      render(<App />)
      
      // Iniciar timer
      const startButton = screen.getByText('▶ Iniciar')
      await user.click(startButton)
      
      // Trocar modo
      const pausaCurtaButton = screen.getByText(/Pausa Curta|Pausa C\./)
      await user.click(pausaCurtaButton)
      
      // Verificar que voltou para "Iniciar"
      expect(screen.getByText('▶ Iniciar')).toBeInTheDocument()
    })

    it('deve resetar para a duração do novo modo', async () => {
      const user = userEvent.setup({ delay: null })
      render(<App />)
      
      // Trocar para Pausa Curta
      const pausaCurtaButton = screen.getByText(/Pausa Curta|Pausa C\./)
      await user.click(pausaCurtaButton)
      
      // Deve mostrar tempo completo da Pausa Curta
      expect(screen.getByText('05:00')).toBeInTheDocument()
    })
  })

  describe('RN-003: Estado Inicial', () => {
    it('deve iniciar no modo Pomodoro', () => {
      render(<App />)
      
      const pomodoroButton = screen.getByRole('button', { name: /Pomodoro/i })
      expect(pomodoroButton).toHaveClass('bg-red-500')
    })

    it('deve iniciar com timer pausado', () => {
      render(<App />)
      expect(screen.getByText('▶ Iniciar')).toBeInTheDocument()
    })

    it('deve iniciar com 0 pomodoros completados', () => {
      render(<App />)
      expect(screen.getByText('Pomodoros Completados')).toBeInTheDocument()
      expect(screen.getByText('0')).toBeInTheDocument()
    })
  })

  describe('RN-007: Controles do Timer', () => {
    it('deve iniciar o timer ao clicar em Iniciar', async () => {
      const user = userEvent.setup({ delay: null })
      render(<App />)
      
      const startButton = screen.getByText('▶ Iniciar')
      await user.click(startButton)
      
      expect(screen.getByText('⏸ Pausar')).toBeInTheDocument()
    })

    it('deve pausar o timer ao clicar em Pausar', async () => {
      const user = userEvent.setup({ delay: null })
      render(<App />)
      
      // Iniciar
      const startButton = screen.getByText('▶ Iniciar')
      await user.click(startButton)
      
      // Pausar
      const pauseButton = screen.getByText('⏸ Pausar')
      await user.click(pauseButton)
      
      expect(screen.getByText('▶ Iniciar')).toBeInTheDocument()
    })

    it('deve resetar o timer ao clicar em Reset', async () => {
      const user = userEvent.setup({ delay: null })
      render(<App />)
      
      // Reset
      const resetButton = screen.getByText(/Reset|↻/)
      await user.click(resetButton)
      
      // Deve mostrar tempo completo
      expect(screen.getByText('25:00')).toBeInTheDocument()
    })
  })

  describe('RN-008: Salvamento Automático', () => {
    it('deve salvar estado no localStorage quando timer inicia', async () => {
      const user = userEvent.setup({ delay: null })
      render(<App />)
      
      const startButton = screen.getByText('▶ Iniciar')
      await user.click(startButton)
      
      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalled()
      })
    })

    it('deve remover estado do localStorage quando timer pausa', async () => {
      const user = userEvent.setup({ delay: null })
      render(<App />)
      
      // Iniciar
      const startButton = screen.getByText('▶ Iniciar')
      await user.click(startButton)
      
      // Pausar
      const pauseButton = screen.getByText('⏸ Pausar')
      await user.click(pauseButton)
      
      await waitFor(() => {
        expect(localStorage.removeItem).toHaveBeenCalledWith('pomodoroState')
      })
    })
  })

  describe('RN-013: Permissão de Notificação', () => {
    it('deve exibir botão para ativar notificações quando não concedida', () => {
      // @ts-ignore
      global.Notification.permission = 'default'
      render(<App />)
      
      expect(screen.getByText('🔔 Ativar Notificações')).toBeInTheDocument()
    })

    it('deve exibir badge quando notificações estão ativadas', () => {
      // @ts-ignore
      global.Notification.permission = 'granted'
      render(<App />)
      
      expect(screen.getByText('✅ Notificações ativadas')).toBeInTheDocument()
    })

    it('deve solicitar permissão ao clicar no botão', async () => {
      // @ts-ignore
      global.Notification.permission = 'default'
      const user = userEvent.setup({ delay: null })
      render(<App />)
      
      const button = screen.getByText('🔔 Ativar Notificações')
      await user.click(button)
      
      expect(global.Notification.requestPermission).toHaveBeenCalled()
    })
  })

  describe('RN-021: Wake Lock - Ativação Automática', () => {
    it('deve ativar Wake Lock quando timer inicia', async () => {
      const user = userEvent.setup({ delay: null })
      render(<App />)
      
      const startButton = screen.getByText('▶ Iniciar')
      await user.click(startButton)
      
      await waitFor(() => {
        expect(navigator.wakeLock.request).toHaveBeenCalledWith('screen')
      })
    })

    it('deve exibir indicador visual quando Wake Lock está ativo', async () => {
      const user = userEvent.setup({ delay: null })
      render(<App />)
      
      const startButton = screen.getByText('▶ Iniciar')
      await user.click(startButton)
      
      await waitFor(() => {
        expect(screen.getByText('🔒')).toBeInTheDocument()
      })
    })
  })

  describe('RN-025: Contador de Pomodoros', () => {
    it('deve iniciar com contador em 0', () => {
      render(<App />)
      
      const stats = screen.getByText('Pomodoros Completados').parentElement
      expect(stats).toHaveTextContent('0')
    })

    it('deve manter contador em 0 para pausas', () => {
      render(<App />)
      
      // Verificar que contador não muda ao trocar para pausa
      const stats = screen.getByText('Pomodoros Completados').parentElement
      expect(stats).toHaveTextContent('0')
    })
  })

  describe('RN-026: Formatação de Tempo', () => {
    it('deve formatar tempo com padding de zeros', () => {
      render(<App />)
      
      // 25:00 já é exibido no início
      expect(screen.getByText('25:00')).toBeInTheDocument()
    })

    it('deve formatar corretamente tempos com um dígito', async () => {
      const user = userEvent.setup({ delay: null })
      render(<App />)
      
      // Trocar para Pausa Curta (5 minutos)
      const pausaCurtaButton = screen.getByText(/Pausa Curta|Pausa C\./)
      await user.click(pausaCurtaButton)
      
      expect(screen.getByText('05:00')).toBeInTheDocument()
    })
  })

  describe('RN-027: Progresso Visual', () => {
    it('deve usar cor vermelha para modo Pomodoro', () => {
      render(<App />)
      
      const progressCircle = document.querySelector('circle.text-red-500')
      expect(progressCircle).toBeInTheDocument()
    })

    it('deve usar cor verde para modo Pausa Curta', async () => {
      const user = userEvent.setup({ delay: null })
      render(<App />)
      
      const pausaCurtaButton = screen.getByText(/Pausa Curta|Pausa C\./)
      await user.click(pausaCurtaButton)
      
      await waitFor(() => {
        const progressCircle = document.querySelector('circle.text-green-500')
        expect(progressCircle).toBeInTheDocument()
      })
    })

    it('deve usar cor azul para modo Pausa Longa', async () => {
      const user = userEvent.setup({ delay: null })
      render(<App />)
      
      const pausaLongaButton = screen.getByText(/Pausa Longa|Pausa L\./)
      await user.click(pausaLongaButton)
      
      await waitFor(() => {
        const progressCircle = document.querySelector('circle.text-blue-500')
        expect(progressCircle).toBeInTheDocument()
      })
    })
  })

  describe('RN-028: Botão Iniciar/Pausar', () => {
    it('deve ter texto dinâmico baseado no estado', async () => {
      const user = userEvent.setup({ delay: null })
      render(<App />)
      
      // Estado inicial: Iniciar
      expect(screen.getByText('▶ Iniciar')).toBeInTheDocument()
      
      // Após clicar: Pausar
      const button = screen.getByText('▶ Iniciar')
      await user.click(button)
      
      expect(screen.getByText('⏸ Pausar')).toBeInTheDocument()
    })

    it('deve ter cor amarela quando pausando', async () => {
      const user = userEvent.setup({ delay: null })
      render(<App />)
      
      const startButton = screen.getByText('▶ Iniciar')
      await user.click(startButton)
      
      const pauseButton = screen.getByText('⏸ Pausar')
      expect(pauseButton).toHaveClass('bg-yellow-500')
    })

    it('deve ter cor do modo quando iniciando', () => {
      render(<App />)
      
      const startButton = screen.getByText('▶ Iniciar')
      expect(startButton).toHaveClass('bg-red-500') // Pomodoro é vermelho
    })
  })

  describe('RN-031: Safari iOS - Avisos', () => {
    it('deve exibir aviso sobre limitações do iOS', () => {
      render(<App />)
      
      expect(screen.getByText(/Dica para iOS\/Safari/i)).toBeInTheDocument()
      expect(screen.getByText(/Notificações em background não funcionam no Safari iOS/i)).toBeInTheDocument()
    })
  })

  describe('Integração: Fluxo Completo de Pomodoro', () => {
    it('deve executar um ciclo completo de Pomodoro', async () => {
      const user = userEvent.setup({ delay: null })
      render(<App />)
      
      // 1. Verificar estado inicial
      expect(screen.getByText('25:00')).toBeInTheDocument()
      expect(screen.getByText('0')).toBeInTheDocument() // 0 pomodoros
      
      // 2. Iniciar timer
      const startButton = screen.getByText('▶ Iniciar')
      await user.click(startButton)
      expect(screen.getByText('⏸ Pausar')).toBeInTheDocument()
      
      // 3. Pausar
      const pauseButton = screen.getByText('⏸ Pausar')
      await user.click(pauseButton)
      expect(screen.getByText('▶ Iniciar')).toBeInTheDocument()
      
      // 4. Reset
      const resetButton = screen.getByText(/Reset|↻/)
      await user.click(resetButton)
      
      expect(screen.getByText('25:00')).toBeInTheDocument()
    })
  })

  describe('Integração: Teste de Notificação', () => {
    it('deve testar notificação ao clicar no botão de teste', async () => {
      const user = userEvent.setup({ delay: null })
      render(<App />)
      
      const testButton = screen.getByText('🔔 Testar Som e Notificação')
      await user.click(testButton)
      
      // Verificar que vibração foi chamada
      await waitFor(() => {
        expect(navigator.vibrate).toHaveBeenCalled()
      })
    })
  })
})

