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
  const [wakeLockActive, setWakeLockActive] = useState(false)
  const intervalRef = useRef<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    // Inicializar AudioContext para criar sons personalizados
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Função para ativar Wake Lock (manter tela ligada)
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen')
        setWakeLockActive(true)
        console.log('Wake Lock ativado - tela não irá desligar')
        
        // Re-ativar wake lock se a tela for desbloqueada
        wakeLockRef.current.addEventListener('release', () => {
          setWakeLockActive(false)
          console.log('Wake Lock liberado')
        })
      }
    } catch (err) {
      console.error('Erro ao ativar Wake Lock:', err)
      setWakeLockActive(false)
    }
  }

  // Função para liberar Wake Lock
  const releaseWakeLock = async () => {
    try {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release()
        wakeLockRef.current = null
        setWakeLockActive(false)
        console.log('Wake Lock desativado')
      }
    } catch (err) {
      console.error('Erro ao liberar Wake Lock:', err)
    }
  }

  // Função para tocar um som de alarme alto e chamativo
  const playNotificationSound = async () => {
    if (!audioContextRef.current) return

    const ctx = audioContextRef.current
    
    // Retomar AudioContext se estiver suspenso (requisito dos navegadores)
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume()
        console.log('AudioContext retomado')
      } catch (err) {
        console.error('Erro ao retomar AudioContext:', err)
        return
      }
    }

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

  // Gerenciar Wake Lock quando o timer está rodando
  useEffect(() => {
    if (isRunning) {
      requestWakeLock()
    } else {
      releaseWakeLock()
    }

    return () => {
      releaseWakeLock()
    }
  }, [isRunning])

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

  const toggleTimer = async () => {
    // Retomar AudioContext na primeira interação do usuário
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      try {
        await audioContextRef.current.resume()
        console.log('AudioContext ativado')
      } catch (err) {
        console.error('Erro ao ativar AudioContext:', err)
      }
    }

    if (!isRunning && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
    setIsRunning(!isRunning)
  }

  const testNotification = async () => {
    // Retomar AudioContext se necessário
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      try {
        await audioContextRef.current.resume()
        console.log('AudioContext ativado para teste')
      } catch (err) {
        console.error('Erro ao ativar AudioContext:', err)
      }
    }

    // Tocar som
    await playNotificationSound()
    
    // Mostrar alerta visual
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 5000)
    
    // Vibração em dispositivos móveis (se suportado)
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200])
    }
    
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-3 sm:p-4">
      {/* Alerta Visual */}
      {showAlert && (
        <div className="fixed top-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 z-50 animate-bounce max-w-md mx-auto">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 sm:px-8 py-3 sm:py-4 rounded-2xl shadow-2xl border-2 border-white flex items-center gap-2 sm:gap-3">
            <span className="text-2xl sm:text-3xl flex-shrink-0">
              {mode === 'pomodoro' ? '🎉' : '✨'}
            </span>
            <div className="min-w-0">
              <div className="font-bold text-base sm:text-lg truncate">
                {mode === 'pomodoro' ? 'Pomodoro Completo!' : 'Pausa Terminada!'}
              </div>
              <div className="text-xs sm:text-sm opacity-90 truncate">
                {mode === 'pomodoro' ? 'Hora de descansar!' : 'Hora de focar!'}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="w-full max-w-md md:max-w-lg">
        {/* Card Principal */}
        <div className="bg-gray-800 rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 border border-gray-700">
          {/* Header com logo */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">🍅 Pomodoro</h1>
              {wakeLockActive && (
                <span className="text-green-400 text-sm md:text-base animate-pulse" title="Tela mantida ativa">
                  🔒
                </span>
              )}
            </div>
            <p className="text-gray-400 text-xs sm:text-sm md:text-base">Mantenha o foco e a produtividade</p>
          </div>

          {/* Seletor de Modo */}
          <div className="flex gap-1 sm:gap-2 mb-6 sm:mb-8 bg-gray-900 p-1 rounded-xl">
            <button
              onClick={() => switchMode('pomodoro')}
              className={`flex-1 py-2 sm:py-3 md:py-4 px-2 sm:px-4 md:px-6 rounded-lg font-medium text-xs sm:text-base md:text-lg transition-all whitespace-nowrap ${
                mode === 'pomodoro'
                  ? 'bg-red-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Pomodoro
            </button>
            <button
              onClick={() => switchMode('shortBreak')}
              className={`flex-1 py-2 sm:py-3 md:py-4 px-2 sm:px-4 md:px-6 rounded-lg font-medium text-xs sm:text-base md:text-lg transition-all whitespace-nowrap ${
                mode === 'shortBreak'
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="sm:hidden">Pausa C.</span>
              <span className="hidden sm:inline">Pausa Curta</span>
            </button>
            <button
              onClick={() => switchMode('longBreak')}
              className={`flex-1 py-2 sm:py-3 md:py-4 px-2 sm:px-4 md:px-6 rounded-lg font-medium text-xs sm:text-base md:text-lg transition-all whitespace-nowrap ${
                mode === 'longBreak'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="sm:hidden">Pausa L.</span>
              <span className="hidden sm:inline">Pausa Longa</span>
            </button>
          </div>

          {/* Timer Display */}
          <div className="relative mb-6 sm:mb-8 w-full max-w-[280px] sm:max-w-sm mx-auto aspect-square">
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
              <div className="text-center px-2">
                <div className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-1 sm:mb-2 font-mono">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-gray-400 text-xs sm:text-sm md:text-base uppercase tracking-wider">
                  {mode === 'pomodoro' ? 'FOCO' : mode === 'shortBreak' ? 'PAUSA CURTA' : 'PAUSA LONGA'}
                </div>
              </div>
            </div>
          </div>

          {/* Controles */}
          <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6">
            <button
              onClick={toggleTimer}
              className={`flex-1 py-3 sm:py-4 md:py-5 px-4 sm:px-6 md:px-8 rounded-xl font-bold text-base sm:text-lg md:text-xl transition-all transform hover:scale-105 active:scale-95 ${
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
              className="py-3 sm:py-4 md:py-5 px-4 sm:px-6 md:px-8 rounded-xl font-bold text-base sm:text-lg md:text-xl bg-gray-700 hover:bg-gray-600 text-white transition-all transform hover:scale-105 active:scale-95 shadow-lg whitespace-nowrap"
            >
              <span className="hidden sm:inline">↻ Reset</span>
              <span className="sm:hidden">↻</span>
            </button>
          </div>

          {/* Estatísticas */}
          <div className="bg-gray-900 rounded-xl p-3 sm:p-4 md:p-5 text-center mb-3 sm:mb-4">
            <div className="text-gray-400 text-xs sm:text-sm md:text-base mb-1">Pomodoros Completados</div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{pomodorosCompleted}</div>
          </div>

          {/* Botão de Teste de Notificação */}
          <button
            onClick={testNotification}
            className="w-full py-2.5 sm:py-3 md:py-4 px-3 sm:px-4 md:px-6 rounded-xl font-medium text-sm sm:text-base md:text-lg bg-gray-900 hover:bg-gray-700 text-gray-400 hover:text-white transition-all border border-gray-700 hover:border-gray-600"
          >
            🔔 Testar Som e Notificação
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-4 sm:mt-6 text-gray-500 text-xs sm:text-sm md:text-base px-4 space-y-1">
          <p>Técnica Pomodoro: 25 min foco + 5 min pausa</p>
          {wakeLockActive && (
            <p className="text-green-400 text-xs sm:text-sm">
              🔒 Tela mantida ativa durante o timer
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
