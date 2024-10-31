import * as React from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, AdditiveBlending, ShaderMaterial, Vector3, Spherical } from 'three';
import { version } from '@react-three/drei/helpers/constants.js';
import * as THREE from 'three';

class StarfieldMaterial extends ShaderMaterial {
    constructor(radius: number) {
        super({
            uniforms: {
                time: {
                    value: 0.0
                },
                fade: {
                    value: 1.0
                },
                radius: { value: radius },
            },
            vertexShader: /* glsl */`
  uniform float time;
  uniform float radius; // Add uniform for the radius
  attribute float size;
  varying vec3 vColor;

  void main() {
    vColor = color;

    // Update x position with wrapping
    float newX = position.x - time*4.0; 

    // Wrap around logic
    if (newX > radius) {
      newX -= 2.0 * radius; // Move to the opposite side
    } else if (newX < -radius) {
      newX += 2.0 * radius; // Move to the opposite side
    }

    vec4 mvPosition = modelViewMatrix * vec4(newX, position.y, position.z, 1.0);
    gl_PointSize = size * (30.0 / -mvPosition.z) * (3.0 + sin(time + 100.0));
    gl_Position = projectionMatrix * mvPosition;
  }`,
            fragmentShader: /* glsl */`
      uniform sampler2D pointTexture;
      uniform float fade;
      varying vec3 vColor;
      void main() {
        float opacity = 1.0;
        if (fade == 1.0) {
          float d = distance(gl_PointCoord, vec2(0.5, 0.5));
          opacity = 1.0 / (1.0 + exp(16.0 * (d - 0.25)));
        }
        gl_FragColor = vec4(vColor, opacity);

        #include <tonemapping_fragment>
	      #include <${version >= 154 ? 'colorspace_fragment' : 'encodings_fragment'}>
      }`
        });
    }
}
const genStar = (r: number) => {
    return new Vector3().setFromSpherical(new Spherical(r, Math.acos(1 - Math.random() * 2), Math.random() * 2 * Math.PI));
};
const StarField = /* @__PURE__ */React.forwardRef<THREE.Points, any>(({
    radius = 100,
    depth = 50,
    count = 5000,
    saturation = 0,
    factor = 4,
    fade = false,
    speed = 1
}, ref) => {
    const material = React.useRef<ShaderMaterial>();
    const [position, color, size] = React.useMemo(() => {
        const positions = [];
        const colors = [];
        const sizes = Array.from({
            length: count
        }, () => (0.5 + 0.5 * Math.random()) * factor);
        const color = new Color();
        let r = radius + depth;
        const increment = depth / count;
        for (let i = 0; i < count; i++) {
            r -= increment * Math.random();
            positions.push(...genStar(r).toArray());
            color.setHSL(i / count, saturation, 0.9);
            colors.push(color.r, color.g, color.b);
        }
        return [new Float32Array(positions), new Float32Array(colors), new Float32Array(sizes)];
    }, [count, depth, factor, radius, saturation]);
    useFrame(state => {
        if (material.current) {
            material.current.uniforms.time.value = state.clock.getElapsedTime() * speed;
        }
    });
    const [starfieldMaterial] = React.useState(() => new StarfieldMaterial(radius));
    return /*#__PURE__*/React.createElement("points", {
        ref: ref
    }, /*#__PURE__*/React.createElement("bufferGeometry", null, /*#__PURE__*/React.createElement("bufferAttribute", {
        attach: "attributes-position",
        args: [position, 3]
    }), /*#__PURE__*/React.createElement("bufferAttribute", {
        attach: "attributes-color",
        args: [color, 3]
    }), /*#__PURE__*/React.createElement("bufferAttribute", {
        attach: "attributes-size",
        args: [size, 1]
    })), /*#__PURE__*/React.createElement("primitive", {
        ref: material,
        object: starfieldMaterial,
        attach: "material",
        blending: AdditiveBlending,
        "uniforms-fade-value": fade,
        depthWrite: false,
        transparent: true,
        vertexColors: true
    }));
});

export { StarField };