import React, { useEffect, useRef } from "react";
import p5 from "p5";
import { Grid } from "@/scripts/grid";
import PoissonDiskSampling from "poisson-disk-sampling";
import { useMediaQuery } from "../useMediaQuery";

export interface CanvasProps {
  className?: string;
}

const debug = false;
const MAX_HEIGHT = 192;
const MAX_WIDTH = 496;
const CELL_SIZE = MAX_HEIGHT / 16;
const MARGIN = 40;

const NUM_STEPS = 128;
const STEP_LENGTH = 16;
const LINE_COUNT = 2048;
const LINE_WEIGHT = 8;

const NOISE_SCALE = 0.025;
const SPEED_MODIFIER = 0.14;

const COLORS = [
  // [235, 106, 130],
  // [159, 90, 110],
  // [242, 196, 180],
  // [125, 175, 156],
  // [37, 99, 235, 0.8],
  [147, 197, 253],
  [59, 130, 246],
  [96, 165, 250],
  [219, 234, 254],
  [37, 99, 235],
  // [96, 165, 250],
  [219, 234, 254],
];

function getAngleRadians(aX: number, aY: number, bX: number, bY: number) {
  const dX = aX - bX;
  const dY = aY - bY;
  return Math.atan2(dY, dX);
}

function getBoundingBox(el: HTMLDivElement | null) {
  return (
    el?.getBoundingClientRect() ?? {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    }
  );
}

function getBoundingBoxCenter(el: HTMLDivElement | null) {
  const box = getBoundingBox(el);
  const xCenter = (box.left + box.right) / 2;
  const yCenter = (box.top + box.bottom) / 2;
  return [xCenter, yCenter] as const;
}

export default function Canvas({}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<p5>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const angleRef = useRef<number>(0);
  const prevAngleRef = useRef<number>(0);
  const isDesktop = useMediaQuery("(min-width:1024px)");

  useEffect(() => {
    function updatePosition(e: MouseEvent) {
      const x = e.clientX;
      const y = e.clientY;
      mouseRef.current = { x, y };
      const [xCenter, yCenter] = getBoundingBoxCenter(canvasRef.current);
      const angle = getAngleRadians(x, y, xCenter, yCenter);
      angleRef.current = angle;
    }
    window.addEventListener("mousemove", updatePosition);
    if (!instanceRef.current && isDesktop) {
      let grid: Grid;
      instanceRef.current = new p5((sketch) => {
        function drawCurve(
          points: { x: number; y: number }[],
          weight: number,
          color: number[]
        ) {
          sketch.noFill();
          sketch.stroke(...color);
          sketch.strokeWeight(weight);
          sketch.beginShape();
          points.map((point) => {
            sketch.curveVertex(point.x, point.y);
          });
          sketch.endShape();
        }

        function fieldCurve(
          grid: Grid,
          x: number,
          y: number,
          stepLength: number,
          numSteps: number
        ) {
          let p = sketch.createVector(x, y);
          let q = sketch.createVector(x, y);
          let n = numSteps >> 1;
          let curve = [p];
          while (--n > 0) {
            const angle = grid.getField(p.x, p.y);
            const v = sketch.createVector(1, 0).rotate(angle).mult(stepLength);
            p = p.copy().add(v);
            curve.push(p);
          }
          curve = curve.reverse();
          n = numSteps - (numSteps >> 1);
          while (--n > 0) {
            const angle = grid.getField(q.x, q.y);
            const v = sketch.createVector(-1, 0).rotate(angle).mult(stepLength);
            q = q.copy().add(v);
            curve.push(q);
          }
          return curve;
        }
        let origins: number[][];
        sketch.setup = () => {
          const dpr = window.devicePixelRatio || 1;
          sketch.pixelDensity(dpr);
          sketch.createCanvas(MAX_WIDTH, MAX_HEIGHT);
          // sketch.canvas.width = Math.floor(MAX_WIDTH * dpr)
          // sketch.canvas.height = Math.floor(MAX_HEIGHT * dpr)
          sketch.scale(1.75);
          grid = new Grid(MAX_HEIGHT, MAX_WIDTH, CELL_SIZE, sketch);
          // sketch.noLoop();
          sketch.frameRate(48);
          origins = poissonSampling(LINE_COUNT, MAX_WIDTH, MAX_HEIGHT);
        };

        sketch.draw = () => {
          sketch.clear();
          const angle = sketch.lerp(
            prevAngleRef.current,
            angleRef.current,
            0.048 * SPEED_MODIFIER
          );
          prevAngleRef.current = angle;

          grid.update(NOISE_SCALE, angle);

          if (debug) {
            grid.debug();
          }
          origins.map(([x, y]) => {
            if (y >= MAX_HEIGHT - MARGIN || y <= MARGIN) {
              return;
            }
            if (x >= MAX_WIDTH - MARGIN || x <= MARGIN) {
              return;
            }
            const line = fieldCurve(grid, x, y, STEP_LENGTH, NUM_STEPS);
            const i = Math.floor(
              sketch.noise(x * NOISE_SCALE, y * NOISE_SCALE) * COLORS.length
            );
            const color = COLORS[i];
            drawCurve(line, LINE_WEIGHT, color);
          });
        };
      }, canvasRef.current ?? undefined);
    } else if (!isDesktop) {
      instanceRef.current = null;
    }
    return () => {
      window.removeEventListener("mousemove", updatePosition);
    };
  }, [isDesktop]);

  return isDesktop ? (
    <div
      ref={canvasRef}
      className="w-full h-full relative rounded-lg overflow-hidden shadow-inner"
    />
  ) : null;
}

function poissonSampling(n: number, width: number, height: number) {
  const d = width / Math.sqrt((n * height) / width);
  const pds = new PoissonDiskSampling({
    shape: [width, height],
    minDistance: d * 0.8,
    maxDistance: d * 1.6,
    tries: 15,
  });
  return pds.fill();
}
