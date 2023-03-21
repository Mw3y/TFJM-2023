<script setup lang="ts">
	import { useWindowSize, watchThrottled } from "@vueuse/core";
	import { onMounted, ref, watch } from "vue";

	import { enable2DMovement } from "../utilities/mouse";
	import { drawSoundtracks, generateColorPalette } from "../utilities/draw";

	import { PerspectiveCamera, Scene, WebGLRenderer } from "three";

	import Navbar from "../components/Navbar.vue";
	import Sidebar from "../components/Sidebar.vue";

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

	const defaultResolutions = [4, 7];
	const resolutions = ref(defaultResolutions);

	let colors = generateColorPalette(Math.max(...resolutions.value));

	const maxScaleFactor = 10e6;
	const scaleFactor = ref(maxScaleFactor);

	drawSoundtracks(scene, camera, resolutions.value, colors);

	watch([resolutions, scaleFactor], function () {

		// Reset the resolution on bad input
		if (resolutions.value.length < 1) {
			resolutions.value = defaultResolutions;
		}

		colors = generateColorPalette(Math.max(...resolutions.value));

		drawSoundtracks(
			scene,
			camera,
			resolutions.value,
			colors,
			scaleFactor.value
		);
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
			antialias: false,
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
