"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Coins } from "lucide-react"

type CardType = {
  id: string
  name: string
  price: number
  minPrize: number
  maxPrize: number
  color: string
}

interface ScratchCardProps {
  card: CardType
  onScratchComplete: () => void
  prize: number | null
  isScratching: boolean
}

export function ScratchCard({ card, onScratchComplete, prize, isScratching }: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isRevealed, setIsRevealed] = useState(false)
  const [scratchPercentage, setScratchPercentage] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const width = canvas.width
    const height = canvas.height

    // Draw scratch layer
    ctx.fillStyle = `#${
      card.id === "basic" ? "3b82f6" : card.id === "silver" ? "94a3b8" : card.id === "gold" ? "eab308" : "a855f7"
    }`
    ctx.fillRect(0, 0, width, height)

    // Add some texture to the scratch layer
    for (let i = 0; i < 5000; i++) {
      ctx.fillStyle = "rgba(255,255,255,0.1)"
      ctx.beginPath()
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 2, 0, Math.PI * 2)
      ctx.fill()
    }

    // Add text to indicate scratching
    ctx.fillStyle = "white"
    ctx.font = "bold 24px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("SCRATCH HERE!", width / 2, height / 2)

    // Variables for scratch tracking
    let isDrawing = false
    let lastX = 0
    let lastY = 0
    const scratchedPixels = new Set()
    const totalPixels = width * height

    // Event listeners for scratching
    const startDrawing = (e: MouseEvent | TouchEvent) => {
      isDrawing = true
      const { offsetX, offsetY } = getCoordinates(e)
      lastX = offsetX
      lastY = offsetY
    }

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing) return
      e.preventDefault()

      const { offsetX, offsetY } = getCoordinates(e)

      // Draw scratch line
      ctx.globalCompositeOperation = "destination-out"
      ctx.lineWidth = 40
      ctx.lineCap = "round"
      ctx.beginPath()
      ctx.moveTo(lastX, lastY)
      ctx.lineTo(offsetX, offsetY)
      ctx.stroke()

      // Track scratched pixels (approximate)
      const distance = Math.sqrt(Math.pow(offsetX - lastX, 2) + Math.pow(offsetY - lastY, 2))
      const angle = Math.atan2(offsetY - lastY, offsetX - lastX)
      const brushWidth = 40

      for (let i = 0; i < distance; i += 5) {
        const x = Math.floor(lastX + Math.cos(angle) * i)
        const y = Math.floor(lastY + Math.sin(angle) * i)

        for (let j = -brushWidth / 2; j < brushWidth / 2; j += 5) {
          const px = Math.floor(x + Math.cos(angle + Math.PI / 2) * j)
          const py = Math.floor(y + Math.sin(angle + Math.PI / 2) * j)

          if (px >= 0 && px < width && py >= 0 && py < height) {
            const pixelIndex = py * width + px
            scratchedPixels.add(pixelIndex)
          }
        }
      }

      // Calculate scratch percentage
      const percentage = Math.min(100, Math.floor((scratchedPixels.size / totalPixels) * 100 * 3))
      setScratchPercentage(percentage)

      // Auto-reveal if more than 50% is scratched
      if (percentage >= 50 && !isRevealed) {
        setIsRevealed(true)
        onScratchComplete()
      }

      lastX = offsetX
      lastY = offsetY
    }

    const stopDrawing = () => {
      isDrawing = false
    }

    const getCoordinates = (e: MouseEvent | TouchEvent): { offsetX: number; offsetY: number } => {
      let offsetX, offsetY

      if (window.TouchEvent && e instanceof TouchEvent) {
        const rect = canvas.getBoundingClientRect()
        const touch = e.touches[0] || e.changedTouches[0]
        offsetX = touch.clientX - rect.left
        offsetY = touch.clientY - rect.top
      } else {
        const mouseEvent = e as MouseEvent
        offsetX = mouseEvent.offsetX
        offsetY = mouseEvent.offsetY
      }

      return { offsetX, offsetY }
    }

    canvas.addEventListener("mousedown", startDrawing)
    canvas.addEventListener("mousemove", draw)
    canvas.addEventListener("mouseup", stopDrawing)
    canvas.addEventListener("mouseleave", stopDrawing)

    canvas.addEventListener("touchstart", startDrawing)
    canvas.addEventListener("touchmove", draw)
    canvas.addEventListener("touchend", stopDrawing)

    return () => {
      canvas.removeEventListener("mousedown", startDrawing)
      canvas.removeEventListener("mousemove", draw)
      canvas.removeEventListener("mouseup", stopDrawing)
      canvas.removeEventListener("mouseleave", stopDrawing)

      canvas.removeEventListener("touchstart", startDrawing)
      canvas.removeEventListener("touchmove", draw)
      canvas.removeEventListener("touchend", stopDrawing)
    }
  }, [card, onScratchComplete])

  return (
    <Card className="w-full max-w-md overflow-hidden">
      <CardContent className="p-0">
        <div className="relative">
          <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-r from-gray-900 to-gray-800 p-6">
            {prize !== null ? (
              <div className="text-center">
                {prize > 0 ? (
                  <>
                    <Coins className="mx-auto h-16 w-16 text-yellow-400" />
                    <h3 className="mt-2 text-3xl font-bold text-white">{prize} Tokens</h3>
                    <p className="mt-1 text-white/80">You won!</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-3xl font-bold text-white">Better luck next time!</h3>
                    <p className="mt-1 text-white/80">No prize this time</p>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center text-white/80">
                {isScratching ? "Revealing..." : "Scratch to reveal your prize!"}
              </div>
            )}
          </div>

          {prize === null && (
            <canvas ref={canvasRef} width={400} height={300} className="absolute inset-0 h-full w-full touch-none" />
          )}
        </div>

        <div className="bg-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-bold">{card.name}</h3>
            <span className="text-sm text-muted-foreground">{scratchPercentage}% scratched</span>
          </div>

          {!isRevealed && prize === null && (
            <Button
              onClick={() => {
                setIsRevealed(true)
                onScratchComplete()
              }}
              className="w-full"
              disabled={isScratching}
            >
              {isScratching ? "Revealing..." : "Reveal Instantly"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
