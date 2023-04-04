import { PerspectiveCamera, Scene } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Ref, ref, watch } from "vue";
import { generateColorPalette, drawSoundtracks } from "../utilities/draw";

export const defaultResolutions = [4, 7];
export const resolutions = ref(defaultResolutions);

export function useNotesPlayground(
	scene: Scene,
	camera: PerspectiveCamera,
	orbitControls: OrbitControls,
    scaleFactor: Ref<number>,
    decimalAccuracy:  Ref<number>
) {
	let colors = generateColorPalette(Math.max(...resolutions.value));

	drawSoundtracks(
		scene,
		camera,
		resolutions.value,
		colors,
		scaleFactor.value,
		decimalAccuracy.value,
		orbitControls
	);

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
}

/**
 * Updates the resolution list
 * @param newResolutions
 */
export const changeResolutionList = (newResolutions: Array<number>) =>
	(resolutions.value = newResolutions);
