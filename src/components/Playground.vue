<script setup lang="ts">
	import { useWindowSize, watchThrottled } from "@vueuse/core";
	import { onMounted, ref } from "vue";
	import { useRoute, useRouter } from "vue-router";
	import { PerspectiveCamera, Scene, WebGLRenderer } from "three";

	import Navbar from "./Navbar.vue";
	import Sidebar from "./Sidebar.vue";
	import { enable2DMovement } from "../utilities/controls";
	import { useNotesPlayground } from "../composables/useNotesPlayground";

	const props = defineProps<{
		type: "notes" | "images";
	}>();

	const router = useRouter();
	const currentRoute = useRoute();

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
	const defaultResolutions = (currentRoute.query.resolutions as string)
		?.split(",")
		.map(Number) ?? [4, 7];

	const resolutions = ref(defaultResolutions);

	const maxScaleFactor = 10e6;
	const defaultScaleFactor = parseInt(
		(currentRoute.query["scale-factor"] as string) ?? maxScaleFactor
	);
	const scaleFactor = ref(defaultScaleFactor);

	const defaultDecimalAccuracy = parseInt(
		(currentRoute.query["decimal-accuracy"] as string) ?? 20
	);
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
	 * Updates the resolution list
	 * @param newResolutions
	 */
	const changeResolutionList = (newResolutions: Array<number>) => {
		resolutions.value = newResolutions;

		// Change the resolution list in the url params
		updateUrlParams();
	};

	/**
	 * Updates the scale factor
	 * @param newScaleFactor
	 */
	const changeScaleFactor = (newScaleFactor: number) => {
		scaleFactor.value = newScaleFactor;

		// Change the scaleFactor in the url params
		updateUrlParams();
	};

	/**
	 * Updates the decimal accuracy
	 * @param newDecimalAccuracy
	 */
	const changeDecimalAccuracy = (newDecimalAccuracy: number) => {
		decimalAccuracy.value = newDecimalAccuracy;

		// Change the scaleFactor in the url params
		updateUrlParams();
	};

	/**
	 * Updates the url parameters to share playground configuration.
	 */
	function updateUrlParams() {
		// Change the scaleFactor in the url params
		router.replace({
			query: {
				resolutions: resolutions.value.join(","),
				"scale-factor": scaleFactor.value,
				"decimal-accuracy": decimalAccuracy.value,
			},
		});
	}

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
			resolutions,
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
		:defaultScaleFactor="defaultScaleFactor"
		:defaultDecimalAccuracy="defaultDecimalAccuracy"
		:defaultResolutions="resolutions"
	/>
	<canvas ref="canvas" />
</template>