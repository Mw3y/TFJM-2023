<script setup lang="ts">
	import { useWindowSize, watchThrottled } from "@vueuse/core";
	import { onMounted, ref } from "vue";
	import { enable2DMovement } from "./utilities/mouse";
	import { setCameraZoomToFitObject } from "./utilities/camera";

	import {
		AxesHelper,
		Color,
		Group,
		PerspectiveCamera,
		Scene,
		Vector3,
		WebGLRenderer,
	} from "three";

	import { centerObject, createSoundtracks } from "./utilities/draw";

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

	let colors = [
		new Color(0x009fe3),
		new Color(0x80cff1),
		new Color(0xea5e00),
		new Color(0xf4af80),
	];

	const resolutions = [4, 7];
	const notesRows = createSoundtracks(resolutions, colors);

	const scaleFactor = 10e6;
	const allNotesRows = new Group().add(...notesRows);
	// Scale everything up for easier visibility
	allNotesRows.scale.copy(new Vector3(scaleFactor, scaleFactor, scaleFactor));
	// Center the camera & change the zoom level
	centerObject(allNotesRows);
	setCameraZoomToFitObject(camera, allNotesRows, 2.5, scaleFactor);

	// Render the notes rows
	scene.add(allNotesRows);

	// Dev-only
	// Show the coordinate system axes
	scene.add(new AxesHelper(5 * scaleFactor));

	/**
	 * Executes once the webpage has been mounted.
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
			console.log(camera.position);
			renderer.render(scene, camera);
		});
	});
</script>

<template>
	<canvas ref="canvas" />
</template>

<style>
	:root {
		/* color-scheme: light dark; */
		color-scheme: light;
		color: rgba(255, 255, 255, 0.87);
		background-color: rgb(250, 249, 246);
		/* background-color: #242424; */

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
