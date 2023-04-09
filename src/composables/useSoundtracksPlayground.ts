import { PerspectiveCamera, Scene } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Ref, watch } from "vue";
import { drawSoundtracks } from "../utilities/draw";
import { generateColorPalette } from "../utilities/colors";
import { RouteLocationNormalizedLoaded } from "vue-router";

export const defaultSoundtrackResolutions = (
	currentRoute: RouteLocationNormalizedLoaded
) => {
	// (currentRoute.query.resolutions as string)?.split(",").map(Number) ??
	return [4, 7];
};

export function useSoundtracksPlayground(
	scene: Scene,
	camera: PerspectiveCamera,
	orbitControls: OrbitControls,
	resolutions: Ref<number[]>,
	scaleFactor: Ref<number>,
	decimalAccuracy: Ref<number>
) {
	let colors = generateColorPalette(Math.max(...resolutions.value));
	const defaultResolutions = resolutions.value;

	watch(
		[resolutions, scaleFactor, decimalAccuracy],
		function () {
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
		},
		{ immediate: true }
	);
}
