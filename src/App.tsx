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
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')
  const [timerCompletedInBackground, setTimerCompletedInBackground] = useState(false)
  const intervalRef = useRef<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const initialTimeRef = useRef<number>(TIMER_DURATIONS.pomodoro)

  useEffect(() => {
    // Inicializar AudioContext para criar sons personalizados
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    // Verificar permissão de notificação
    if ('Notification' in window) {
      console.log('Permissão de notificação atual:', Notification.permission)
      setNotificationPermission(Notification.permission)
    } else {
      console.warn('Notification API não suportada neste navegador')
    }
    
    // Recuperar estado salvo do localStorage
    const savedState = localStorage.getItem('pomodoroState')
    if (savedState) {
      try {
        const { startTime, initialTime, mode: savedMode, isRunning: wasRunning } = JSON.parse(savedState)
        if (wasRunning && startTime) {
          const elapsed = Math.floor((Date.now() - startTime) / 1000)
          const newTimeLeft = Math.max(0, initialTime - elapsed)
          
          if (newTimeLeft > 0) {
            setMode(savedMode)
            setTimeLeft(newTimeLeft)
            setIsRunning(true)
            startTimeRef.current = startTime
            initialTimeRef.current = initialTime
          } else {
            // Timer já terminou enquanto estava fechado - disparar notificação
            setMode(savedMode)
            localStorage.removeItem('pomodoroState')
            
            // Disparar notificação imediatamente
            const message = savedMode === 'pomodoro' 
              ? '🎉 Pomodoro completo! Hora de fazer uma pausa!' 
              : '✨ Pausa terminada! Hora de voltar ao trabalho!'
            
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('🍅 Pomodoro Timer', {
                body: message,
                icon: '/pwa-192x192.png',
                requireInteraction: true,
                tag: 'pomodoro-complete',
                silent: false,
              })
            }
            
            if ('vibrate' in navigator) {
              navigator.vibrate([200, 100, 200, 100, 200])
            }
            
            playNotificationSound()
          }
        }
      } catch (err) {
        console.error('Erro ao recuperar estado:', err)
        localStorage.removeItem('pomodoroState')
      }
    }
    
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

  // Timer baseado em timestamp real para funcionar mesmo quando a tela trava
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      // Salvar o tempo de início e o tempo inicial quando começar
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now()
        initialTimeRef.current = timeLeft
      }

      intervalRef.current = window.setInterval(() => {
        if (startTimeRef.current) {
          // Calcular tempo decorrido desde o início
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
          const newTimeLeft = Math.max(0, initialTimeRef.current - elapsed)
          
          setTimeLeft(newTimeLeft)
          
          if (newTimeLeft === 0) {
            handleTimerComplete()
          }
        }
      }, 100) // Atualizar a cada 100ms para maior precisão
    } else {
      // Limpar referências quando pausar
      startTimeRef.current = null
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft])

  // Detectar quando a página volta ao foco e recalcular o tempo
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Mostrar alerta se o timer terminou em background
        if (timerCompletedInBackground) {
          setTimerCompletedInBackground(false)
          setShowAlert(true)
          playNotificationSound()
          setTimeout(() => setShowAlert(false), 10000) // 10 segundos
          
          // Vibração extra forte
          if ('vibrate' in navigator) {
            navigator.vibrate([1000, 300, 1000, 300, 1000])
          }
        }
        
        // Verificar estado salvo quando a página volta ao foco
        const savedState = localStorage.getItem('pomodoroState')
        if (savedState) {
          try {
            const { startTime, initialTime } = JSON.parse(savedState)
            const elapsed = Math.floor((Date.now() - startTime) / 1000)
            const newTimeLeft = Math.max(0, initialTime - elapsed)
            
            if (newTimeLeft === 0) {
              // Timer terminou enquanto estava em background
              handleTimerComplete()
            } else if (isRunning && startTimeRef.current) {
              // Atualizar o tempo se ainda estiver rodando
              setTimeLeft(newTimeLeft)
            }
          } catch (err) {
            console.error('Erro ao verificar estado:', err)
          }
        }
      }
    }

    const handleFocus = () => {
      // Também verificar quando a janela recebe foco
      handleVisibilityChange()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [isRunning, timerCompletedInBackground])

  // Salvar estado no localStorage
  useEffect(() => {
    if (isRunning && startTimeRef.current) {
      const state = {
        startTime: startTimeRef.current,
        initialTime: initialTimeRef.current,
        mode,
        isRunning: true
      }
      localStorage.setItem('pomodoroState', JSON.stringify(state))
    } else {
      localStorage.removeItem('pomodoroState')
    }
  }, [isRunning, mode])

  // Verificador em background - roda mesmo quando a página não está visível
  useEffect(() => {
    const backgroundChecker = setInterval(() => {
      const savedState = localStorage.getItem('pomodoroState')
      if (savedState) {
        try {
          const { startTime, initialTime, mode: savedMode } = JSON.parse(savedState)
          const elapsed = Math.floor((Date.now() - startTime) / 1000)
          const timeLeft = initialTime - elapsed
          
          // Se o timer terminou
          if (timeLeft <= 0) {
            console.log('🔔 Timer terminou! Disparando notificação...')
            localStorage.removeItem('pomodoroState')
            
            // Disparar notificação
            const message = savedMode === 'pomodoro'
              ? '🎉 Pomodoro completo! Hora de fazer uma pausa!' 
              : '✨ Pausa terminada! Hora de voltar ao trabalho!'
            
            console.log('Permissão de notificação:', Notification.permission)
            
            if ('Notification' in window && Notification.permission === 'granted') {
              console.log('Criando notificação...')
              const notification = new Notification('🍅 Pomodoro Timer', {
                body: message,
                icon: '/pwa-192x192.png',
                requireInteraction: true,
                tag: 'pomodoro-complete',
                silent: false,
              })
              
              notification.onclick = () => {
                console.log('Notificação clicada')
                window.focus()
                notification.close()
              }
              
              console.log('Notificação criada com sucesso!')
            } else {
              console.warn('Notificação não pode ser criada. Permissão:', Notification.permission)
            }
            
            // Vibração forte e longa
            if ('vibrate' in navigator) {
              // Padrão de vibração bem forte: 3 segundos de vibrações
              navigator.vibrate([500, 200, 500, 200, 500, 200, 500, 200, 500])
            }
            
            // Se a página estiver visível, atualizar o estado
            if (!document.hidden) {
              setIsRunning(false)
              startTimeRef.current = null
              setTimeLeft(0)
              playNotificationSound()
              setShowAlert(true)
              setTimeout(() => setShowAlert(false), 5000)
              
              if (savedMode === 'pomodoro') {
                setPomodorosCompleted((count) => count + 1)
              }
            } else {
              // Se terminou em background, marcar para mostrar alerta quando voltar
              setTimerCompletedInBackground(true)
            }
          }
        } catch (err) {
          console.error('Erro no verificador em background:', err)
        }
      }
    }, 1000) // Verificar a cada segundo
    
    return () => clearInterval(backgroundChecker)
  }, [])

  const handleTimerComplete = () => {
    setIsRunning(false)
    startTimeRef.current = null
    localStorage.removeItem('pomodoroState')
    
    // Tocar som de notificação (só funciona se a página estiver em foco)
    playNotificationSound()

    // Mostrar alerta visual
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 5000) // Esconder após 5 segundos

    // Determinar mensagem baseada no modo
    const message = mode === 'pomodoro' 
      ? '🎉 Pomodoro completo! Hora de fazer uma pausa!' 
      : '✨ Pausa terminada! Hora de voltar ao trabalho!'

    // Vibração forte em dispositivos móveis (se suportado)
    if ('vibrate' in navigator) {
      // Padrão de vibração bem forte: 3 segundos
      navigator.vibrate([500, 200, 500, 200, 500, 200, 500, 200, 500])
    }

    // Mostrar notificação do navegador com som
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('🍅 Pomodoro Timer', {
        body: message,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        requireInteraction: true, // Notificação fica até ser fechada
        tag: 'pomodoro-complete', // Evita notificações duplicadas
        silent: false, // Tentar tocar som do sistema
      })
      
      // Focar na janela quando clicar na notificação
      notification.onclick = () => {
        window.focus()
        notification.close()
      }
    } else if ('Notification' in window && Notification.permission === 'default') {
      // Se não tem permissão, solicitar
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('🍅 Pomodoro Timer', {
            body: message,
            icon: '/pwa-192x192.png',
            requireInteraction: true,
          })
        }
      })
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
          setNotificationPermission(permission)
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

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission()
        setNotificationPermission(permission)
        console.log('Permissão de notificação:', permission)
        
        if (permission === 'granted') {
          new Notification('🍅 Pomodoro Timer', {
            body: '✅ Notificações ativadas! Agora você receberá alertas quando o timer terminar.',
            icon: '/pwa-192x192.png',
          })
          
          // Vibração de sucesso
          if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 100])
          }
        } else if (permission === 'denied') {
          alert('⚠️ Notificações bloqueadas!\n\nPara receber alertas:\n1. Vá em Ajustes > Safari > Notificações\n2. Permita notificações para este site')
        }
      } catch (err) {
        console.error('Erro ao solicitar permissão:', err)
        alert('⚠️ Este navegador não suporta notificações web.\n\nNo Safari iOS, notificações web só funcionam se você adicionar o app à tela inicial.')
      }
    } else {
      alert('⚠️ Notificações não suportadas!\n\nPara usar notificações no Safari iOS:\n1. Toque no botão Compartilhar\n2. Selecione "Adicionar à Tela de Início"\n3. Abra o app pela tela inicial')
    }
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(TIMER_DURATIONS[mode])
    startTimeRef.current = null
    initialTimeRef.current = TIMER_DURATIONS[mode]
  }

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode)
    setTimeLeft(TIMER_DURATIONS[newMode])
    setIsRunning(false)
    startTimeRef.current = null
    initialTimeRef.current = TIMER_DURATIONS[newMode]
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

          {/* Botões de Teste */}
          <div className="space-y-2">
            {/* Status de Notificação */}
            {notificationPermission !== 'granted' && (
              <button
                onClick={requestNotificationPermission}
                className="w-full py-2.5 sm:py-3 md:py-4 px-3 sm:px-4 md:px-6 rounded-xl font-bold text-sm sm:text-base md:text-lg bg-orange-600 hover:bg-orange-700 text-white transition-all border-2 border-orange-500 animate-pulse"
              >
                🔔 Ativar Notificações
              </button>
            )}
            
            {notificationPermission === 'granted' && (
              <div className="w-full py-2 px-3 rounded-xl text-sm bg-green-900/30 text-green-400 border border-green-700 text-center">
                ✅ Notificações ativadas
              </div>
            )}
            
            <button
              onClick={testNotification}
              className="w-full py-2.5 sm:py-3 md:py-4 px-3 sm:px-4 md:px-6 rounded-xl font-medium text-sm sm:text-base md:text-lg bg-gray-900 hover:bg-gray-700 text-gray-400 hover:text-white transition-all border border-gray-700 hover:border-gray-600"
            >
              🔔 Testar Som e Notificação
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4 sm:mt-6 text-gray-500 text-xs sm:text-sm md:text-base px-4 space-y-2">
          <p>Técnica Pomodoro: 25 min foco + 5 min pausa</p>
          {wakeLockActive && (
            <p className="text-green-400 text-xs sm:text-sm">
              🔒 Tela mantida ativa durante o timer
            </p>
          )}
          {/* Aviso sobre iOS */}
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3 text-xs text-blue-300">
            <p className="font-semibold mb-1">📱 Dica para iOS/Safari:</p>
            <p>Mantenha o app aberto ou a tela ligada para receber o alerta quando o timer terminar. Notificações em background não funcionam no Safari iOS.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
