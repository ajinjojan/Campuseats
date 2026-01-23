import { useRef, useEffect } from "react";
import { Renderer, Program, Mesh, Triangle, Vec2 } from "ogl";

const vertex = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `
precision lowp float;

uniform vec2 uResolution;
uniform float uTime;
uniform float uHueShift;
uniform float uNoise;
uniform float uWarp;
uniform vec2 uMouse;

mat3 rgb2yiq=mat3(
  0.299,0.587,0.114,
  0.596,-0.274,-0.322,
  0.211,-0.523,0.312
);
mat3 yiq2rgb=mat3(
  1.0,0.956,0.621,
  1.0,-0.272,-0.647,
  1.0,-1.106,1.703
);

vec3 hueShiftRGB(vec3 col,float deg){
  vec3 yiq=rgb2yiq*col;
  float rad=radians(deg);
  float c=cos(rad), s=sin(rad);
  vec3 yiqShift=vec3(yiq.x, yiq.y*c-yiq.z*s, yiq.y*s+yiq.z*c);
  return clamp(yiq2rgb*yiqShift,0.0,1.0);
}

float rand(vec2 c){
  return fract(sin(dot(c,vec2(12.9898,78.233)))*43758.5453);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy * 2.0 - 1.0;
  uv.y *= -1.0;

  float d = length(uv - uMouse);
  float influence = exp(-d * 3.0) * uWarp;
  vec2 swirl = vec2(-(uv.y - uMouse.y), (uv.x - uMouse.x));
  uv += normalize(swirl) * influence * 0.15;

  uv += 0.05 * uWarp * vec2(
    sin(uv.y * 6.283 + uTime),
    cos(uv.x * 6.283 + uTime)
  );

  vec3 col = vec3(
    0.5 + 0.5 * sin(uv.x + uTime),
    0.5 + 0.5 * sin(uv.y + uTime),
    0.5 + 0.5 * sin(uTime)
  );

  col = hueShiftRGB(col, uHueShift);
  col += (rand(gl_FragCoord.xy + uTime) - 0.5) * uNoise;

  gl_FragColor = vec4(col, 1.0);
}
`;

export default function DarkVeil({
  hueShift = 0,
  noiseIntensity = 0.02,
  warpAmount = 0.8,
  speed = 0.5
}) {
  const canvasRef = useRef(null);
  const mouse = useRef(new Vec2(0, 0));

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas.parentElement;

    const renderer = new Renderer({ canvas });
    const gl = renderer.gl;

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new Vec2() },
        uHueShift: { value: hueShift },
        uNoise: { value: noiseIntensity },
        uWarp: { value: warpAmount },
        uMouse: { value: new Vec2() }
      }
    });

    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      renderer.setSize(parent.clientWidth, parent.clientHeight);
      program.uniforms.uResolution.value.set(
        parent.clientWidth,
        parent.clientHeight
      );
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = e => {
      mouse.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -((e.clientY / window.innerHeight) * 2 - 1)
      );
    };
    window.addEventListener("pointermove", onMove);

    const start = performance.now();
    let frame;

    const loop = () => {
      if (!document.hidden) {
        program.uniforms.uTime.value =
          ((performance.now() - start) / 1000) * speed;
        program.uniforms.uMouse.value.copy(mouse.current);
        renderer.render({ scene: mesh });
      }
      frame = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, [hueShift, noiseIntensity, warpAmount, speed]);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
            }
