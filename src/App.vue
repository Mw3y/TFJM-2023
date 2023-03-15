<script setup lang="ts">
	import { useWindowSize, watchThrottled } from "@vueuse/core";
	import { onMounted, ref } from "vue";

	import {
		AxesHelper,
		Group,
		PerspectiveCamera,
		Scene,
		Vector3,
		WebGLRenderer,
	} from "three";

	import { createNoteObject, getObject3DSize } from "./draw";
	import { enable2DMovement } from "./mouse";

	let renderer: WebGLRenderer;
	const { width, height } = useWindowSize();
	const [scene, canvas] = [new Scene(), ref(null)];

	// Setup the scene camera
	const camera = new PerspectiveCamera(50, width.value / height.value);
	camera.position.set(0, 0, 8);
	scene.add(camera);

	/**
	 * Watch for a window resize.
	 */
	watchThrottled(
		[width, height],
		() => {
			camera.aspect = width.value / height.value;
			camera.updateProjectionMatrix();
			renderer.setSize(width.value, height.value);
		},
		{ throttle: 250 }
	);

	const group = new Group();
	for (let i = 0; i < 5; i++) {
		const position = new Vector3(i, 0, 0);
		const noteObject = createNoteObject(position);
		// Add the generated note components to the row
		group.add(...noteObject);
	}

	const groupSize = getObject3DSize(group);
	const xAxisOffset = -groupSize.x / 2 + 0.5;

	group.position.set(xAxisOffset, 0, 0);
	scene.add(group);

	// Dev-only
	// Show the coordinate system axes
	scene.add(new AxesHelper(5));

	/**
	 * Execute once the webpage has been mounted.
	 */
	onMounted(() => {
		renderer = new WebGLRenderer({
			canvas: canvas.value ?? undefined,
			alpha: true,
		});
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(width.value, height.value);

		enable2DMovement(camera, renderer);

		renderer.setAnimationLoop(() => {
			renderer.render(scene, camera);
		});
	});
</script>

<template>
	<canvas ref="canvas" />
</template>

<style>
	:root {
		color-scheme: light dark;
		color: rgba(255, 255, 255, 0.87);
		background-color: #242424;

		font-synthesis: none;
		text-rendering: optimizeLegibility;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		-webkit-text-size-adjust: 100%;
	}

	html,
	body {
		margin: 0;
	}

	canvas {
		display: block;
	}
</style>
