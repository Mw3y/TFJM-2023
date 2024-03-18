import { PerspectiveCamera, Scene } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Ref, watch } from "vue";
import { drawSoundtracks } from "../utilities/draw";
import { generateColorPalette } from "../utilities/colors";
import { RouteLocationNormalizedLoaded } from "vue-router";

export const defaultSoundtrackResolutions = (
	currentRoute: RouteLocationNormalizedLoaded
) => {
	return (
		(currentRoute.query.soundtrackResolutions as string)
			?.split(",")
			.map(Number) ?? [4, 7]
	);
};

export function useSoundtracksPlayground(
	scene: Scene,
	camera: PerspectiveCamera,
	orbitControls: OrbitControls,
	resolutions: Ref<number[]>,
	is3DEnabled: Ref<boolean>,
	decimalAccuracy: Ref<number>
) {
	let colors = generateColorPalette(Math.max(...resolutions.value));
	const defaultResolutions = resolutions.value;

	watch(
		[resolutions, is3DEnabled, decimalAccuracy],
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
				is3DEnabled.value,
				decimalAccuracy.value,
				orbitControls
			);
		},
		{ immediate: true }
	);
}
