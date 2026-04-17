// Procedural "Industrial Cyber" core shader — tension-aware pulsing plasma.
export const coreVertex = /* glsl */ `
  uniform float uTime;
  uniform float uTension;
  varying vec3 vPos;
  varying vec3 vNormal;

  // Classic sinusoidal displacement softened by a smoothstep so we never
  // clip inside the mesh regardless of tension.
  void main() {
    vPos = position;
    vNormal = normalize(normalMatrix * normal);
    float pulse = sin(uTime * 2.4 + position.y * 1.6) * 0.03;
    float tense = smoothstep(0.0, 1.0, uTension);
    vec3 displaced = position + normal * (pulse * (0.5 + tense));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

export const coreFragment = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uTension;
  uniform float uOverclock;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying vec3 vPos;
  varying vec3 vNormal;

  float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }

  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float n000 = hash(i);
    float n100 = hash(i + vec3(1.0, 0.0, 0.0));
    float n010 = hash(i + vec3(0.0, 1.0, 0.0));
    float n110 = hash(i + vec3(1.0, 1.0, 0.0));
    float n001 = hash(i + vec3(0.0, 0.0, 1.0));
    float n101 = hash(i + vec3(1.0, 0.0, 1.0));
    float n011 = hash(i + vec3(0.0, 1.0, 1.0));
    float n111 = hash(i + vec3(1.0, 1.0, 1.0));
    float nx00 = mix(n000, n100, f.x);
    float nx10 = mix(n010, n110, f.x);
    float nx01 = mix(n001, n101, f.x);
    float nx11 = mix(n011, n111, f.x);
    float nxy0 = mix(nx00, nx10, f.y);
    float nxy1 = mix(nx01, nx11, f.y);
    return mix(nxy0, nxy1, f.z);
  }

  void main() {
    float t = uTime * 0.7;
    float n = noise(vPos * 2.0 + vec3(0.0, t, 0.0));
    n += 0.5 * noise(vPos * 4.0 - vec3(t, 0.0, 0.0));

    float rim = 1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0);
    rim = pow(rim, 2.2);

    vec3 base = mix(uColorA, uColorB, smoothstep(0.3, 0.9, n));
    vec3 color = base + rim * (uColorB * 1.2);

    // Tension shifts towards a red hot shell when waves are intense.
    float tense = smoothstep(0.0, 1.0, uTension);
    color = mix(color, color * vec3(1.5, 0.55, 0.45), tense * 0.6);

    // Overclock shockwave pulses every ~0.8s.
    float o = step(0.5, uOverclock) * (0.6 + 0.4 * sin(uTime * 7.0));
    color += o * vec3(0.3, 1.1, 1.3);

    gl_FragColor = vec4(color, 1.0);
  }
`;
