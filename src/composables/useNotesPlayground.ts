import { PerspectiveCamera, Scene } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Ref, watch } from "vue";
import { generateColorPalette, drawSoundtracks } from "../utilities/draw";

export function useNotesPlayground(
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
