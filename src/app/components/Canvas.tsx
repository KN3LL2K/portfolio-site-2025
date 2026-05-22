import React, { useEffect, useRef } from "react";
import p5 from "p5";
import { Grid } from "@/scripts/grid";
import PoissonDiskSampling from "poisson-disk-sampling";
import { useMediaQuery } from "../useMediaQuery";

export interface CanvasProps {
  className?: string;
  shape?: "cube" | "torus" | "ship";
}

const debug = false;
const DEBUG_COLORS = false;
const MAX_HEIGHT = 192;
const MAX_WIDTH = 492;
const CELL_SIZE = MAX_HEIGHT / 32;
const MARGIN = 40;

const NUM_STEPS = 128;
const STEP_LENGTH = 16;
const LINE_COUNT = 2048;
const LINE_WEIGHT = 8;

const NOISE_SCALE = 0.025;
const SPEED_MODIFIER = 0.14;

const MIN_SIZE = 2;
const MAX_SIZE = CELL_SIZE * 1;

const COLORS: [number, number, number][] = [
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
  // [96, 165, 250],
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
let OFFSET = 0;
export default function Canvas({ shape }: CanvasProps) {
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
        // function drawCurve(
        //   points: { x: number; y: number }[],
        //   weight: number,
        //   color: number[]
        // ) {
        //   sketch.noFill();
        //   sketch.stroke(...color);
        //   sketch.strokeWeight(weight);
        //   sketch.beginShape();
        //   points.map((point) => {
        //     sketch.curveVertex(point.x, point.y);
        //   });
        //   sketch.endShape();
        // }

        // function fieldCurve(
        //   grid: Grid,
        //   x: number,
        //   y: number,
        //   stepLength: number,
        //   numSteps: number
        // ) {
        //   let p = sketch.createVector(x, y);
        //   let q = sketch.createVector(x, y);
        //   let n = numSteps >> 1;
        //   let curve = [p];
        //   while (--n > 0) {
        //     const angle = grid.getField(p.x, p.y);
        //     const v = sketch.createVector(1, 0).rotate(angle).mult(stepLength);
        //     p = p.copy().add(v);
        //     curve.push(p);
        //   }
        //   curve = curve.reverse();
        //   n = numSteps - (numSteps >> 1);
        //   while (--n > 0) {
        //     const angle = grid.getField(q.x, q.y);
        //     const v = sketch.createVector(-1, 0).rotate(angle).mult(stepLength);
        //     q = q.copy().add(v);
        //     curve.push(q);
        //   }
        //   return curve;
        // }
        let vert = `
        precision highp float;

        attribute vec3 aPosition;
        attribute vec2 aTexCoord;

        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;

        varying vec2 vTexCoord;

        void main() {
          // Apply the camera transform
          vec4 viewModelPosition = uModelViewMatrix * vec4(aPosition, 1.0);

          // Tell WebGL where the vertex goes
          gl_Position = uProjectionMatrix * viewModelPosition; 

          // Pass along data to the fragment shader
          vTexCoord = aTexCoord;
        }
        `;
        let frag = `
        precision highp float;

        varying vec2 vTexCoord;
        uniform vec2 u_resolution;
        uniform vec2 u_mouse;
        uniform float u_time;

        uniform sampler2D img;
        uniform sampler2D depth;

        

        float circle(in vec2 _st, in float _radius){
          vec2 l = _st-vec2(0.5);
          return 1.-smoothstep(_radius-(_radius*0.01),
                               _radius+(_radius*0.01),
                               dot(l,l)*4.0);
        }

        // 2D Random
        float random (in vec2 st) {
            return fract(sin(dot(st.xy,
                                vec2(12.9898,78.233)))
                        * 43758.5453123);
        }

        // 2D Noise based on Morgan McGuire @morgan3d
        // https://www.shadertoy.com/view/4dS3Wd
        float _noise (in vec2 st) {
            vec2 i = floor(st);
            vec2 f = fract(st);

            // Four corners in 2D of a tile
            float a = random(i);
            float b = random(i + vec2(1.0, 0.0));
            float c = random(i + vec2(0.0, 1.0));
            float d = random(i + vec2(1.0, 1.0));

            // Smooth Interpolation

            // Cubic Hermine Curve.  Same as SmoothStep()
            vec2 u = f*f*(3.0-2.0*f);
            // u = smoothstep(0.,1.,f);

            // Mix 4 coorners percentages
            return mix(a, b, u.x) +
                    (c - a)* u.y * (1.0 - u.x) +
                    (d - b) * u.x * u.y;
        }
        // Worley / cellular noise — returns F2 - F1 (0 at cell borders, grows inside cells)
        float cellular(in vec2 st, in float t) {
            vec2 i = floor(st);
            vec2 f = fract(st);
            float F1 = 8.0;
            float F2 = 8.0;
            for (int y = -1; y <= 1; y++) {
                for (int x = -1; x <= 1; x++) {
                    vec2 neighbor = vec2(float(x), float(y));
                    vec2 seed = vec2(
                        random(i + neighbor),
                        random(i + neighbor + vec2(13.7, 47.3))
                    );
                    // each cell's seed wobbles in time — this makes the water flow
                    vec2 point = neighbor + 0.5 + 0.2 * sin(t + 6.28318 * seed);
                    float d = length(f - point);
                    if      (d < F1) { F2 = F1; F1 = d; }
                    else if (d < F2) { F2 = d; }
                }
            }
            return F2 - F1;
        }
        
        void main() {
            vec2 uv = gl_FragCoord.xy/u_resolution.xy;
            vec2 gridSize = u_resolution.xy / (${CELL_SIZE * 2}.0);
            vec2 grid   = uv * gridSize;
            vec2 cellId = floor(grid);
            vec2 st     = fract(grid);

            vec2 cellCenter = (cellId + 0.5) / gridSize;
            vec2 mouseUv = u_mouse;
            mouseUv.y = 1.0 - mouseUv.y;

            // correct for non-square canvas
            float aspect = u_resolution.x / u_resolution.y;
            vec2 a = vec2(cellCenter.x * aspect, cellCenter.y);
            vec2 b = vec2(mouseUv.x  * aspect, mouseUv.y);
            // distance from this circle's center to the mouse, in screen space
            float d = distance(a, b);
            // d *= texture2D(img,vTexCoord).a;

            // float cubeInfluence = texture2D(img, vec2(cellCenter.x, 1.0 - cellCenter.y)).a;
            // float influence = max(mouseInfluence, cubeInfluence);
            // float radius = mix(0.025, 1.0, influence);
            
            float mouseInfluence = 1.0 - smoothstep(0.0, 0.1, d);
            float cubeMask = texture2D(img, vec2(cellCenter.x, 1.0 - cellCenter.y)).a;
            vec3  cubeRGB  = texture2D(img, vec2(cellCenter.x, 1.0 - cellCenter.y)).rgb;

            // vec2 flow = vec2(0.15, 0.08) * u_time;

            // optional domain warp — makes cell shapes more organic / less geometric
            vec2 warpedUv = uv + vec2(
                _noise(uv * 3.0 + u_time * 0.1),
                _noise(uv * 3.0 + 50.0 - u_time * 0.1)
            ) * 0.32;

            float cells = cellular(warpedUv * 4.0, u_time * 0.4);

            // cells ≈ 0 at borders → small dots (white seams)
            // cells grows inside → big dots (blue)
            // flow the noise field over time
            vec2 flow = vec2(u_time * 0.1, u_time * 0.05);
            float raw = _noise(uv * 6.0 + flow);

            float n;
            if      (raw > 0.4 && raw < 0.5) n = 0.0;   // thin seam (white)
            else if (raw > 0.65)              n = 0.5;   // shadow region inside cells
            else                              n = 1.0;   // bright cell interior

            float influence = max(mouseInfluence, cubeMask);
            float radius    = mix(0.025, 1.0, influence);

            // palette: dark -> light
            vec3 c0 = vec3(${COLORS[0][0] / 255}, ${COLORS[0][1] / 255}, ${COLORS[0][2] / 255});
            vec3 c1 = vec3(${COLORS[1][0] / 255}, ${COLORS[1][1] / 255}, ${COLORS[1][2] / 255});
            vec3 c2 = vec3(${COLORS[2][0] / 255}, ${COLORS[2][1] / 255}, ${COLORS[2][2] / 255});
            vec3 c3 = vec3(${COLORS[3][0] / 255}, ${COLORS[3][1] / 255}, ${COLORS[3][2] / 255});
            vec3 c4 = vec3(${COLORS[4][0] / 255}, ${COLORS[4][1] / 255}, ${COLORS[4][2] / 255});

            // brightness of this fragment of the cube (luminance)
            float litness = dot(cubeRGB, vec3(0.299, 0.587, 0.114));
            litness = smoothstep(0.1, 0.9, litness);
            float t = clamp(litness, 0.0, 1.0) * 4.0;

            vec3 cubeColor;
            if      (t < 1.0) cubeColor = mix(c0, c1, t);
            else if (t < 2.0) cubeColor = mix(c1, c2, t - 1.0);
            else if (t < 3.0) cubeColor = mix(c2, c3, t - 2.0);
            else              cubeColor = mix(c3, c4, t - 3.0);

            // dots outside the cube use the darkest blue; dots over the cube use the lit palette
            vec3 dot = mix(c0, cubeColor, cubeMask);
            
            // vec3 color = vec3(st,0.0);
            vec3 bg = vec3(1.0);
            // vec3 dot = vec3(${COLORS[0][0] / 255.0},${COLORS[0][1] / 255.0},${COLORS[0][2] / 255.0});
            dot *= texture2D(depth, vTexCoord).r;
            vec3 color = mix(bg, dot,vec3(circle(st,radius)));
            gl_FragColor = vec4(color,1.0);


        }
        `;
        let layer;
        let dotShader;
        let shipModel
        // sketch.preload = () => {
        // }
        sketch.setup = () => {
          shipModel = sketch.loadModel('/assets/models/model.obj', true)
          const dpr = window.devicePixelRatio || 1;
          sketch.pixelDensity(dpr);
          sketch.createCanvas(MAX_WIDTH, MAX_HEIGHT, sketch.WEBGL);
          // sketch.canvas.width = Math.floor(MAX_WIDTH * dpr)
          // sketch.canvas.height = Math.floor(MAX_HEIGHT * dpr)
          // sketch.scale(1.75);
          grid = new Grid(MAX_HEIGHT, MAX_WIDTH, CELL_SIZE, sketch);
          // sketch.noLoop();
          // sketch.frameRate(60);
          // origins = poissonSampling(LINE_COUNT, MAX_WIDTH, MAX_HEIGHT);
          layer = sketch.createFramebuffer();
          dotShader = sketch.createShader(vert, frag);
          grid.update({ size: 2, color: COLORS[2] });
        };

        function animateScaleWithMousePos(r: number, c: number) {
          const x = CELL_SIZE * c + CELL_SIZE / 2;
          const y = CELL_SIZE * r + CELL_SIZE / 2;
          const threshold = CELL_SIZE * 1.125;
          const circ = Math.sqrt(
            Math.abs(sketch.mouseX - x) ** 2 + Math.abs(sketch.mouseY - y) ** 2,
          );
          const cell = grid.getCell(r, c);
          if (circ <= threshold) {
            // grid.setCell(r, c, );
            // size = MAX_SIZE;
            grid.setCell(r, c, {
              size: MAX_SIZE,
              color: cell?.color ?? COLORS[4],
            });
          } else {
            // grid.setCell(r, c, sketch.lerp(cell, MIN_SIZE, 0.35));
            // size = sketch.lerp(cell, MIN_SIZE, 0.35);
            grid.setCell(r, c, {
              size: sketch.lerp(cell?.size, MIN_SIZE, 0.35),
              color: cell?.color ?? COLORS[1],
            });
          }
        }

        function drawSineWave(r: number, c: number, offset: number) {
          const mouseYMap = sketch.map(
            mouseRef.current.y,
            0,
            window.innerHeight,
            0,
            MAX_HEIGHT / CELL_SIZE - 1,
          );
          const mouseXMap = sketch.map(
            mouseRef.current.x,
            0,
            window.innerWidth,
            0.25,
            1,
          );
          // draw the wave
          const wave = sketch.map(
            sketch.sin(offset * mouseXMap),
            -1,
            1,
            MAX_HEIGHT / CELL_SIZE - 1 - mouseYMap,
            mouseYMap,
          );

          // if current cell is within half a thing of the wave form
          if (Math.abs(r - wave) <= 0.5) {
            grid.setCell(r, c, {
              size: MAX_SIZE,
              color: COLORS[3],
            });
          } else {
            grid.setCell(r, c, {
              size: grid.getCell(r, c)?.size ?? 2,
              color: COLORS[1],
            });
          }
        }

        function drawDot(r: number, c: number) {
          const x = CELL_SIZE * c + CELL_SIZE / 2 - MAX_WIDTH / 2;
          const y = CELL_SIZE * r + CELL_SIZE / 2 - MAX_HEIGHT / 2;
          const cell = grid.getCell(r, c);
          let color = cell?.color ?? COLORS[1];
          let size = cell?.size ?? MIN_SIZE;
          if (DEBUG_COLORS) {
            if (r === 0 && c < COLORS.length) {
              color = COLORS[c];
              size = MAX_SIZE;
            }
          }
          sketch.fill(sketch.color(...color));
          sketch.noStroke();
          sketch.circle(x, y, size);
        }

        function draw3DShape(shape: () => void) {
          const speed = sketch.deltaTime * 0.05;
          layer.begin();
          sketch.clear();
          sketch.push();
          sketch.ambientLight(40);
          sketch.pointLight(
            255,
            255,
            255, // color
            -(sketch.width / 2) * 0.5,
            (sketch.height / 2) * 0.5,
            -40, // direction,
            255
          );
          sketch.fill(sketch.color(COLORS[4]));
          shape();
          sketch.pop();
          layer.end();
        }
        function drawCube() {
          const speed = sketch.deltaTime * 0.05;
          draw3DShape(() => {
            sketch.rotateX(-0.4);
            sketch.rotateY(-(speed + OFFSET * 0.5));
            sketch.scale(2.0);
            sketch.box();
          });
        }
        function drawTorus() {
          const speed = sketch.deltaTime * 0.05;
          draw3DShape(() => {
            sketch.rotateX(-0.4);
            sketch.rotateY(-(speed + OFFSET * 0.5));
            // sketch.scale(2.0);
            sketch.torus();
          });
        }
        function drawShip() {
          const speed = sketch.deltaTime * 0.05;
          draw3DShape(() => {
            sketch.rotateX(2.85);
            sketch.rotateY((speed + OFFSET * 0.5));
            sketch.scale(0.65);
            sketch.model(shipModel);
          });
        }

        sketch.draw = () => {
          const speed = sketch.deltaTime * 0.05;
          // sketch.background(20);
          sketch.clear();
          if (shape === "cube") {
            drawCube();
          }
          if (shape === "torus") {
            drawTorus();
          }
          if (shape === "ship") {
            drawShip();
          }
          // SHADER START
          // sketch.image(layer, -MAX_WIDTH / 2, -MAX_HEIGHT / 2);

          sketch.push();
          sketch.shader(dotShader);
          dotShader.setUniform("u_resolution", [
            sketch.width * sketch.pixelDensity(),
            sketch.height * sketch.pixelDensity(),
          ]);
          dotShader.setUniform("u_mouse", [
            sketch.mouseX / sketch.width,
            sketch.mouseY / sketch.height,
          ]);
          dotShader.setUniform("u_time", sketch.millis() / 1000.0);
          dotShader.setUniform("img", layer.color);
          dotShader.setUniform("depth", layer.depth);
          sketch.noStroke();
          sketch.plane(MAX_WIDTH, MAX_HEIGHT);
          sketch.pop();
          // SHADER END
          // const pixels = layer.loadPixels();
          // console.log('pixels', pixels)
          // sketch.rotateX(0);
          // grid.crawl((r, c) => {
          //   const offset = c - speed + OFFSET;
          //   const x = CELL_SIZE * c + CELL_SIZE / 2; // - MAX_WIDTH / 2;
          //   const y = CELL_SIZE * r + CELL_SIZE / 2; // - MAX_HEIGHT / 2;
          //   // const pixel = layer.get(x, y);
          //   // if (!pixel.includes(0)) {
          //   //   grid.setCell(r, c, { size: MAX_SIZE, color: pixel });
          //   // }
          //   // console.log('pixel', pixel)
          //   // drawSineWave(r, c, offset);
          //   // animateScaleWithMousePos(r, c);
          //   // drawDot(r, c);
          // });
          OFFSET += 0.1;
        };
      }, canvasRef.current ?? undefined);
    } else if (!isDesktop) {
      instanceRef.current?.remove();
      instanceRef.current = null;
    }
    return () => {
      window.removeEventListener("mousemove", updatePosition);
      instanceRef.current?.remove();
      instanceRef.current = null;
    };
  }, [isDesktop, shape]);

  return isDesktop ? (
    <div
      ref={canvasRef}
      className="w-[496px] h-[192px] relative"
      // className="w-full h-full relative rounded-lg overflow-hidden shadow-inner"
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
