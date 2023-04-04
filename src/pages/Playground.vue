<script setup lang="ts">
	import { useWindowSize, watchThrottled } from "@vueuse/core";
	import { onMounted, ref, watch } from "vue";

	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
	import { enable2DMovement } from "../utilities/controls";
	import { drawSoundtracks, generateColorPalette } from "../utilities/draw";

	import { PerspectiveCamera, Scene, WebGLRenderer } from "three";

	import Navbar from "../components/Navbar.vue";
	import Sidebar from "../components/Sidebar.vue";

	let renderer: WebGLRenderer;
	let orbitControls: OrbitControls;
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

	const defaultDecimalAccuracy = 20;
	const decimalAccuracy = ref(defaultDecimalAccuracy);

	watch([resolutions, scaleFactor, decimalAccuracy], function () {
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
			scaleFactor.value,
			decimalAccuracy.value,
			orbitControls
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

	/**
	 * Updates the decimal accuracy
	 * @param newDecimalAccuracy
	 */
	const changeDecimalAccuracy = (newDecimalAccuracy: number) =>
		(decimalAccuracy.value = newDecimalAccuracy);

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

		orbitControls = enable2DMovement(camera, renderer);

		drawSoundtracks(
			scene,
			camera,
			resolutions.value,
			colors,
			scaleFactor.value,
			decimalAccuracy.value,
			orbitControls
		);

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
		@decimalAccuracyChange.lazy="changeDecimalAccuracy"
		:scaleFactorMax="maxScaleFactor"
		:defaultDecimalAccuracy="defaultDecimalAccuracy"
	/>
	<canvas ref="canvas" />
</template>
