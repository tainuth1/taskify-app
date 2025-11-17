import { Renderer, Program, Mesh, Color, Triangle } from "ogl";
import { useEffect, useRef, memo } from "react";

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision mediump float;

uniform float uTime;
uniform vec3 uColor;
uniform vec3 uResolution;
uniform vec2 uMouse;
uniform float uAmplitude;
uniform float uSpeed;

varying vec2 vUv;

void main() {
  float mr = min(uResolution.x, uResolution.y);
  vec2 uv = (vUv.xy * 2.0 - 1.0) * uResolution.xy / mr;

  uv += (uMouse - vec2(0.5)) * uAmplitude;

  float d = -uTime * 0.5 * uSpeed;
  float a = 0.0;
  for (float i = 0.0; i < 8.0; ++i) {
    a += cos(i - d - a * uv.x);
    d += sin(uv.y * i + a);
  }
  d += uTime * 0.5 * uSpeed;
  vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
  col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5) * uColor;
  gl_FragColor = vec4(col, 1.0);
}
`;

interface IridescenceProps {
  color?: [number, number, number];
  speed?: number;
  amplitude?: number;
  mouseReact?: boolean;
  className?: string;
  [key: string]: any;
}

function Iridescence({
  color = [1, 1, 1],
  speed = 1.0,
  amplitude = 0.1,
  mouseReact = true,
  ...rest
}: IridescenceProps) {
  const ctnDom = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0.5, y: 0.5 });
  const isMountedRef = useRef(true);
  const isVisibleRef = useRef(true);
  const rendererRef = useRef<Renderer | null>(null);
  const programRef = useRef<Program | null>(null);
  const meshRef = useRef<Mesh | null>(null);
  const initTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Intersection Observer to pause animation when not visible
  useEffect(() => {
    if (!ctnDom.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting;
        });
      },
      { threshold: 0.01 }
    );

    observer.observe(ctnDom.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Update uniforms when props change (without re-initializing)
  useEffect(() => {
    if (programRef.current) {
      programRef.current.uniforms.uColor.value = new Color(...color);
      programRef.current.uniforms.uAmplitude.value = amplitude;
      programRef.current.uniforms.uSpeed.value = speed;
    }
  }, [color, speed, amplitude]);

  // Main initialization effect
  useEffect(() => {
    if (!ctnDom.current) return;

    // Clear any pending initialization
    if (initTimeoutRef.current) {
      clearTimeout(initTimeoutRef.current);
    }

    initTimeoutRef.current = window.setTimeout(() => {
      if (!ctnDom.current || !isMountedRef.current) return;

      const ctn = ctnDom.current;
      const renderer = new Renderer();
      const gl = renderer.gl;
      gl.clearColor(1, 1, 1, 1);
      rendererRef.current = renderer;

      let program: Program;
      let resizeTimeout: number;

      // Debounced resize handler
      function resize() {
        if (!isMountedRef.current || !rendererRef.current) return;
        clearTimeout(resizeTimeout);
        resizeTimeout = window.setTimeout(() => {
          if (!isMountedRef.current || !rendererRef.current) return;
          const scale = 1;
          renderer.setSize(ctn.offsetWidth * scale, ctn.offsetHeight * scale);
          if (program) {
            program.uniforms.uResolution.value = new Color(
              gl.canvas.width,
              gl.canvas.height,
              gl.canvas.width / gl.canvas.height
            );
          }
        }, 150);
      }

      window.addEventListener("resize", resize, false);
      resize();

      const geometry = new Triangle(gl);
      program = new Program(gl, {
        vertex: vertexShader,
        fragment: fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new Color(...color) },
          uResolution: {
            value: new Color(
              gl.canvas.width,
              gl.canvas.height,
              gl.canvas.width / gl.canvas.height
            ),
          },
          uMouse: {
            value: new Float32Array([mousePos.current.x, mousePos.current.y]),
          },
          uAmplitude: { value: amplitude },
          uSpeed: { value: speed },
        },
      });
      programRef.current = program;

      const mesh = new Mesh(gl, { geometry, program });
      meshRef.current = mesh;
      let animateId: number;
      let lastFrameTime = 0;
      const targetFPS = 60;
      const frameInterval = 1000 / targetFPS;

      function update(t: number) {
        if (!isMountedRef.current || !isVisibleRef.current) {
          animateId = requestAnimationFrame(update);
          return;
        }

        const now = performance.now();
        if (now - lastFrameTime >= frameInterval) {
          if (program && isMountedRef.current) {
            program.uniforms.uTime.value = t * 0.001;
            renderer.render({ scene: mesh });
          }
          lastFrameTime = now;
        }

        animateId = requestAnimationFrame(update);
      }

      animateId = requestAnimationFrame(update);
      ctn.appendChild(gl.canvas);

      // Throttled mouse move handler
      let mouseUpdateTimeout: number;
      function handleMouseMove(e: MouseEvent) {
        if (!isMountedRef.current) return;

        clearTimeout(mouseUpdateTimeout);
        mouseUpdateTimeout = window.setTimeout(() => {
          if (!isMountedRef.current || !program) return;
          const rect = ctn.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          const y = 1.0 - (e.clientY - rect.top) / rect.height;
          mousePos.current = { x, y };
          program.uniforms.uMouse.value[0] = x;
          program.uniforms.uMouse.value[1] = y;
        }, 16); // ~60fps throttle
      }

      if (mouseReact) {
        ctn.addEventListener("mousemove", handleMouseMove, { passive: true });
      }

      return () => {
        clearTimeout(resizeTimeout);
        clearTimeout(mouseUpdateTimeout);
        cancelAnimationFrame(animateId);
        window.removeEventListener("resize", resize);
        if (mouseReact) {
          ctn.removeEventListener("mousemove", handleMouseMove);
        }
        if (ctn.contains(gl.canvas)) {
          ctn.removeChild(gl.canvas);
        }
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        rendererRef.current = null;
        programRef.current = null;
        meshRef.current = null;
      };
    }, 50); // Small delay to allow initial page render

    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = null;
      }
    };
  }, [mouseReact]); // Only re-initialize if mouseReact changes

  return <div ref={ctnDom} className="w-full h-full" {...rest} />;
}

// Memoize component to prevent unnecessary re-renders
export default memo(Iridescence, (prevProps, nextProps) => {
  // Compare color array values
  const prevColor = prevProps.color || [1, 1, 1];
  const nextColor = nextProps.color || [1, 1, 1];
  const colorEqual =
    prevColor[0] === nextColor[0] &&
    prevColor[1] === nextColor[1] &&
    prevColor[2] === nextColor[2];

  // Compare other props
  return (
    colorEqual &&
    prevProps.speed === nextProps.speed &&
    prevProps.amplitude === nextProps.amplitude &&
    prevProps.mouseReact === nextProps.mouseReact &&
    prevProps.className === nextProps.className
  );
});
