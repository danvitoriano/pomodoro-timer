import { useState, useEffect, useRef } from 'react'
import './App.css'

type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak'

const TIMER_DURATIONS = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
}

function App() {
  const [mode, setMode] = useState<TimerMode>('pomodoro')
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATIONS.pomodoro)
  const [isRunning, setIsRunning] = useState(false)
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0)
  const [showAlert, setShowAlert] = useState(false)
  const intervalRef = useRef<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    // Inicializar AudioContext para criar sons personalizados
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Função para tocar um som de alarme alto e chamativo
  const playNotificationSound = () => {
    if (!audioContextRef.current) return

    const ctx = audioContextRef.current
    const now = ctx.currentTime

    // Criar um alarme alto com múltiplos bips
    for (let i = 0; i < 6; i++) {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      // Alternar entre duas frequências altas para criar efeito de alarme
      const frequencies = [880, 1046.5] // A5 e C6 - notas altas
      oscillator.frequency.value = frequencies[i % 2]
      oscillator.type = 'square' // Onda quadrada para som mais penetrante

      // Volume ALTO e constante
      const startTime = now + i * 0.25
      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(0.8, startTime + 0.01) // Volume bem alto (0.8)
      gainNode.gain.setValueAtTime(0.8, startTime + 0.2)
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25)

      oscillator.start(startTime)
      oscillator.stop(startTime + 0.25)
    }
  }

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((time) => time - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      handleTimerComplete()
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft])

  const handleTimerComplete = () => {
    setIsRunning(false)
    
    // Tocar som de notificação
    playNotificationSound()

    // Mostrar alerta visual
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 5000) // Esconder após 5 segundos

    // Determinar mensagem baseada no modo
    const message = mode === 'pomodoro' 
      ? '🎉 Pomodoro completo! Hora de fazer uma pausa!' 
      : '✨ Pausa terminada! Hora de voltar ao trabalho!'

    // Mostrar notificação do navegador
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('🍅 Pomodoro Timer', {
        body: message,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        requireInteraction: true, // Notificação fica até ser fechada
      })
      
      // Vibração em dispositivos móveis (se suportado)
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200])
      }
      
      // Focar na janela quando clicar na notificação
      notification.onclick = () => {
        window.focus()
        notification.close()
      }
    }

    if (mode === 'pomodoro') {
      setPomodorosCompleted((count) => count + 1)
    }
  }

  const toggleTimer = () => {
    if (!isRunning && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
    setIsRunning(!isRunning)
  }

  const testNotification = () => {
    // Tocar som
    playNotificationSound()
    
    // Mostrar alerta visual
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 5000)
    
    // Solicitar permissão se necessário
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('🍅 Pomodoro Timer', {
              body: '✅ Notificações ativadas com sucesso!',
              icon: '/pwa-192x192.png',
            })
          }
        })
      } else if (Notification.permission === 'granted') {
        new Notification('🍅 Pomodoro Timer', {
          body: '🔔 Teste de notificação - está funcionando!',
          icon: '/pwa-192x192.png',
        })
      }
    }
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(TIMER_DURATIONS[mode])
  }

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode)
    setTimeLeft(TIMER_DURATIONS[newMode])
    setIsRunning(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = ((TIMER_DURATIONS[mode] - timeLeft) / TIMER_DURATIONS[mode]) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      {/* Alerta Visual */}
      {showAlert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl border-2 border-white flex items-center gap-3">
            <span className="text-3xl">
              {mode === 'pomodoro' ? '🎉' : '✨'}
            </span>
            <div>
              <div className="font-bold text-lg">
                {mode === 'pomodoro' ? 'Pomodoro Completo!' : 'Pausa Terminada!'}
              </div>
              <div className="text-sm opacity-90">
                {mode === 'pomodoro' ? 'Hora de descansar!' : 'Hora de focar!'}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="w-full max-w-md">
        {/* Card Principal */}
        <div className="bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-700">
          {/* Header com logo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">🍅 Pomodoro</h1>
            <p className="text-gray-400 text-sm">Mantenha o foco e a produtividade</p>
          </div>

          {/* Seletor de Modo */}
          <div className="flex gap-2 mb-8 bg-gray-900 p-1 rounded-xl">
            <button
              onClick={() => switchMode('pomodoro')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                mode === 'pomodoro'
                  ? 'bg-red-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Pomodoro
            </button>
            <button
              onClick={() => switchMode('shortBreak')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                mode === 'shortBreak'
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Pausa Curta
            </button>
            <button
              onClick={() => switchMode('longBreak')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                mode === 'longBreak'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Pausa Longa
            </button>
          </div>

          {/* Timer Display */}
          <div className="relative mb-8">
            {/* Círculo de progresso */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="90"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-700"
              />
              <circle
                cx="100"
                cy="100"
                r="90"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 90}`}
                strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
                className={`transition-all duration-1000 ${
                  mode === 'pomodoro'
                    ? 'text-red-500'
                    : mode === 'shortBreak'
                    ? 'text-green-500'
                    : 'text-blue-500'
                }`}
                strokeLinecap="round"
              />
            </svg>
            
            {/* Tempo no centro */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl font-bold text-white mb-2 font-mono">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-gray-400 text-sm uppercase tracking-wider">
                  {mode === 'pomodoro' ? 'Foco' : mode === 'shortBreak' ? 'Pausa Curta' : 'Pausa Longa'}
                </div>
              </div>
            </div>
          </div>

          {/* Controles */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={toggleTimer}
              className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all transform hover:scale-105 ${
                isRunning
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-gray-900'
                  : mode === 'pomodoro'
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : mode === 'shortBreak'
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              } shadow-lg`}
            >
              {isRunning ? '⏸ Pausar' : '▶ Iniciar'}
            </button>
            <button
              onClick={resetTimer}
              className="py-4 px-6 rounded-xl font-bold text-lg bg-gray-700 hover:bg-gray-600 text-white transition-all transform hover:scale-105 shadow-lg"
            >
              ↻ Reset
            </button>
          </div>

          {/* Estatísticas */}
          <div className="bg-gray-900 rounded-xl p-4 text-center mb-4">
            <div className="text-gray-400 text-sm mb-1">Pomodoros Completados</div>
            <div className="text-3xl font-bold text-white">{pomodorosCompleted}</div>
          </div>

          {/* Botão de Teste de Notificação */}
          <button
            onClick={testNotification}
            className="w-full py-3 px-4 rounded-xl font-medium bg-gray-900 hover:bg-gray-700 text-gray-400 hover:text-white transition-all border border-gray-700 hover:border-gray-600"
          >
            🔔 Testar Som e Notificação
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-500 text-sm">
          <p>Técnica Pomodoro: 25 min foco + 5 min pausa</p>
        </div>
      </div>
    </div>
  )
}

export default App
