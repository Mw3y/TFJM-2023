import { Color, Group, PerspectiveCamera, Scene, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { Ref, watch } from "vue";
import { centerObject, createRectangleObject } from "../utilities/draw";
import { setCameraZoomToFitObject } from "../utilities/camera";
import { Decimal } from "decimal.js";

/**
 * Returns a number whose value is limited to the given range.
 *
 * @param value The value to fit within the range
 * @param min The lower boundary of the output range
 * @param max The upper boundary of the output range
 * @returns A number in the range [min, max]
 */
const clamp = function (value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
};

export async function useImagesPlayground(
	scene: Scene,
	camera: PerspectiveCamera,
	orbitControls: OrbitControls,
	resolutions: Ref<number[]>,
	scaleFactor: Ref<number>,
	decimalAccuracy: Ref<number>
) {
	const resolution = [28, 28];

	watch(
		[resolutions, scaleFactor, decimalAccuracy],
		async function () {
			const image = await createImage("/images/mona_lisa.jpg");

			await drawPixelatedImage({
				scene: scene,
				camera: camera,
				orbitControls: orbitControls,
				xResolution: resolution[0],
				yResolution: resolution[1],
				image: image,
			});
		},
		{ immediate: true }
	);
}

/**
 * Creates a row of pixels as described in the statement of the problem.
 *
 * @param params
 * @param params.notesNumber
 * @param params.colors
 * @param params.rowOffset
 * @param params.noteWidth
 * @param params.noteHeight
 * @param params.previousNoteWidth
 * @param params.verticalAxisMargin
 *
 * @return { Group } The group object containing all of the pixels.
 */
export function createImagePixelRow({
	xResolution,
	yResolution,
	colors,
	pixelWidth,
	pixelHeight,
	previousPixelWidth,
	previousPixelHeight,
}: {
	xResolution: number;
	yResolution: number;
	colors: Array<Array<Color>>;
	pixelWidth: Decimal;
	pixelHeight: Decimal;
	previousPixelWidth: Decimal;
	previousPixelHeight: Decimal;
}) {

	// If there's too many notes, the outline is hidden.
	const disableNoteOutline = xResolution >= 100 || yResolution >= 100;

	const pixelsRow = new Group();
	const newColors = new Array<Color>();

	// Create the note mesh and outline for each note
	for (let i = 0; i < xResolution * yResolution; i++) {
		// The position of the note
		const pixelX = pixelWidth.times(i);
		const pixelY = pixelHeight.times(i);
		const position = new Vector3(pixelX.toNumber(), 0, 0);

		const halfPixelWidth = pixelWidth.dividedBy(2);
		const halfPixelHeight = pixelHeight.dividedBy(2);
		const pixelCenterX = pixelX.add(halfPixelWidth);
		const pixelCenterY = pixelY.add(halfPixelHeight);

		// Determine if the note falls between two previous notes
		const xAxisModulo = pixelCenterX.mod(previousPixelWidth);
		const yAxisModulo = pixelCenterY.mod(previousPixelHeight);

		const isXModuloNull =
			xAxisModulo.toNumber() === 0 ||
			xAxisModulo.toNumber() === previousPixelWidth.toNumber();
		const isYModuloNull =
			yAxisModulo.toNumber() === 0 ||
			yAxisModulo.toNumber() === previousPixelHeight.toNumber();

		const isModuloNull = isXModuloNull || isYModuloNull;

		// Determine the index of the note color
		const xAxisColorIndex = pixelCenterX
			.dividedToIntegerBy(previousPixelWidth)
			.toNumber();

		const yAxisColorIndex = pixelCenterY
			.dividedToIntegerBy(previousPixelHeight)
			.toNumber();

		// If the note center falls between two previous notes, it is deleted and colored white.
		// Otherwise, its color is based on the color of the previous note that it falls within.
		const noteColor = isModuloNull
			? new Color(0xffffff)
			: colors[yAxisColorIndex][xAxisColorIndex];

		// Create the note object
		const { mesh, outline } = createRectangleObject(
			position,
			noteColor,
			pixelWidth.toNumber(),
			pixelHeight.toNumber(),
			disableNoteOutline
		);

		// Add the generated note components to the row
		pixelsRow.add(mesh, outline);
		// Save the new color at its index
		newColors.push(noteColor);
	}

	return { pixelsRow, newColors };
}

/**
 * Creates a pixelated image as described in the statement of the problem.
 * @param pixelColors - Array containing the pixels of each row
 * @return The group object containing all of the pixels.
 */
function createPixelatedImageObject(
	pixelColors: Array<Color[]>,
	orthonormalFactor: number
) {
	const pixelatedImage = new Group();
	// Iterate over each row of the pixelated image
	for (let i = 0; i < pixelColors.length; i++) {
		// Iterate over each pixel of the row
		const rowPixelsGroup = new Group();
		for (let j = 0; j < pixelColors[i].length; j++) {
			const { mesh, outline } = createRectangleObject(
				new Vector3(j, i * orthonormalFactor),
				pixelColors[i][j],
				1,
				orthonormalFactor
			);
			rowPixelsGroup.add(mesh, outline);
		}
		pixelatedImage.add(rowPixelsGroup);
	}

	return pixelatedImage;
}

async function drawPixelatedImage({
	scene,
	camera,
	orbitControls,
	xResolution,
	yResolution,
	image,
}: {
	scene: Scene;
	camera: PerspectiveCamera;
	orbitControls: OrbitControls;
	xResolution: number;
	yResolution: number;
	image: HTMLImageElement;
}) {
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d", {
		willReadFrequently: true,
	});

	if (!ctx) {
		return;
	}

	const numberOfXAxisPixels = xResolution;
	const numberOfYAxisPixels = yResolution;

	const orthonormalFactor = numberOfXAxisPixels / numberOfYAxisPixels;

	// Set the canvas size to a multiple of the resolution used
	// It allows to have whole number pixel size
	// TODO: Add scalefactor
	canvas.width = xResolution * 100;
	canvas.height = yResolution * 100 * orthonormalFactor;

	const xAxisPixelSize = canvas.width / numberOfXAxisPixels;
	const yAxisPixelSize = canvas.height / numberOfYAxisPixels;

	// Make the image fit in a xResolution * yResolution canvas
	const fittedImage = await createImage(
		createFittedInCanvasImage({
			canvas,
			image,
			width: canvas.width,
			height: canvas.height,
			offsetX: 0,
			offsetY: 0,
		})
	);

	pixelateCanvasImage(
		canvas,
		ctx,
		fittedImage,
		numberOfXAxisPixels,
		numberOfYAxisPixels
	);

	const pixelColors = extractPixelatedImageColors(
		ctx,
		numberOfXAxisPixels,
		numberOfYAxisPixels,
		xAxisPixelSize,
		yAxisPixelSize
	);

	// Create the pixelated image Threejs object
	const pixelatedImage = createPixelatedImageObject(
		pixelColors,
		orthonormalFactor
	);

	// Center the camera & change the zoom level
	centerObject(pixelatedImage);
	setCameraZoomToFitObject(camera, pixelatedImage, orbitControls, 2.5);

	scene.add(pixelatedImage);
}

/**
 * By Ken Fyrstenberg Nilsen
 *
 * If image and context are the only arguments, the rectangle will equal the canvas.
 *
 * @example
 *
 * ```js
 * createFittedInCanvasImage({canvas, image, x, y, width, height, offsetX, offsetY})
 * ```
 */
function createFittedInCanvasImage({
	canvas,
	image,
	x = 0,
	y = 0,
	width = canvas.width,
	height = canvas.height,
	offsetX = 0.5,
	offsetY = 0.5,
}: {
	canvas: HTMLCanvasElement;
	image: HTMLImageElement;
	x?: number;
	y?: number;
	width?: number;
	height?: number;
	offsetX?: number;
	offsetY?: number;
}) {
	// Keep bounds [0.0, 1.0]
	offsetX = clamp(offsetX, 0, 1);
	offsetY = clamp(offsetY, 0, 1);

	var iw = image.width,
		ih = image.height,
		r = Math.min(width / iw, height / ih),
		nw = iw * r, // new prop. width
		nh = ih * r, // new prop. height
		cx,
		cy,
		cw,
		ch,
		ar = 1;

	// Decide which gap to fill
	if (nw < width) ar = width / nw;
	if (Math.abs(ar - 1) < 1e-14 && nh < height) ar = height / nh; // updated
	nw *= ar;
	nh *= ar;

	// Calculate source rectangle
	cw = iw / (nw / width);
	ch = ih / (nh / height);

	cx = (iw - cw) * offsetX;
	cy = (ih - ch) * offsetY;

	// Make sure source rectangle is valid
	if (cx < 0) cx = 0;
	if (cy < 0) cy = 0;
	if (cw > iw) cw = iw;
	if (ch > ih) ch = ih;

	// Create a canvas that will present the output image
	const outputImage = document.createElement("canvas");

	// Set it to the same size as the image
	outputImage.width = width;
	outputImage.height = height;

	// Draw the image at position 0, 0 on the canvas
	const ctx = outputImage.getContext("2d");
	ctx?.drawImage(image, cx, cy, cw, ch, x, y, width, height);

	return outputImage.toDataURL();
}

/**
 * Converts a pixelated image to an array of colors.
 * @param ctx
 * @param numberOfPixels - The number of pixels to fit on a side
 * @param pixelSize - The size of a pixel
 * @returns An array of color arrays.
 */
function extractPixelatedImageColors(
	ctx: CanvasRenderingContext2D,
	numberOfXAxisPixels: number,
	numberOfYAxisPixels: number,
	xAxisPixelSize: number,
	yAxisPixelSize: number
) {
	const pixelColors: Array<Color[]> = new Array();
	// Iterate over each row of the pixelated image
	for (let i = 1; i <= numberOfYAxisPixels; i++) {
		const rowPixelColors = [];
		// Iterate over each pixel of the row
		for (let j = 0; j < numberOfXAxisPixels; j++) {
			// Get the color data of the pixel
			const { data } = ctx.getImageData(
				// Calculate the pixel x axis coordinate
				j * xAxisPixelSize,
				// Calculate the pixel y axis coordinate
				ctx.canvas.height - i * yAxisPixelSize,
				// The size of the pixel
				xAxisPixelSize,
				yAxisPixelSize
			);

			const alpha = data[3] / 255;
			const color = new Color(`rgb(${data[0]}, ${data[1]}, ${data[2]})`);
			// The lerp() method is used to lighten the color based on its alpha value
			// It allows to manually adjust the opacity since there is not alpha support available
			// Here, 0xffffff is the background color
			rowPixelColors.push(color.lerp(new Color(0xffffff), 1 - alpha));
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
 * @param numberOfXAxisPixels - The number of pixels on the X axis of the output image.
 * @param numberOfYAxisPixels - The number of pixels on the Y axis of the output image.
 */
function pixelateCanvasImage(
	canvas: HTMLCanvasElement,
	ctx: CanvasRenderingContext2D,
	image: HTMLImageElement,
	numberOfXAxisPixels: number,
	numberOfYAxisPixels: number
) {
	// Dynamically adjust canvas size to the size of the uploaded image
	// canvas.height = image.height;
	// canvas.width = image.width;

	// Prevent the upscale of an image.
	// TODO: Upscale algorithm
	if (numberOfXAxisPixels > image.width) {
		numberOfXAxisPixels = image.width;
	}

	if (numberOfYAxisPixels > image.height) {
		numberOfYAxisPixels = image.height;
	}

	// The size represents the size of one pixel of the pixelated image
	const xSize = numberOfXAxisPixels / canvas.width,
		ySize = numberOfYAxisPixels / canvas.height,
		// Cache scaled width and height
		w = canvas.width * xSize,
		h = canvas.height * ySize;

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

	return outputImage.toDataURL();
}
