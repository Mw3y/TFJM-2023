import {
	CanvasTexture,
	Color,
	DoubleSide,
	Group,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	Scene,
	ShapeGeometry,
	Sprite,
	SpriteMaterial,
	TextureLoader,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";

import { Ref, watch } from "vue";

export async function useImagesPlayground(
	scene: Scene,
	camera: PerspectiveCamera,
	orbitControls: OrbitControls,
	resolutions: Ref<number[]>,
	scaleFactor: Ref<number>,
	decimalAccuracy: Ref<number>,
	imageCanvas: Ref<HTMLCanvasElement>
) {
	// const svgImage = createSVGImage(
	// 	"https://threejs.org/examples/models/svg/tiger.svg"
	// );
	// scene.add(svgImage);

	const canvas = imageCanvas.value;
	const ctx = imageCanvas.value.getContext("2d");

	// Set the canvas size to a multiple of the resolution used
	// It allows to have whole number pixel size
	canvas.width = 10 * resolutions.value[0];
	canvas.height = canvas.width;

	watch(
		resolutions,
		async function () {
			if (ctx) {
				const image = await createImage("/images/mona_lisa.jpg");
				const croppedImage = await createImage(crop(image).toDataURL());

				// ctx.drawImage(croppedImage, 0, 0);

				const numberOfPixels = resolutions.value[0];
				const pixelSize = canvas.width / numberOfPixels;
				pixelate(canvas, ctx, croppedImage, numberOfPixels);

				const colors = getPixelatedImageColors(
					ctx,
					numberOfPixels,
					pixelSize
				);

				// for(const row of colors) {
				// 	for(const color of row) {
				// 		console.log(color.getHexString())
				// 	}
				// }

				const texture = new CanvasTexture(canvas);
				const material = new SpriteMaterial({
					map: texture,
					color: 0xffffff,
				});
				const sprite = new Sprite(material);

				sprite.scale.set(2.5, 2.5, 1);
				scene.add(sprite);
			}
		},
		{ immediate: true }
	);
}

/**
 * Convert a pixelated image to an array of colors.
 * @param ctx 
 * @param numberOfPixels - The number of pixels to fit on a side
 * @param pixelSize - The size of a pixel
 * @returns An array of color arrays.
 */
function getPixelatedImageColors(
	ctx: CanvasRenderingContext2D,
	numberOfPixels: number,
	pixelSize: number
) {
	const pixelColors: Array<Color[]> = [];
	for (let i = 0; i < numberOfPixels; i++) {
		const rowPixelColors = [];
		for (let j = 0; j < numberOfPixels; j++) {
			const { data } = ctx.getImageData(
				j * pixelSize,
				i * pixelSize,
				pixelSize,
				pixelSize
			);

			rowPixelColors.push(new Color(`rgb(${data[0]}, ${data[1]}, ${data[2]})`));
		}
		pixelColors.push(rowPixelColors);
	}
	return pixelColors;
}

/**
 * Helper function to create an image and wait for it to be loaded.
 * @param src - The source of the image
 * @return The loaded image
 */
async function createImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = src;
	});
}

/**
 * Pixelates an image.
 * @param canvas
 * @param ctx
 * @param image - The image to be pixelated
 * @param pixelNumber - The number of pixels on one side of the output image.
 */
function pixelate(
	canvas: HTMLCanvasElement,
	ctx: CanvasRenderingContext2D,
	image: HTMLImageElement,
	pixelNumber: number = 24
) {
	// Dynamically adjust canvas size to the size of the uploaded image
	// canvas.height = image.height;
	// canvas.width = image.width;

	// Prevent the upscale of an image.
	// TODO: Upscale algorithm
	if (pixelNumber > image.width) {
		pixelNumber = image.width;
	}

	// The size represents the size of one pixel of the pixelated image
	const size = pixelNumber / canvas.width,
		// Cache scaled width and height
		w = canvas.width * size,
		h = canvas.height * size;

	// Draw original image to the scaled size
	ctx.drawImage(image, 0, 0, w, h);

	// Then draw that scaled image thumb back to fill canvas
	// As smoothing is off the result will be pixelated

	ctx.imageSmoothingEnabled = false;
	ctx.drawImage(canvas, 0, 0, w, h, 0, 0, canvas.width, canvas.height);
}

/**
 * Crops the given image.
 * @param image - The image to be cropped
 * @param outputImageAspectRatio - The aspect ratio of the cropped image.
 */
function crop(image: HTMLImageElement, outputImageAspectRatio = 1) {
	// Image dimensions
	const inputWidth = image.naturalWidth;
	const inputHeight = image.naturalHeight;

	// Get the aspect ratio of the input image
	const inputImageAspectRatio = inputWidth / inputHeight;

	// If it's bigger than our target aspect ratio
	let outputWidth = inputWidth;
	let outputHeight = inputHeight;
	if (inputImageAspectRatio > outputImageAspectRatio) {
		outputWidth = inputHeight * outputImageAspectRatio;
	} else if (inputImageAspectRatio < outputImageAspectRatio) {
		outputHeight = inputWidth / outputImageAspectRatio;
	}

	// Create a canvas that will present the output image
	const outputImage = document.createElement("canvas");

	// Set it to the same size as the image
	outputImage.width = outputWidth;
	outputImage.height = outputHeight;

	// Draw the image at position 0, 0 on the canvas
	const ctx = outputImage.getContext("2d");
	ctx?.drawImage(image, 0, 0);

	return outputImage;
}

/**
 * Creates a group containing all the object of a given svg file.
 * @param url - The url to get the svg file from
 * @return All of the objects of the given svg file
 */
export function createSVGImage(url: string) {
	// https://threejs.org/examples/models/svg/tiger.svg
	const group = new Group();

	new SVGLoader().load(url, function (data) {
		const paths = data.paths;

		group.scale.multiplyScalar(0.25);
		group.position.x = -70;
		group.position.y = 70;
		group.scale.y *= -1;

		const drawStrokes = true;
		const drawFillShapes = true;
		const fillShapesWireframe = false;
		const strokesWireframe = false;

		for (let i = 0; i < paths.length; i++) {
			const path = paths[i];

			const fillColor = path.userData?.style.fill;
			if (
				drawFillShapes &&
				fillColor !== undefined &&
				fillColor !== "none"
			) {
				const material = new MeshBasicMaterial({
					color: new Color().setStyle(fillColor),
					opacity: path.userData?.style.fillOpacity,
					transparent: true,
					side: DoubleSide,
					depthWrite: false,
					wireframe: fillShapesWireframe,
				});

				const shapes = SVGLoader.createShapes(path);

				for (let j = 0; j < shapes.length; j++) {
					const shape = shapes[j];

					const geometry = new ShapeGeometry(shape);
					const mesh = new Mesh(geometry, material);

					group.add(mesh);
				}
			}

			const strokeColor = path.userData?.style.stroke;
			if (
				drawStrokes &&
				strokeColor !== undefined &&
				strokeColor !== "none"
			) {
				const material = new MeshBasicMaterial({
					color: new Color()
						.setStyle(strokeColor)
						.convertSRGBToLinear(),
					opacity: path.userData?.style.strokeOpacity,
					transparent: true,
					side: DoubleSide,
					depthWrite: false,
					wireframe: strokesWireframe,
				});

				for (let j = 0, jl = path.subPaths.length; j < jl; j++) {
					const subPath = path.subPaths[j];

					const geometry = SVGLoader.pointsToStroke(
						subPath.getPoints(),
						path.userData?.style
					);

					if (geometry) {
						const mesh = new Mesh(geometry, material);

						group.add(mesh);
					}
				}
			}
		}
	});
	return group;
}
