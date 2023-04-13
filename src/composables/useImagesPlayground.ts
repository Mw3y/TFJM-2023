import { PerspectiveCamera, Scene } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { Ref, isProxy, toRaw, watch } from "vue";
import { createImage, drawPixelatedImages } from "../utilities/draw";
import { RouteLocationNormalizedLoaded } from "vue-router";

export const defaultImageResolutions = (
	currentRoute: RouteLocationNormalizedLoaded
): number[][] => {
	const resolutionsQuery = currentRoute.query.imageResolutions?.toString();

	if (resolutionsQuery) {
		let rawResolutions = resolutionsQuery.split(",").map(Number);

		if (rawResolutions.length % 2 === 1) {
			rawResolutions.pop();
		}

		// Group all of the resolutions by two
		const resolutions = [];
		while (rawResolutions.length >= 2) {
			resolutions.unshift(rawResolutions.splice(-2, 2));
		}
		resolutions.unshift(rawResolutions);

		return resolutions.filter(
			(resolutionArray) => resolutionArray.length !== 0
		);
	}

	return [[28, 28]];
};

export async function useImagesPlayground(
	scene: Scene,
	camera: PerspectiveCamera,
	orbitControls: OrbitControls,
	resolutions: Ref<number[][]>,
	scaleFactor: Ref<number>,
	decimalAccuracy: Ref<number>,
	currentImage: Ref<HTMLImageElement | null>
) {
	watch(
		[resolutions, scaleFactor, decimalAccuracy, currentImage],
		async function () {
			const image = currentImage.value ?? await createImage("/images/mona_lisa.jpg");

			console.log(image)

			let newResolutions = new Array<number[]>();
			// Extract the resolutions from the proxy
			if (isProxy(resolutions.value)) {
				newResolutions = toRaw(resolutions.value);
			}

			await drawPixelatedImages(
				scene,
				camera,
				orbitControls,
				newResolutions,
				image,
				scaleFactor.value,
				decimalAccuracy.value
			);
		},
		{ immediate: true, deep: true }
	);
}
