"use client";
import Delaunator from "delaunator";
import { useEffect, useRef } from "react";
import {
	BufferGeometry,
	ColorManagement,
	DoubleSide,
	Float32BufferAttribute,
	LinearSRGBColorSpace,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	Scene,
	SphereGeometry,
	Vector2,
	Vector3,
	WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

ColorManagement.enabled = false;

const L_MAX = 1;
const C_MAX = 0.4;

const M2_00 = 0.2104542553;
const M2_01 = 0.793617785;
const M2_02 = -0.0040720468;
const M2_10 = 1.9779984951;
const M2_11 = -2.428592205;
const M2_12 = 0.4505937099;
const M2_20 = 0.0259040371;
const M2_21 = 0.7827717662;
const M2_22 = -0.808675766;

const S2X_00 = 0.4123907992659595;
const S2X_01 = 0.357584339383878;
const S2X_02 = 0.1804807884018343;
const S2X_10 = 0.21263900587151027;
const S2X_11 = 0.715168678767756;
const S2X_12 = 0.07219231536073371;
const S2X_20 = 0.01933081871559182;
const S2X_21 = 0.11919477979462598;
const S2X_22 = 0.9505321522496607;

const X2L_00 = 0.8189330101;
const X2L_01 = 0.3618667424;
const X2L_02 = -0.1288597137;
const X2L_10 = 0.0329845436;
const X2L_11 = 0.9293118715;
const X2L_12 = 0.0361456387;
const X2L_20 = 0.0482003018;
const X2L_21 = 0.2643662691;
const X2L_22 = 0.633851707;

const P2X_00 = 0.4865709486482162;
const P2X_01 = 0.26566769316909306;
const P2X_02 = 0.1982172852343625;
const P2X_10 = 0.2289745640697488;
const P2X_11 = 0.6917385218365064;
const P2X_12 = 0.079286914093745;
const P2X_20 = 0.0;
const P2X_21 = 0.04511338185890264;
const P2X_22 = 1.043944368900976;

const RAD_TO_DEG = 180 / Math.PI;

function onGamutEdge(r: number, g: number, b: number): boolean {
	return r === 0 || g === 0 || b === 0 || r > 0.99 || g > 0.99 || b > 0.99;
}

function linearRgbToOklch(
	lr: number,
	lg: number,
	lb: number,
): { l: number; c: number; h: number } | null {
	const x = S2X_00 * lr + S2X_01 * lg + S2X_02 * lb;
	const y = S2X_10 * lr + S2X_11 * lg + S2X_12 * lb;
	const z = S2X_20 * lr + S2X_21 * lg + S2X_22 * lb;

	const lms_l = X2L_00 * x + X2L_01 * y + X2L_02 * z;
	const lms_m = X2L_10 * x + X2L_11 * y + X2L_12 * z;
	const lms_s = X2L_20 * x + X2L_21 * y + X2L_22 * z;

	const lPrime = Math.cbrt(lms_l);
	const mPrime = Math.cbrt(lms_m);
	const sPrime = Math.cbrt(lms_s);

	const L = M2_00 * lPrime + M2_01 * mPrime + M2_02 * sPrime;
	const a = M2_10 * lPrime + M2_11 * mPrime + M2_12 * sPrime;
	const b = M2_20 * lPrime + M2_21 * mPrime + M2_22 * sPrime;

	const c = Math.sqrt(a * a + b * b);
	if (c < 0.0001) return null;

	let h = Math.atan2(b, a) * RAD_TO_DEG;
	if (h < 0) h += 360;

	return { l: L, c, h };
}

function linearP3ToOklch(
	pr: number,
	pg: number,
	pb: number,
): { l: number; c: number; h: number } | null {
	const x = P2X_00 * pr + P2X_01 * pg + P2X_02 * pb;
	const y = P2X_10 * pr + P2X_11 * pg + P2X_12 * pb;
	const z = P2X_20 * pr + P2X_21 * pg + P2X_22 * pb;

	const lms_l = X2L_00 * x + X2L_01 * y + X2L_02 * z;
	const lms_m = X2L_10 * x + X2L_11 * y + X2L_12 * z;
	const lms_s = X2L_20 * x + X2L_21 * y + X2L_22 * z;

	const lPrime = Math.cbrt(lms_l);
	const mPrime = Math.cbrt(lms_m);
	const sPrime = Math.cbrt(lms_s);

	const L = M2_00 * lPrime + M2_01 * mPrime + M2_02 * sPrime;
	const a = M2_10 * lPrime + M2_11 * mPrime + M2_12 * sPrime;
	const b = M2_20 * lPrime + M2_21 * mPrime + M2_22 * sPrime;

	const c = Math.sqrt(a * a + b * b);
	if (c < 0.0001) return null;

	let h = Math.atan2(b, a) * RAD_TO_DEG;
	if (h < 0) h += 360;

	return { l: L, c, h };
}

function getModelData(gamut: "srgb" | "p3"): [Vector3[], number[]] {
	const coordinates: Vector3[] = [];
	const colors: number[] = [];
	const toOklch = gamut === "p3" ? linearP3ToOklch : linearRgbToOklch;

	for (let r = 0; r <= 1; r += 0.01) {
		for (let g = 0; g <= 1; g += 0.01) {
			for (let b = 0; b <= 1; b += 0.01) {
				if (onGamutEdge(r, g, b)) {
					const oklch = toOklch(r, g, b);
					if (oklch?.h) {
						colors.push(r, g, b);
						coordinates.push(new Vector3(oklch.l / L_MAX, oklch.c / (C_MAX * 2), oklch.h / 360));
					}
				}
			}
		}
	}

	const bounds = [
		new Vector3(0, 0, 0),
		new Vector3(0, 0, 1),
		new Vector3(1, 0, 0),
		new Vector3(1, 0, 1),
	];
	for (const bound of bounds) {
		coordinates.push(bound);
		colors.push(0.5, 0.5, 0.5);
	}

	return [coordinates, colors];
}

function generateMesh(
	gamut: "srgb" | "p3",
	sliceL: Vector2,
	sliceC: Vector2,
	sliceH: Vector2,
): Mesh {
	const [coordinates, colors] = getModelData(gamut);

	const geometry = new BufferGeometry().setFromPoints(coordinates);
	geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
	geometry.center();

	const triangles = Delaunator.from(coordinates.map((coord) => [coord.x, coord.z])).triangles;
	geometry.setIndex(Array.from(triangles));
	geometry.computeVertexNormals();

	const material = new MeshBasicMaterial({
		side: DoubleSide,
		vertexColors: true,
	});

	material.onBeforeCompile = (shader) => {
		shader.uniforms.sliceL = { value: sliceL };
		shader.uniforms.sliceC = { value: sliceC };
		shader.uniforms.sliceH = { value: sliceH };

		shader.vertexShader = `
			varying vec3 vPos;
			${shader.vertexShader}
		`.replace(
			"#include <begin_vertex>",
			`#include <begin_vertex>
			vPos = transformed;`,
		);

		shader.fragmentShader = `
			#define ss(a, b, c) smoothstep(a, b, c)
			uniform vec2 sliceL, sliceC, sliceH;
			varying vec3 vPos;
			${shader.fragmentShader}
		`.replace(
			"#include <dithering_fragment>",
			`#include <dithering_fragment>
			vec3 col = vec3(0.5, 0.5, 0.5);
			float width = 0.0025;
			float l = ss(width, 0., abs(vPos.x + sliceL.y));
			float c = ss(width, 0., abs(vPos.y + sliceC.y));
			float h = ss(width, 0., abs(vPos.z - sliceH.y));
			gl_FragColor.rgb = mix(gl_FragColor.rgb, col, l);
			gl_FragColor.rgb = mix(gl_FragColor.rgb, col, c);
			gl_FragColor.rgb = mix(gl_FragColor.rgb, col, h);`,
		);
	};

	return new Mesh(geometry, material);
}

function generateMarker(l: number, c: number, h: number): Mesh {
	const geometry = new SphereGeometry(0.02, 16, 16);
	const material = new MeshBasicMaterial({ color: 0xffffff });
	const mesh = new Mesh(geometry, material);
	mesh.position.set(l / L_MAX - 0.5, c / (C_MAX * 2) - 0.5, h / 360 - 0.5);
	return mesh;
}

export interface OklchSpace3DProps {
	l: number;
	c: number;
	h: number;
	gamut: "srgb" | "p3";
}

export default function OklchSpace3D({ l, c, h, gamut }: OklchSpace3DProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const sceneRef = useRef<{
		scene: Scene;
		camera: PerspectiveCamera;
		renderer: WebGLRenderer;
		controls: OrbitControls;
		mesh: Mesh;
		marker: Mesh;
		sliceL: Vector2;
		sliceC: Vector2;
		sliceH: Vector2;
		animationId: number;
		started: boolean;
	} | null>(null);

	useEffect(() => {
		const container = containerRef.current;
		const canvas = canvasRef.current;
		if (!container || !canvas) return;

		const width = container.clientWidth;
		const height = container.clientHeight;

		const scene = new Scene();
		const camera = new PerspectiveCamera(75, width / height, 0.1, 1000);
		const renderer = new WebGLRenderer({ alpha: true, canvas, antialias: true });

		renderer.outputColorSpace = LinearSRGBColorSpace;
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(width, height);

		camera.position.set(0.79, 0, 0.79);
		camera.lookAt(new Vector3(0, 0, 0));

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enablePan = false;
		controls.enableDamping = true;
		controls.dampingFactor = 0.05;
		controls.minDistance = 0.5;
		controls.maxDistance = 3;

		const sliceL = new Vector2(0, -(l / L_MAX - 0.5));
		const sliceC = new Vector2(0, -(c / (C_MAX * 2) - 0.5));
		const sliceH = new Vector2(0, h / 360 - 0.5);

		const mesh = generateMesh(gamut, sliceL, sliceC, sliceH);
		scene.add(mesh);

		const marker = generateMarker(l, c, h);
		scene.add(marker);

		sceneRef.current = {
			scene,
			camera,
			renderer,
			controls,
			mesh,
			marker,
			sliceL,
			sliceC,
			sliceH,
			animationId: 0,
			started: true,
		};

		function animate() {
			if (!sceneRef.current?.started) return;
			sceneRef.current.animationId = requestAnimationFrame(animate);
			controls.update();
			renderer.render(scene, camera);
		}
		animate();

		const handleResize = () => {
			if (!container || !sceneRef.current) return;
			const w = container.clientWidth;
			const h = container.clientHeight;
			camera.aspect = w / h;
			camera.updateProjectionMatrix();
			renderer.setSize(w, h);
		};
		window.addEventListener("resize", handleResize);

		return () => {
			if (sceneRef.current) {
				sceneRef.current.started = false;
				cancelAnimationFrame(sceneRef.current.animationId);
			}
			window.removeEventListener("resize", handleResize);
			renderer.dispose();
			controls.dispose();
		};
	}, [gamut, l, c, h]);

	useEffect(() => {
		if (!sceneRef.current) return;

		const { sliceL, sliceC, sliceH, marker } = sceneRef.current;

		sliceL.y = -(l / L_MAX - 0.5);
		sliceC.y = -(c / (C_MAX * 2) - 0.5);
		sliceH.y = h / 360 - 0.5;

		marker.position.set(l / L_MAX - 0.5, c / (C_MAX * 2) - 0.5, h / 360 - 0.5);
	}, [l, c, h]);

	return (
		<div
			ref={containerRef}
			className="relative w-full h-full"
			style={{
				background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
			}}
		>
			<canvas ref={canvasRef} className="w-full h-full" />
		</div>
	);
}
