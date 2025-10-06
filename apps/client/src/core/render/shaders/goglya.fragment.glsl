precision mediump float;

varying float vNoise;

uniform vec3 u_color;

void main() {
  vec3 goglyaColor = u_color;
  vec3 baseColor = vec3(1.0);
  vec3 color = mix(baseColor, goglyaColor, vNoise);
  gl_FragColor = vec4(color, 1.0);
}
