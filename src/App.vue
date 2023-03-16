<script setup lang="ts">
	import { useWindowSize, watchThrottled } from "@vueuse/core";
	import { onMounted, ref } from "vue";
	import { enable2DMovement } from "./utilities/mouse";

	import {
		AxesHelper,
		Color,
		PerspectiveCamera,
		Scene,
		WebGLRenderer,
	} from "three";

	import {
		calculateHorizontalOffset,
		createNotesRow,
		getObject3DSize,
	} from "./utilities/draw";

	import Decimal from "decimal.js";

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

	const firstRow = createNotesRow({
		notesNumber: 4,
		colors: [
			new Color(0x009fe3),
			new Color(0x80cff1),
			new Color(0xea5e00),
			new Color(0xf4af80),
		],
	});

	scene.add(firstRow);

	const newNoteWidth = getObject3DSize(firstRow).x / 7;
	const newRowOffset = calculateHorizontalOffset(firstRow, newNoteWidth);
	const testRow2 = createNotesRow({
		notesNumber: 7,
		rowOffset: newRowOffset,
		noteWidth: new Decimal(newNoteWidth),
		previousNoteWidth: new Decimal(1),
		verticalAxisMargin: -0.75,
		colors: [
			new Color(0x009fe3),
			new Color(0x80cff1),
			new Color(0xea5e00),
			new Color(0xf4af80),
		],
	});
	scene.add(testRow2);

	// Dev-only
	// Show the coordinate system axes
	scene.add(new AxesHelper(5));

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
