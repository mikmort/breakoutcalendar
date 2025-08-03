import { useEffect, useRef, useState } from 'react'
import './App.css'
import { parseICalFile, getSampleEvents, type CalendarEvent } from './icalParser'

type EventBlock = {
  x: number
  y: number
  width: number
  height: number
  title: string
  broken: boolean
}

type GameState = 'playing' | 'levelCleared' | 'gameOver'

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const gameRestartRef = useRef(0) // Use this to trigger game restarts
  const [events, setEvents] = useState<CalendarEvent[]>(getSampleEvents())
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [gameState, setGameState] = useState<GameState>('playing')
  const [soundEnabled, setSoundEnabled] = useState(true)

  // Calculate responsive canvas dimensions
  const getCanvasDimensions = () => {
    const viewportHeight = window.innerHeight
    if (viewportHeight <= 700) return { width: 500, height: 500 }
    if (viewportHeight <= 800) return { width: 600, height: 600 }
    if (viewportHeight <= 900) return { width: 700, height: 700 }
    if (viewportHeight <= 1000) return { width: 800, height: 800 }
    return { width: 800, height: 900 }
  }

  const [canvasDimensions, setCanvasDimensions] = useState(getCanvasDimensions())

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setCanvasDimensions(getCanvasDimensions())
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (content) {
        try {
          const parsedEvents = parseICalFile(content)
          if (parsedEvents.length > 0) {
            setEvents(parsedEvents)
            resetGame()
          } else {
            alert('No valid events found in the iCal file')
          }
        } catch (error) {
          console.error('Error parsing iCal file:', error)
          alert('Error parsing iCal file. Please check the file format.')
        }
      }
    }
    reader.readAsText(file)
  }

  const resetGame = () => {
    setScore(0)
    setLevel(1)
    setGameState('playing')
  }

  const startAgain = () => {
    setScore(0)
    setLevel(1)
    setGameState('playing')
    gameRestartRef.current += 1 // Trigger game restart
  }

  const playSound = (frequency: number, duration: number) => {
    if (!soundEnabled) return
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
      oscillator.type = 'square'
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + duration)
    } catch (error) {
      // Fallback if Web Audio API is not supported
      console.log('Sound not available')
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    const paddle = { x: width / 2 - 40, y: height - 40, width: 80, height: 10, speed: 7, prevX: width / 2 - 40 }
    const baseSpeed = 4
    let currentBallSpeed = baseSpeed + (level - 1) * 1.5 // Use let for dynamic updates

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const leftMargin = 60 // Space for time labels
    const calendarWidth = width - leftMargin
    const brickWidth = calendarWidth / 7 - 10
    const hourHeight = 35 // Increased from 20 to 35 for more vertical space
    const headerHeight = 80 // Increased to make room for score/level display
    const startHour = 8 // Start displaying from 8 AM
    const endHour = 18 // End at 6 PM
    
    // Random starting position horizontally, halfway between bottom and blocks vertically
    const blocksBottomY = (endHour - startHour) * hourHeight + headerHeight + 20
    const startY = paddle.y - (paddle.y - blocksBottomY) / 2
    const startX = leftMargin + Math.random() * (width - leftMargin - 20) + 10 // Random X within calendar area
    const ball = { 
      x: startX, 
      y: startY, 
      vx: currentBallSpeed * (Math.random() > 0.5 ? 1 : -1), // Random initial direction
      vy: -currentBallSpeed, 
      r: 8 
    }
    
    const bricks: EventBlock[] = events.map((e) => ({
      x: e.day * (brickWidth + 10) + leftMargin + 5,
      y: (e.start - startHour) * hourHeight + headerHeight + 20,
      width: brickWidth,
      height: (e.end - e.start) * hourHeight - 5,
      title: e.title,
      broken: false,
    }))

    let leftPressed = false
    let rightPressed = false
    let currentScore = score
    let currentLevel = level
    let currentGameState = gameState
    let levelClearedTimer: number | null = null
    let gameOverTimer: number | null = null

    const keyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'ArrowLeft') leftPressed = true
      if (ev.key === 'ArrowRight') rightPressed = true
    }
    const keyUp = (ev: KeyboardEvent) => {
      if (ev.key === 'ArrowLeft') leftPressed = false
      if (ev.key === 'ArrowRight') rightPressed = false
    }

    document.addEventListener('keydown', keyDown)
    document.addEventListener('keyup', keyUp)

    // Touch controls for mobile devices
    let isTouching = false

    const handleTouchStart = (ev: TouchEvent) => {
      ev.preventDefault() // Prevent scrolling
      if (ev.touches.length > 0) {
        isTouching = true
      }
    }

    const handleTouchMove = (ev: TouchEvent) => {
      ev.preventDefault() // Prevent scrolling
      if (isTouching && ev.touches.length > 0) {
        const rect = canvas.getBoundingClientRect()
        const newTouchX = ev.touches[0].clientX - rect.left
        
        // Move paddle to follow touch position (centered on touch)
        paddle.x = Math.max(0, Math.min(width - paddle.width, newTouchX - paddle.width / 2))
      }
    }

    const handleTouchEnd = (ev: TouchEvent) => {
      ev.preventDefault()
      isTouching = false
    }

    // Add touch event listeners
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false })

    const handleCanvasClick = (ev: MouseEvent) => {
      if (currentGameState === 'gameOver') {
        const rect = canvas.getBoundingClientRect()
        const clickX = ev.clientX - rect.left
        const clickY = ev.clientY - rect.top
        
        // Check if click is in the text area (approximate bounds)
        const textY = height / 2 + 60
        const textWidth = 400 // Approximate width of the text (increased for longer text)
        const textHeight = 30 // Approximate height of the text
        
        if (
          clickX >= width / 2 - textWidth / 2 &&
          clickX <= width / 2 + textWidth / 2 &&
          clickY >= textY - textHeight / 2 &&
          clickY <= textY + textHeight / 2
        ) {
          // Restart the game
          setScore(0)
          setLevel(1)
          setGameState('playing')
          gameRestartRef.current += 1
        }
      }
    }

    const handleCanvasMouseMove = (ev: MouseEvent) => {
      if (currentGameState === 'gameOver') {
        const rect = canvas.getBoundingClientRect()
        const mouseX = ev.clientX - rect.left
        const mouseY = ev.clientY - rect.top
        
        // Check if mouse is over the text area
        const textY = height / 2 + 60
        const textWidth = 400
        const textHeight = 30
        
        if (
          mouseX >= width / 2 - textWidth / 2 &&
          mouseX <= width / 2 + textWidth / 2 &&
          mouseY >= textY - textHeight / 2 &&
          mouseY <= textY + textHeight / 2
        ) {
          canvas.style.cursor = 'pointer'
        } else {
          canvas.style.cursor = 'default'
        }
      } else {
        canvas.style.cursor = 'default'
      }
    }

    canvas.addEventListener('click', handleCanvasClick)
    canvas.addEventListener('mousemove', handleCanvasMouseMove)

    const resetBallPosition = () => {
      const newStartX = leftMargin + Math.random() * (width - leftMargin - 20) + 10
      const newStartY = paddle.y - (paddle.y - blocksBottomY) / 2
      ball.x = newStartX
      ball.y = newStartY
    }

    const update = () => {
      if (currentGameState === 'levelCleared') {
        if (levelClearedTimer === null) {
          levelClearedTimer = window.setTimeout(() => {
            currentLevel++
            setLevel(currentLevel)
            currentGameState = 'playing'
            setGameState('playing')
            
            // Reset ball position and speed for new level
            resetBallPosition()
            currentBallSpeed = baseSpeed + (currentLevel - 1) * 1.5
            ball.vx = currentBallSpeed * (Math.random() > 0.5 ? 1 : -1)
            ball.vy = -currentBallSpeed
            
            // Reset all bricks
            bricks.forEach(b => b.broken = false)
            levelClearedTimer = null
          }, 2000)
        }
        return
      }

      if (currentGameState === 'gameOver') {
        // Don't auto-restart, wait for user action
        return
      }

      if (currentGameState !== 'playing') return

      // Store previous paddle position for physics calculation
      paddle.prevX = paddle.x

      if (leftPressed) paddle.x -= paddle.speed
      if (rightPressed) paddle.x += paddle.speed
      paddle.x = Math.max(Math.min(paddle.x, width - paddle.width), 0)

      // Calculate paddle velocity for physics
      const paddleVelocity = paddle.x - paddle.prevX

      ball.x += ball.vx
      ball.y += ball.vy

      if (ball.x < ball.r || ball.x > width - ball.r) {
        ball.vx *= -1
        playSound(300, 0.1) // Wall bounce sound
      }
      if (ball.y < ball.r) {
        ball.vy *= -1
        playSound(300, 0.1) // Ceiling bounce sound
      }
      if (ball.y > height - ball.r) {
        // Game over
        currentGameState = 'gameOver'
        setGameState('gameOver')
        return
      }

      if (
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width &&
        ball.y + ball.r > paddle.y &&
        ball.y - ball.r < paddle.y + paddle.height
      ) {
        ball.vy *= -1
        ball.y = paddle.y - ball.r
        playSound(400, 0.15) // Paddle hit sound
        
        // Add paddle physics - transfer some paddle velocity to ball
        const paddleInfluence = 0.3 // How much paddle movement affects ball
        ball.vx += paddleVelocity * paddleInfluence
        
        // Add some randomness based on where ball hits paddle
        const hitPosition = (ball.x - paddle.x) / paddle.width // 0 to 1
        const angleInfluence = (hitPosition - 0.5) * 2 // -1 to 1
        ball.vx += angleInfluence * 2
        
        // Ensure ball doesn't get too slow or too fast horizontally
        const maxSpeed = currentBallSpeed * 1.5
        ball.vx = Math.max(-maxSpeed, Math.min(maxSpeed, ball.vx))
      }

      let blocksDestroyed = 0
      bricks.forEach((b) => {
        if (b.broken) return
        if (
          ball.x > b.x &&
          ball.x < b.x + b.width &&
          ball.y - ball.r < b.y + b.height &&
          ball.y + ball.r > b.y
        ) {
          ball.vy *= -1
          b.broken = true
          blocksDestroyed++
          currentScore += 100
          setScore(currentScore) // Update React state
          playSound(600, 0.2) // Block break sound - higher pitch
        }
      })

      // Check if all blocks are destroyed
      const remainingBlocks = bricks.filter(b => !b.broken).length
      if (remainingBlocks === 0) {
        currentGameState = 'levelCleared'
        setGameState('levelCleared')
      }
    }

    // Helper function to wrap text within a given width
    const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
      const words = text.split(' ')
      let line = ''
      let currentY = y

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' '
        const metrics = ctx.measureText(testLine)
        const testWidth = metrics.width
        
        if (testWidth > maxWidth && i > 0) {
          ctx.fillText(line, x, currentY)
          line = words[i] + ' '
          currentY += lineHeight
        } else {
          line = testLine
        }
      }
      ctx.fillText(line, x, currentY)
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = '#eee'
      ctx.fillRect(0, 0, width, height)

      // Draw score and level above the day headers with better styling
      // Score on the left
      ctx.fillStyle = '#2E8B57' // Sea green color
      ctx.font = 'bold 20px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(`Score: ${currentScore}`, 10, 25)
      
      // Level on the right
      ctx.fillStyle = '#B8860B' // Dark golden rod color
      ctx.font = 'bold 20px sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(`Level: ${currentLevel}`, width - 10, 25)

      // Draw time labels on the left
      ctx.fillStyle = '#666'
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'right'
      for (let hour = startHour; hour <= endHour; hour++) {
        const y = (hour - startHour) * hourHeight + headerHeight + 35
        const timeLabel = hour === 12 ? '12 PM' : 
                         hour > 12 ? `${hour - 12} PM` : 
                         hour === 0 ? '12 AM' : `${hour} AM`
        ctx.fillText(timeLabel, leftMargin - 10, y)
      }

      // Draw day-of-week headers (moved down to avoid score overlap)
      ctx.fillStyle = '#333'
      ctx.font = 'bold 18px sans-serif'
      ctx.textAlign = 'center'
      daysOfWeek.forEach((day, index) => {
        const x = index * (brickWidth + 10) + leftMargin + 5 + brickWidth / 2
        ctx.fillText(day, x, 55) // Moved down from 35 to 55
      })

      // Draw horizontal grid lines for hours
      ctx.strokeStyle = '#ddd'
      ctx.lineWidth = 1
      for (let hour = startHour; hour <= endHour; hour++) {
        const y = (hour - startHour) * hourHeight + headerHeight + 20
        ctx.beginPath()
        ctx.moveTo(leftMargin, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Draw vertical grid lines for days
      for (let day = 0; day <= 7; day++) {
        const x = day * (brickWidth + 10) + leftMargin + 5
        ctx.beginPath()
        ctx.moveTo(x, headerHeight + 20)
        ctx.lineTo(x, (endHour - startHour) * hourHeight + headerHeight + 20)
        ctx.stroke()
      }

      // Draw paddle
      ctx.fillStyle = '#333'
      ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height)

      // Draw ball
      ctx.beginPath()
      ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2)
      ctx.fillStyle = '#ff5733'
      ctx.fill()

      // Draw event blocks
      bricks.forEach((b) => {
        if (b.broken) return
        ctx.fillStyle = '#add8e6'
        ctx.fillRect(b.x, b.y, b.width, b.height)
        ctx.strokeStyle = '#888'
        ctx.strokeRect(b.x, b.y, b.width, b.height)
        ctx.fillStyle = '#000'
        ctx.font = '12px sans-serif'
        ctx.textAlign = 'left'
        
        // Use text wrapping for meeting titles
        wrapText(b.title, b.x + 4, b.y + 14, b.width - 8, 14)
      })

      // Draw game state messages
      if (currentGameState === 'levelCleared') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
        ctx.fillRect(0, 0, width, height)
        ctx.fillStyle = '#00ff00'
        ctx.font = 'bold 48px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('Level Cleared!', width / 2, height / 2 - 30)
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 24px sans-serif'
        ctx.fillText(`Starting Level ${currentLevel + 1}...`, width / 2, height / 2 + 30)
      } else if (currentGameState === 'gameOver') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
        ctx.fillRect(0, 0, width, height)
        ctx.fillStyle = '#ff0000'
        ctx.font = 'bold 48px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('Game Over!', width / 2, height / 2 - 30)
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 24px sans-serif'
        ctx.fillText(`Final Score: ${currentScore}`, width / 2, height / 2 + 30)
        
        // Make the restart text look clickable
        ctx.fillStyle = '#4CAF50' // Green color to indicate it's interactive
        ctx.font = 'bold 20px sans-serif'
        ctx.fillText('📱 Click here or "Start Again" button to play!', width / 2, height / 2 + 60)
      }
    }

    const loop = () => {
      update()
      draw()
      requestAnimationFrame(loop)
    }
    loop()

    return () => {
      document.removeEventListener('keydown', keyDown)
      document.removeEventListener('keyup', keyUp)
      canvas.removeEventListener('click', handleCanvasClick)
      canvas.removeEventListener('mousemove', handleCanvasMouseMove)
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchend', handleTouchEnd)
      if (levelClearedTimer !== null) {
        clearTimeout(levelClearedTimer)
      }
      if (gameOverTimer !== null) {
        clearTimeout(gameOverTimer)
      }
    }
  }, [events, canvasDimensions, gameRestartRef.current]) // Restart when events, size, or restart trigger changes

  return (
    <div className="app-container">
      <h1 className="app-title">Calendar Breakout!</h1>
      <div className="controls">
        <input
          ref={fileInputRef}
          type="file"
          accept=".ics"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
        <button 
          className="import-button"
          onClick={() => fileInputRef.current?.click()}
        >
          Import Calendar (iCal)
        </button>
        <button 
          className="reset-button"
          onClick={() => {
            setEvents(getSampleEvents())
            resetGame()
          }}
        >
          Reset to Sample
        </button>
        <button 
          className={`sound-toggle ${soundEnabled ? 'sound-on' : 'sound-off'}`}
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={`Sound ${soundEnabled ? 'On' : 'Off'}`}
        >
          🔊 {soundEnabled ? 'Sound On' : 'Sound Off'}
        </button>
        {gameState === 'gameOver' && (
          <button 
            className="start-again-button"
            onClick={startAgain}
          >
            🎮 Start Again
          </button>
        )}
      </div>
      <canvas 
        ref={canvasRef} 
        width={canvasDimensions.width} 
        height={canvasDimensions.height} 
      />
      <div className="instructions">
        <p>Use arrow keys to move the paddle and break your calendar events!</p>
        <p className="desktop-only">Import your own iCal file to play with your real calendar.</p>
        <p className="mobile-only">Touch and drag on the game area to move the paddle!</p>
      </div>
    </div>
  )
}

export default App
