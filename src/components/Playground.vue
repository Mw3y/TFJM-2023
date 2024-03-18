<script setup lang="ts">
	import { useWindowSize, watchThrottled } from "@vueuse/core";
	import { onMounted, ref, watch } from "vue";
	import { LocationQueryRaw, useRoute, useRouter } from "vue-router";
	import { PerspectiveCamera, Scene, WebGLRenderer } from "three";

	import Navbar from "./Navbar.vue";
	import Sidebar from "./Sidebar.vue";
	import { enable2DMovement } from "../utilities/controls";
	import {
		useSoundtracksPlayground,
		defaultSoundtrackResolutions,
	} from "../composables/useSoundtracksPlayground";
	import {
		defaultImageResolutions,
		useImagesPlayground,
	} from "../composables/useImagesPlayground";

	const props = defineProps<{
		type: "soundtracks" | "images";
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

	// // The canvas for the images playground
	// const imageCanvas = ref();

	/**
	 * App settings
	 */
	const isSoundtracksPlayground = props.type === "soundtracks";
	const soundtrackResolutions = ref(
		defaultSoundtrackResolutions(currentRoute)
	);
	const imageResolutions = ref(defaultImageResolutions(currentRoute));

	const is3DEnabled = ref(
		(currentRoute.query["3d-mode"] as string) === "true" ?? false
	);

	const maxDecimalAccuracy = 1e5;
	const defaultDecimalAccuracy = parseInt(
		(currentRoute.query["decimal-accuracy"] as string) ?? 1000
	);
	const decimalAccuracy = ref(defaultDecimalAccuracy);

	const currentImage = ref<HTMLImageElement | null>(null);

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
	 * Updates the resolution list of the soundtracks.
	 * @param newResolutions
	 */
	const changeSoundtracksResolutionList = (newResolutions: Array<number>) => {
		soundtrackResolutions.value = newResolutions;
		// Change the resolution list in the url params
		updateUrlParams();
	};

	/**
	 * Updates the resolution list of the images.
	 * @param newResolutions
	 */
	const changeImagesResolutionList = (newResolutions: Array<number[]>) => {
		imageResolutions.value = newResolutions;
		// Change the resolution list in the url params
		updateUrlParams();
	};

	/**
	 * Toggles the 3d mode
	 * @param newValue
	 */
	const toggle3DMode = (newValue: boolean) => {
		is3DEnabled.value = newValue;

		// Change the "3d-mode" in the url params
		updateUrlParams();
	};

	/**
	 * Updates the decimal accuracy
	 * @param newDecimalAccuracy
	 */
	const changeDecimalAccuracy = (newDecimalAccuracy: number) => {
		decimalAccuracy.value = newDecimalAccuracy;

		// Change the decimal accuracy in the url params
		updateUrlParams();
	};

	/**
	 * Updates the image to use in the images playground.
	 * @param image
	 */
	const changeSelectedImage = (image: HTMLImageElement) => {
		currentImage.value = image;
	};

	/**
	 * Updates the url parameters to share playground configuration.
	 */
	function updateUrlParams() {
		interface QueryType {
			"3d-mode": string;
			"decimal-accuracy": number;
			soundtrackResolutions?: string;
			imageResolutions?: string;
		}

		const query: QueryType = {
			"3d-mode": is3DEnabled.value.toString(),
			"decimal-accuracy": decimalAccuracy.value,
		};

		if (isSoundtracksPlayground) {
			query.soundtrackResolutions = soundtrackResolutions.value.join(",");
		} else {
			query.imageResolutions = imageResolutions.value.join(",");
		}

		router.replace({
			query: query as unknown as LocationQueryRaw,
		});
	}

	/**
	 * Executes once the webpage has been mounted.
	 */
	onMounted(() => {
		renderer = new WebGLRenderer({
			canvas: canvas.value ?? undefined,
			alpha: true,
			antialias: true,
		});
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(width.value, height.value);

		const orbitControls = enable2DMovement(
			camera,
			renderer,
			is3DEnabled.value
		);

		if (isSoundtracksPlayground)
			useSoundtracksPlayground(
				scene,
				camera,
				orbitControls,
				soundtrackResolutions,
				is3DEnabled,
				decimalAccuracy
			);
		else {
			useImagesPlayground(
				scene,
				camera,
				orbitControls,
				imageResolutions,
				is3DEnabled,
				decimalAccuracy,
				currentImage
			);
		}

		renderer.setAnimationLoop(() => {
			renderer.render(scene, camera);
		});
	});
</script>

<template>
	<Navbar />
	<Sidebar
		@soundtrackResolutionsChange="changeSoundtracksResolutionList"
		@imageResolutionsChange="changeImagesResolutionList"
		@toggle3DMode.lazy="toggle3DMode"
		@decimalAccuracyChange.lazy="changeDecimalAccuracy"
		@onImageUpload="changeSelectedImage"
		:is3DEnabled="is3DEnabled"
		:decimalAccuracyMax="maxDecimalAccuracy"
		:defaultDecimalAccuracy="defaultDecimalAccuracy"
		:defaultSoundtrackResolutions="soundtrackResolutions"
		:defaultImageResolutions="imageResolutions"
		:playground="props.type"
	/>
	<!-- Used to debug the image pixelation -->
	<!-- <canvas
		hidden
		ref="imageCanvas"
		class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pixelated"
	/> -->
	<canvas ref="canvas" />
</template>
