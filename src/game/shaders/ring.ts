// Orbital ring shader — thin emissive band with rotating hash pattern.
export const ringVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const ringFragment = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uColor;
  varying vec2 vUv;

  void main() {
    float dist = abs(vUv.y - 0.5) * 2.0;
    float band = smoothstep(1.0, 0.1, dist);

    // Rotating dashes — each ring tick travels around the band.
    float dashes = step(0.55, fract(vUv.x * 48.0 - uTime * 0.4));
    float mask = band * (0.35 + dashes * 0.65);

    vec3 color = uColor * (0.6 + uIntensity);
    gl_FragColor = vec4(color, mask * 0.85);
  }
`;
