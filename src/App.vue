<script setup lang="ts">
	import { useWindowSize, watchThrottled } from "@vueuse/core";
	import { onMounted, ref, watch } from "vue";

	import { enable2DMovement } from "./utilities/mouse";
	import {
		centerObject,
		clearScene,
		createSoundtracks,
		drawSoundtracks,
	} from "./utilities/draw";
	import { setCameraZoomToFitObject } from "./utilities/controls";

	import {
		Color,
		Group,
		PerspectiveCamera,
		Scene,
		Vector3,
		WebGLRenderer,
	} from "three";

	import Navbar from "./components/Navbar.vue";
	import Sidebar from "./components/Sidebar.vue";

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
		new Color(0x3d405b),
		new Color(0x5f6178)
	];

	const maxScaleFactor = 10e6;
	const scaleFactor = ref(maxScaleFactor);
	
	const resolutions = ref([4, 7]);
	drawSoundtracks(scene, camera, resolutions.value, colors);

	watch([resolutions, scaleFactor], function () {
		drawSoundtracks(scene, camera, resolutions.value, colors, scaleFactor.value);
	});

	/**
	 * Updates the resolution list
	 * @param newResolutions
	 */
	const changeResolutionList = (newResolutions: Array<number>) =>
		(resolutions.value = newResolutions);

	/**
	 * Updates the scale factor
	 * @param newScaleFactor
	 */
	const changeScaleFactor = (newScaleFactor: number) =>
		(scaleFactor.value = newScaleFactor);

	// Dev-only
	// Show the coordinate system axes
	// scene.add(new AxesHelper(5 * scaleFactor));

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
	<Navbar />
	<Sidebar
		@resolutionChange="changeResolutionList"
		@scaleFactorChange.lazy="changeScaleFactor"
		:scaleFactorMax="maxScaleFactor"
	/>
	<canvas ref="canvas" />
</template>

<style>
	:root {
		/* color-scheme: light dark; */
		color-scheme: light;
		color: rgba(255, 255, 255, 0.87);
		/* background-color: rgb(250, 249, 246); */
		background-color: #ebebeb;
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
