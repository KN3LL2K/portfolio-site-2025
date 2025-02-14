import React, { useEffect, useRef } from "react"
import p5 from "p5"
import { Grid } from "@/scripts/grid"
import PoissonDiskSampling from "poisson-disk-sampling"
import { useMediaQuery } from "../useMediaQuery"
import * as Tone from "tone"

export interface CanvasProps {
  className?: string
}

const debug = false
const MAX_HEIGHT = 192
const MAX_WIDTH = 512
const CELL_SIZE = MAX_WIDTH / 32
const MARGIN = 40

const NUM_STEPS = 128
const STEP_LENGTH = 16
const LINE_COUNT = 2048
const LINE_WEIGHT = 8

const NOISE_SCALE = 0.05
const SPEED_MODIFIER = 1.5
const POINT_SIZE = 2
const POINT_WEIGHT = CELL_SIZE - 2
const HOVER_RADIUS = POINT_WEIGHT * 0.5 // Distance at which hover effect activates
const HOVER_SCALE = 1.32 // How much larger points get when hovered
const ROTATION_SPEED = 0.01

const SPRING_STRENGTH = 0.2
const SPRING_DAMPING = 0.75
const REST_SIZE = POINT_WEIGHT // Normal point size
const MAX_SIZE = CELL_SIZE * 1.5 // Maximum point size when hovered
const BOUNCE_DURATION = 300

interface Point {
  x: number
  y: number
  z: number
  size: number // Current size
  velocity: number // For spring physics
  targetSize: number // Size we're moving towards
  lastHitTime: number
  isHovered: boolean
}
const COLORS = [
  // [235, 106, 130],
  // [159, 90, 110],
  // [242, 196, 180],
  // [125, 175, 156],
  // [37, 99, 235, 0.8],
  [37, 99, 235],
  [59, 130, 246],
  [96, 165, 250],
  [147, 197, 253],
  [219, 234, 254],
  [219, 234, 254],
  // [96, 165, 250],
  // [219, 234, 254],
]

function hoverNoise(startTime: number) {
  const noiseSynth = new Tone.NoiseSynth({
    noise: {
      type: "white",
    },
    envelope: {
      attack: 0.005,
      decay: 0.05,
      sustain: 0.25,
      release: 0.5,
      decayCurve: "exponential",
      // release: 0.5,
    },
  }).toDestination()
  const lp = new Tone.Filter(20000, "lowpass", -48) //.toDestination()

  // const hp = new Tone.Filter(200, "highpass", -48).toDestination()
  // lp.frequency.rampTo(200, 0.1);
  // noiseSynth.connect(hp)
  noiseSynth.connect(lp)
  // startTime += Tone.Time("16n").toSeconds()
  noiseSynth.triggerAttackRelease("32n", startTime)
  return noiseSynth
}

function synth(startTime: number) {
  const synth = new Tone.Synth().toDestination()
  synth.triggerAttackRelease("C4", "1n", startTime)
  return synth
}

function getAngleRadians(aX: number, aY: number, bX: number, bY: number) {
  const dX = aX - bX
  const dY = aY - bY
  return Math.atan2(dY, dX)
}

function getBoundingBox(el: HTMLDivElement | null) {
  return (
    el?.getBoundingClientRect() ?? {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    }
  )
}
const DEBUG = true
function getBoundingBoxCenter(el: HTMLDivElement | null) {
  const box = getBoundingBox(el)
  const xCenter = (box.left + box.right) / 2
  const yCenter = (box.top + box.bottom) / 2
  return [xCenter, yCenter] as const
}

export default function Canvas({}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const instanceRef = useRef<p5>(null)
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const angleRef = useRef<number>(0)
  const prevAngleRef = useRef<number>(0)
  const rotationRef = useRef<number>(0)
  const lastSoundTimeRef = useRef<number>(0)
  const isDesktop = useMediaQuery("(min-width:1024px)")

  const prevValuesRef = useRef<number[]>([])

  useEffect(() => {
    const _synth = synth(Tone.now())
    const waveform = new Tone.Analyser("waveform", 32)
    _synth.connect(waveform)

    function updatePosition(e: MouseEvent) {
      const x = e.clientX
      const y = e.clientY
      mouseRef.current = { x, y }
      const [xCenter, yCenter] = getBoundingBoxCenter(canvasRef.current)
      const angle = getAngleRadians(x, y, xCenter, yCenter)
      angleRef.current = angle
    }
    function updatePosition2(e: MouseEvent) {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        const relativeX = e.clientX - rect.left
        const relativeY = e.clientY - rect.top

        // Convert to normalized coordinates (-1 to 1)
        const x = (relativeX / rect.width) * 2 - 1
        const y = (relativeY / rect.height) * 2 - 1

        // Scale to canvas dimensions
        mouseRef.current = {
          x: (x * MAX_WIDTH) / 2,
          y: (y * MAX_HEIGHT) / 2,
        }
        const [xCenter, yCenter] = getBoundingBoxCenter(canvasRef.current)
        const angle = getAngleRadians(e.clientX, e.clientY, xCenter, yCenter)
        angleRef.current = angle
      }
    }
    window.addEventListener("mousemove", updatePosition2)
    if (!instanceRef.current && isDesktop) {
      let grid: Grid<Point>
      // let points: number[][];
      instanceRef.current = new p5((sketch) => {
        sketch.setup = () => {
          const dpr = window.devicePixelRatio || 1
          sketch.pixelDensity(dpr)
          sketch.createCanvas(MAX_WIDTH, MAX_HEIGHT, sketch.WEBGL)
          sketch.smooth()
          // sketch.canvas.width = Math.floor(MAX_WIDTH * dpr)
          // sketch.canvas.height = Math.floor(MAX_HEIGHT * dpr)
          sketch.scale(1)
          grid = new Grid<Point>(MAX_HEIGHT, MAX_WIDTH, CELL_SIZE, sketch)
          // sketch.noLoop();
          sketch.frameRate(60)
          // points = poissonSampling(2048, MAX_WIDTH, MAX_HEIGHT).map(point => [
          //   point[0] - MAX_WIDTH/2,   // Center the points around origin
          //   point[1] - MAX_HEIGHT/2,
          //   (Math.random() - 0.5) * 0  // Small random Z variation
          // ]);
          grid.crawl((r, c) => {
            const x = (c + 0.5) * CELL_SIZE - MAX_WIDTH / 2
            const y = (r + 0.5) * CELL_SIZE - MAX_HEIGHT / 2
            const point: Point = {
              x,
              y,
              z: 0,
              size: REST_SIZE,
              velocity: 0,
              targetSize: REST_SIZE,
              lastHitTime: 0,
              isHovered: false,
            }
            grid.setCell(r, c, point)
          })
        }

        sketch.draw = () => {
          const wData = waveform.getValue()
          // console.log(wData)
          sketch.clear()
          const angle = sketch.lerp(
            prevAngleRef.current,
            angleRef.current,
            0.016 * SPEED_MODIFIER
          )
          prevAngleRef.current = angle

          sketch.background(0, 0, 0, 0)

          sketch.push()

          rotationRef.current += ROTATION_SPEED

          // Get transformed mouse position
          const mouseX = mouseRef.current.x
          const mouseY = mouseRef.current.y // Adjust for X rotation
          let startTime = Tone.now()
          let lastTime = 0
          grid.crawl((r, c) => {
            lastTime += 1
            const _point = grid.getCell(r, c)
            if (!_point) {
              return
            }
            const point = { ..._point }
            const i = Math.floor(
              sketch.noise(
                (point.x + angle) * NOISE_SCALE,
                (point.y + angle) * NOISE_SCALE
              ) * COLORS.length
            )

            // Calculate distance to mouse
            const dx = point.x - mouseX
            const dy = point.y - mouseY
            const distance = Math.sqrt(dx * dx + dy * dy)
            const currentTime = Date.now()
            const trigger = distance < HOVER_RADIUS
            const timeTrigger =
              BOUNCE_DURATION + point.lastHitTime < currentTime

            if (trigger && timeTrigger && !point.isHovered) {
              if (currentTime - lastSoundTimeRef.current >= 50) {
                // 100ms minimum delay
                const noise = hoverNoise(startTime)
                lastSoundTimeRef.current = currentTime
                setTimeout(() => {
                  noise.dispose()
                }, 1000)
              }

              point.lastHitTime = currentTime
              point.velocity = (MAX_SIZE - REST_SIZE) * 0.5
            }
            point.isHovered = trigger

            // Spring physics
            const force = (REST_SIZE - point.size) * SPRING_STRENGTH
            point.velocity += force
            point.velocity *= SPRING_DAMPING
            point.size += point.velocity
            grid.setCell(r, c, point)

            const outOfBounds =
              mouseX < -MAX_WIDTH / 2 ||
              mouseX > MAX_WIDTH / 2 ||
              mouseY < -MAX_HEIGHT / 2 ||
              mouseY > MAX_HEIGHT / 2
            // let color = COLORS[i]
            let color = COLORS[COLORS.length - 1]
            // if (!outOfBounds) {
            //   if (distance < HOVER_RADIUS) {
            //     color = COLORS[i]
            //   } else {
            //     color = COLORS[COLORS.length - 1]
            //   }
            // }
            if (wData) {
              // const currentValue = wData[c]
              const prevSample = wData[Math.max(0, c - 1)]
              const nextSample = wData[Math.min(wData.length - 1, c + 1)]
              const avgValue = (wData[c] + prevSample + nextSample) / 3

              const prevValue = prevValuesRef.current[c] ?? avgValue

              // console.log(p)
              const lerpFactor = 0.1
              const p = prevValue + (avgValue - prevValue) * lerpFactor

              prevValuesRef.current[c] = p

              const pScaled = p * (MAX_HEIGHT / 2) * 2
              if (Math.abs(point.y) < pScaled) {
                color = COLORS[0]
                // console.log("hit")
                // console.log(point.y,pScaled)
              }
            }

            sketch.stroke(...color)
            sketch.strokeWeight(point.size)
            sketch.point(point.x, point.y, 0)
          })

          sketch.pop()

          if (DEBUG) {
            // Draw mouse position as a red sphere
            sketch.push()
            sketch.translate(mouseRef.current.x, mouseRef.current.y, 0)
            sketch.fill(255, 0, 0)
            sketch.noStroke()
            sketch.sphere(5)
            sketch.pop()

            // Draw coordinate axes
            sketch.push()
            sketch.strokeWeight(1)

            // X axis (red)
            sketch.stroke(255, 0, 0)
            sketch.line(-MAX_WIDTH / 2, 0, 0, MAX_WIDTH / 2, 0, 0)

            // Y axis (green)
            sketch.stroke(0, 255, 0)
            sketch.line(0, -MAX_HEIGHT / 2, 0, 0, MAX_HEIGHT / 2, 0)

            // Draw grid
            sketch.stroke(255, 255, 255, 50)
            for (let x = -MAX_WIDTH / 2; x <= MAX_WIDTH / 2; x += CELL_SIZE) {
              sketch.line(x, -MAX_HEIGHT / 2, 0, x, MAX_HEIGHT / 2, 0)
            }
            for (let y = -MAX_HEIGHT / 2; y <= MAX_HEIGHT / 2; y += CELL_SIZE) {
              sketch.line(-MAX_WIDTH / 2, y, 0, MAX_WIDTH / 2, y, 0)
            }

            // Draw mouse coordinates
            sketch.push()
            sketch.translate(mouseRef.current.x, mouseRef.current.y, 0)
            sketch.fill(255)
            sketch.noStroke()
            sketch.textSize(12)
            // sketch.text(
            //   `x: ${Math.round(mouseRef.current.x)}\ny: ${Math.round(mouseRef.current.y)}`,
            //   10, 10
            // );
            sketch.pop()
            sketch.pop()
          }
        }
      }, canvasRef.current ?? undefined)
    } else if (!isDesktop) {
      instanceRef.current?.remove()
      instanceRef.current = null
    }
    return () => {
      window.removeEventListener("mousemove", updatePosition)
      instanceRef.current?.remove()
      instanceRef.current = null
    }
  }, [isDesktop])

  return isDesktop ? (
    <div
      ref={canvasRef}
      className="w-[496px] h-[192px] relative"
      // className="w-[496px] h-[192px] relative rounded-lg overflow-hidden shadow-inner"
    />
  ) : null
}

function poissonSampling(n: number, width: number, height: number) {
  const d = width / Math.sqrt((n * height) / width)
  const pds = new PoissonDiskSampling({
    shape: [width, height],
    minDistance: d * 0.8,
    maxDistance: d * 1.6,
    tries: 15,
  })
  return pds.fill()
}
