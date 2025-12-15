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
  const intervalRef = useRef<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Criar elemento de áudio para notificação
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE')
    
    return () => {
      if (audioRef.current) {
        audioRef.current = null
      }
    }
  }, [])

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
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Ignorar erro se o navegador bloquear o áudio
      })
    }

    // Mostrar notificação do navegador
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro Timer', {
        body: mode === 'pomodoro' ? 'Hora de fazer uma pausa!' : 'Hora de voltar ao trabalho!',
        icon: '/pwa-192x192.png',
      })
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
          <div className="bg-gray-900 rounded-xl p-4 text-center">
            <div className="text-gray-400 text-sm mb-1">Pomodoros Completados</div>
            <div className="text-3xl font-bold text-white">{pomodorosCompleted}</div>
          </div>
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
