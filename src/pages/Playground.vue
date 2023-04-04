<script setup lang="ts">
	import { useWindowSize, watchThrottled } from "@vueuse/core";
	import { onMounted, ref } from "vue";
	import { PerspectiveCamera, Scene, WebGLRenderer } from "three";

	import Navbar from "../components/Navbar.vue";
	import Sidebar from "../components/Sidebar.vue";
	import { enable2DMovement } from "../utilities/controls";
	import {
		useNotesPlayground,
		changeResolutionList,
	} from "../composables/useNotesPlayground";

	let renderer: WebGLRenderer;
	const { width, height } = useWindowSize();
	const [scene, canvas] = [new Scene(), ref(null)];

	// Setup the scene camera
	const camera = new PerspectiveCamera(50, width.value / height.value);
	camera.position.set(0, 0, 8);
	scene.add(camera);

	/**
	 * App settings
	 */
	const maxScaleFactor = 10e6;
	const scaleFactor = ref(maxScaleFactor);

	const defaultDecimalAccuracy = 20;
	const decimalAccuracy = ref(defaultDecimalAccuracy);

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

	// Dev-only
	// Show the coordinate system axes
	// scene.add(new AxesHelper(5 * scaleFactor));

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

		useNotesPlayground(
			scene,
			camera,
			enable2DMovement(camera, renderer),
			scaleFactor,
			decimalAccuracy
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
