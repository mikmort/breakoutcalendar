import { useEffect, useRef } from 'react'
import './App.css'

type EventBlock = {
  x: number
  y: number
  width: number
  height: number
  title: string
  broken: boolean
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    const paddle = { x: width / 2 - 40, y: height - 30, width: 80, height: 10, speed: 7 }
    const ball = { x: width / 2, y: height / 2, vx: 4, vy: -4, r: 8 }

    const events = [
      { day: 0, start: 9, end: 10, title: 'Standup' },
      { day: 1, start: 13, end: 14, title: 'Lunch with Alice' },
      { day: 2, start: 8, end: 9, title: 'Gym' },
      { day: 4, start: 15, end: 16, title: 'Presentation' },
      { day: 5, start: 11, end: 12, title: 'Doctor' },
    ]

    const brickWidth = width / 7 - 10
    const hourHeight = 20
    const bricks: EventBlock[] = events.map((e) => ({
      x: e.day * (brickWidth + 10) + 5,
      y: e.start * hourHeight + 40,
      width: brickWidth,
      height: (e.end - e.start) * hourHeight - 5,
      title: e.title,
      broken: false,
    }))

    let leftPressed = false
    let rightPressed = false

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

    const update = () => {
      if (leftPressed) paddle.x -= paddle.speed
      if (rightPressed) paddle.x += paddle.speed
      paddle.x = Math.max(Math.min(paddle.x, width - paddle.width), 0)

      ball.x += ball.vx
      ball.y += ball.vy

      if (ball.x < ball.r || ball.x > width - ball.r) ball.vx *= -1
      if (ball.y < ball.r) ball.vy *= -1
      if (ball.y > height - ball.r) {
        // reset
        ball.x = width / 2
        ball.y = height / 2
        ball.vy = -4
      }

      if (
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width &&
        ball.y + ball.r > paddle.y &&
        ball.y - ball.r < paddle.y + paddle.height
      ) {
        ball.vy *= -1
        ball.y = paddle.y - ball.r
      }

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
        }
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = '#eee'
      ctx.fillRect(0, 0, width, height)

      ctx.fillStyle = '#333'
      ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height)

      ctx.beginPath()
      ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2)
      ctx.fillStyle = '#ff5733'
      ctx.fill()

      bricks.forEach((b) => {
        if (b.broken) return
        ctx.fillStyle = '#add8e6'
        ctx.fillRect(b.x, b.y, b.width, b.height)
        ctx.strokeStyle = '#888'
        ctx.strokeRect(b.x, b.y, b.width, b.height)
        ctx.fillStyle = '#000'
        ctx.font = '12px sans-serif'
        ctx.fillText(b.title, b.x + 4, b.y + 14)
      })
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
    }
  }, [])

  return <canvas ref={canvasRef} width={800} height={600} />
}

export default App
