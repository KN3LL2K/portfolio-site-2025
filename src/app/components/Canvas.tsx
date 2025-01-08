import React, { useEffect, useRef } from "react";
import p5 from "p5";
import { Grid } from "@/scripts/grid";
import PoissonDiskSampling from "poisson-disk-sampling";

export interface CanvasProps {
  className?: string;
}

const debug = false;
const MAX_HEIGHT = 192; // 128+64
const MAX_WIDTH = 496; // 560
const CELL_SIZE = MAX_HEIGHT / 16;
// const CELL_SIZE = 128 + 64;
const MARGIN = 40;

const NUM_STEPS = 128; //32
const STEP_LENGTH = 16; //2
const LINE_COUNT = 2048; // 1024
const LINE_WEIGHT = 8;

const NOISE_SCALE = 0.025;
// const NOISE_SCALE = 0.025;
// const ANGLE_SCALE = 2;

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
  // const angle = ANGLE_SCALE;
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
    if (!instanceRef.current) {
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
          sketch.createCanvas(MAX_WIDTH, MAX_HEIGHT);
          grid = new Grid(MAX_HEIGHT, MAX_WIDTH, CELL_SIZE, sketch);
          // sketch.noLoop();
          sketch.frameRate(48);
          origins = poissonSampling(LINE_COUNT, MAX_WIDTH, MAX_HEIGHT);
        };

        sketch.draw = () => {
          sketch.clear();

          grid.update(NOISE_SCALE, angleRef.current);
          // const { x, y } = mouseRef.current;
          // grid.update(NOISE_SCALE, x, y);
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
            // const wt = Math.floor(sketch.noise(x * NOISE_SCALE, y * NOISE_SCALE));
            const color = COLORS[i];
            drawCurve(line, LINE_WEIGHT, color);
          });

          // drawLine(x, y, 0.5, 10);
          // sketch.background(0);
          // sketch.fill(255);
          // sketch.rect(x, y, 50, 50);
          // sketch.clear()
        };
      }, canvasRef.current ?? undefined);
    }
    return () => {
      // instanceRef.current = null
      window.removeEventListener("mousemove", updatePosition);
    };
  }, []);
  // useEffect(() => {
  //   if (instanceRef.current) {
  //   }
  // }, [angle]);
  return <div ref={canvasRef} className="w-full h-full relative rounded-lg overflow-hidden shadow-inner" />;
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
