import {
	Mesh,
	PlaneGeometry,
	MeshBasicMaterial,
	Color,
	EdgesGeometry,
	LineBasicMaterial,
	LineSegments,
	Vector3,
	Event,
	Object3D,
	Box3,
	Group,
	LineDashedMaterial,
	BufferGeometry,
	Scene,
	PerspectiveCamera,
} from "three";

import { Decimal } from "decimal.js";
import { setCameraZoomToFitObject } from "./camera";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const importantConsoleInfoStyle =
	"font-size: 24px; font-weight: bold; padding: 24px 0";

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

/**
 * Calculates the size of a 3D object.
 * @param object - The object to get the size of
 * @return { Vector3 } A triplet of numbers containing the size of the object on each axis.
 */
export function getObject3DSize(object: Object3D<Event>): Vector3 {
	return new Box3().setFromObject(object, true).getSize(new Vector3());
}

/**
 * Centers a 3D object on the x-axis.
 * @param object - The object to center.
 * @return { Box3 } The centered bounding box.
 */
export function centerObject(object: Object3D<Event>) {
	return new Box3()
		.setFromObject(object)
		.getCenter(object.position)
		.multiplyScalar(-1);
}

/**
 * Removes all objects from the scene.
 * @param scene
 */
export const clearScene = (scene: Scene) =>
	scene.remove.apply(scene, scene.children);

/**
 * Helper function to create an image and wait for it to be loaded.
 * @param src - The source of the image
 * @return The loaded image
 */
export async function createImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = src;
	});
}

/**
 * Draws the outline of an object.
 * @param geometry - The object geometry
 * @param color - The color of the outline
 */
export function createObjectOutline(geometry: PlaneGeometry, color: Color) {
	const lineGeometry = new EdgesGeometry(geometry);
	const material = new LineBasicMaterial({ color });
	return new LineSegments(lineGeometry, material);
}

/**
 * Creates a new rectangle mesh and its outline.
 * The rectangle is centered at the given position.
 *
 * @example
 * const noteObject = createRectangleObject(new Vector3(0, 0, 0))
 *
 * @param position - The position of the center of the note
 * @param width - The width of the note
 * @param height - The height of the note
 * @return { Array } An array with the note mesh and the outline.
 */
export function createRectangleObject(
	position: Vector3,
	color: Color = new Color(Math.random() * 0xffffff),
	width: number = 1,
	height: number = 1,
	disableOutline: boolean = false
) {
	// Create the mesh of the rectangle
	const mesh = new Mesh(
		new PlaneGeometry(width, height, 1, 1),
		new MeshBasicMaterial({
			color,
		})
	);

	// Create the outline of the rectangle
	const outline = createObjectOutline(
		mesh.geometry,
		// If disableOutline is set to true, the outline is not visible
		// since it is set to the same color as the plane geometry.
		disableOutline ? color : new Color(0x000000)
	);

	// Set the quadrilateral & outline position
	mesh.position.copy(position);
	outline.position.copy(position);

	return { mesh, outline };
}

/**
 * Creates a row of notes as described in the statement of the problem.
 *
 * @example
 * const noteRow = createIndividualSoundtrack({ notesNumber: 4})
 *
 * @param notesNumber
 * @param colors
 * @param rowOffset
 * @param noteWidth
 * @param noteHeight
 * @param previousNoteWidth
 * @param verticalAxisMargin
 *
 * @return { Group } The group object containing all of the notes.
 */
export function createIndividualSoundtrack({
	notesNumber,
	colors,
	noteWidth = new Decimal(1),
	noteHeight = new Decimal(1),
	previousNoteWidth = new Decimal(1),
}: {
	notesNumber: number;
	colors: Array<Color>;
	noteWidth?: Decimal;
	noteHeight?: Decimal;
	previousNoteWidth?: Decimal;
}) {
	const debugData = [];

	// If there's too many notes, the outline is hidden.
	const disableNoteOutline = notesNumber >= 500;

	const notesRow = new Group();
	const newColors = new Array<Color>();

	// Create the note mesh and outline for each note
	for (let i = 0; i < notesNumber; i++) {
		// The position of the note
		const noteX = noteWidth.times(i);
		const position = new Vector3(noteX.toNumber(), 0, 0);

		const halfNoteWidth = noteWidth.dividedBy(2);
		const noteCenterX = noteX.add(halfNoteWidth);

		// Determine if the note falls between two previous notes
		const modulo = noteCenterX.mod(previousNoteWidth);
		const isModuloNull =
			modulo.toNumber() === 0 ||
			modulo.toNumber() === previousNoteWidth.toNumber();

		// Determine the index of the note color
		const colorIndex = noteCenterX
			.dividedToIntegerBy(previousNoteWidth)
			.toNumber();

		// If the note center falls between two previous notes, it is deleted and colored white.
		// Otherwise, its color is based on the color of the previous note that it falls within.
		const noteColor = isModuloNull
			? new Color(0xffffff)
			: colors[colorIndex];

		debugData.push({
			noteX: noteX.toNumber(),
			noteCenterX: noteCenterX.toNumber(),
			halfNoteWidth: halfNoteWidth.toNumber(),
			previousNoteWidth: previousNoteWidth.toNumber(),
			modulo: noteCenterX.modulo(previousNoteWidth).toNumber(),
			colorIndex,
			noteColor: noteColor.getHexString(),
		});

		// Create the note object
		const { mesh, outline } = createRectangleObject(
			position,
			noteColor,
			noteWidth.toNumber(),
			noteHeight.toNumber(),
			disableNoteOutline
		);

		// Add the generated note components to the row
		notesRow.add(mesh, outline);
		// Save the new color at its index
		newColors.push(noteColor);
	}

	console.table(debugData);
	console.log(
		"%c⇒ %i blank note(s).",
		importantConsoleInfoStyle,
		newColors.filter((color) => color.equals(new Color(0xffffff))).length
	);

	return { notesRow, newColors };
}

/**
 * Creates soundtracks in the right order based on the resolutions and colors provided.
 * @param resolutions
 * @param colors
 */
export function createSoundtracks(
	resolutions: Array<number>,
	colors: Array<Color>
): Array<Group> {
	let previousNoteWidth = new Decimal(1);
	let previousRowWidth;

	const notesRows: Array<Group> = [];
	for (let i = 0; i < resolutions.length; i++) {
		console.info("─".repeat(65));
		console.info(
			`%cSoundtrack number ${i + 1}:`,
			importantConsoleInfoStyle
		);
		// Calculate the note width based on the resolution of the soundtrack
		const notesNumber = resolutions[i];
		const noteWidth: Decimal = new Decimal(
			previousRowWidth ? previousRowWidth.dividedBy(resolutions[i]) : 1
		);

		const { notesRow, newColors } = createIndividualSoundtrack({
			notesNumber: notesNumber,
			noteWidth: new Decimal(noteWidth),
			previousNoteWidth: previousNoteWidth,
			colors,
		});

		// Center the row on the x-axis
		centerObject(notesRow);
		// Add y-axis spacing
		notesRow.position.add(new Vector3(0, -i * 1.5));

		// Save the generated row
		notesRows.push(notesRow);

		// Save data to create the next row
		colors = newColors;
		previousRowWidth = noteWidth.times(notesNumber);
		previousNoteWidth = new Decimal(resolutions[0]).dividedBy(notesNumber);
	}

	return notesRows;
}

export function createDashedLine(startPosition: Vector3, endPosition: Vector3) {
	return new LineSegments(
		new BufferGeometry().setFromPoints([startPosition, endPosition]),
		new LineDashedMaterial({
			color: 0xffffff,
			linewidth: 1,
			scale: 1,
			dashSize: 3,
			gapSize: 1,
		})
	);
}

/**
 * Draws all of the soundtracks to the screen.
 *
 * @param scene - The scene to draw to.
 * @param camera
 * @param resolutions
 * @param colors
 * @param scaleFactor
 * @param decimalAccuracy
 * @param orbitControls
 */
export function drawSoundtracks(
	scene: Scene,
	camera: PerspectiveCamera,
	resolutions: Array<number>,
	colors: Array<Color>,
	scaleFactor: number,
	decimalAccuracy: number,
	orbitControls: OrbitControls
) {
	clearScene(scene);

	Decimal.config({
		modulo: Decimal.EUCLID,
		precision: decimalAccuracy,
	});

	const notesRows = createSoundtracks(resolutions, colors);
	const allNotesRows = new Group().add(...notesRows);
	// Scale everything up for easier visibility
	allNotesRows.scale.copy(new Vector3(scaleFactor, scaleFactor, scaleFactor));
	// Center the camera & change the zoom level
	centerObject(allNotesRows)
	setCameraZoomToFitObject(
		camera,
		allNotesRows,
		orbitControls,
		2.5,
		scaleFactor
	);

	// Render the notes rows
	scene.add(allNotesRows);
}

/**
 * Draws all of the images to the screen.
 *
 * @param scene - The scene to draw to.
 * @param camera
 * @param orbitControls
 * @param resolutions
 * @param image
 * @param scaleFactor
 * @param decimalAccuracy
 */
export async function drawPixelatedImages(
	scene: Scene,
	camera: PerspectiveCamera,
	orbitControls: OrbitControls,
	resolutions: Array<number[]>,
	image: HTMLImageElement,
	scaleFactor: number,
	decimalAccuracy: number
) {
	clearScene(scene);

	Decimal.config({
		modulo: Decimal.EUCLID,
		precision: decimalAccuracy,
	});

	let colors = await getPixelColorsFromImage({
		xResolution: resolutions[0][0],
		yResolution: resolutions[0][1],
		image: image,
	});

	if (!colors) {
		return;
	}

	const allImages = createPixelatedImages(resolutions, colors);

	// Scale everything up for easier visibility
	allImages.scale.copy(new Vector3(scaleFactor, scaleFactor, scaleFactor));
	// Center the camera & change the zoom level
	setCameraZoomToFitObject(
		camera,
		allImages,
		orbitControls,
		2.5,
		scaleFactor
	);

	// Render all of the images on the scene
	scene.add(allImages);
}

/**
 * Creates a pixelated image for each given resolutions.
 *
 * @param resolutions - The resolutions of each images
 * @param colors - The colors of the first image
 * @returns A group containing all of the images.
 */
export function createPixelatedImages(
	resolutions: Array<number[]>,
	colors: Color[][]
) {
	const imagesGroup = new Group();
	let previousPixelWidth, previousPixelHeight;

	const pixelatedImageWidth = resolutions[0][0] * 100;
	const pixelatedImageHeight = resolutions[0][1] * 100;

	for (let i = 0; i < resolutions.length; i++) {
		const xResolution = resolutions[i][0];
		const yResolution = resolutions[i][1];

		const xAxisPixelSize = new Decimal(pixelatedImageWidth).dividedBy(
			xResolution
		);
		const yAxisPixelSize = new Decimal(pixelatedImageHeight).dividedBy(
			yResolution
		);

		const { imagePixels, newColors } = createPixelatedImage({
			xResolution: xResolution,
			yResolution: yResolution,
			colors: colors,
			pixelWidth: new Decimal(pixelatedImageWidth).dividedBy(xResolution),
			pixelHeight: new Decimal(pixelatedImageHeight).dividedBy(
				yResolution
			),
			previousPixelWidth: previousPixelWidth ?? xAxisPixelSize,
			previousPixelHeight: previousPixelHeight ?? yAxisPixelSize,
		});

		// Center the image on the x-axis
		centerObject(imagePixels);
		// Add y-axis spacing
		imagePixels.position.add(new Vector3(i * 1.25 * pixelatedImageWidth));

		// Save the generated row
		imagesGroup.add(imagePixels);

		colors = newColors;
		previousPixelWidth = xAxisPixelSize;
		previousPixelHeight = yAxisPixelSize;
	}

	return imagesGroup;
}

/**
 * Creates a pixelated image of size xResolution by yResolution.
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
 * @return { Group } The Group containing all of the pixels.
 */
export function createPixelatedImage({
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
	const debugData = [];
	// If there's too many pixels, the outline is hidden.
	const disableNoteOutline = xResolution >= 100 || yResolution >= 100;

	const imagePixels = new Group();
	const newColors = new Array<Color[]>();

	// Create the pixel mesh and outline for each note
	// Iterate over each row of the pixelated image
	for (let i = 0; i < yResolution; i++) {
		// Iterate over each pixel of the row
		const newRowColors = [];
		for (let j = 0; j < xResolution; j++) {
			// The position of the pixel
			const pixelX = pixelWidth.times(j);
			const pixelY = pixelHeight.times(i);
			const position = new Vector3(
				pixelX.toNumber(),
				pixelY.toNumber(),
				0
			);

			const halfPixelWidth = pixelWidth.dividedBy(2);
			const halfPixelHeight = pixelHeight.dividedBy(2);
			const pixelCenterX = pixelX.add(halfPixelWidth);
			const pixelCenterY = pixelY.add(halfPixelHeight);

			// Determine if the pixel falls between two previous pixels
			const xAxisModulo = pixelCenterX.mod(previousPixelWidth);
			const yAxisModulo = pixelCenterY.mod(previousPixelHeight);

			const isXModuloNull =
				xAxisModulo.toNumber() === 0 ||
				xAxisModulo.toNumber() === previousPixelWidth.toNumber();

			const isYModuloNull =
				yAxisModulo.toNumber() === 0 ||
				yAxisModulo.toNumber() === previousPixelHeight.toNumber();

			const isModuloNull = isXModuloNull || isYModuloNull;

			// Determine the index of the pixel color
			const xAxisColorIndex = pixelCenterX
				.dividedToIntegerBy(previousPixelWidth)
				.toNumber();

			const yAxisColorIndex = pixelCenterY
				.dividedToIntegerBy(previousPixelHeight)
				.toNumber();

			// If the pixel center falls between two previous pixels, it is deleted and colored black.
			// Otherwise, its color is based on the color of the previous pixel that it center falls within.
			const pixelColor = isModuloNull
				? new Color(0x000000)
				: colors[yAxisColorIndex]?.[xAxisColorIndex] ??
				  new Color("red");

			// Create the pixel object
			const { mesh, outline } = createRectangleObject(
				position,
				pixelColor,
				pixelWidth.toNumber(),
				pixelHeight.toNumber(),
				disableNoteOutline
			);

			// Add the generated pixel components to the row
			imagePixels.add(mesh, outline);
			// Save the new color at its index
			newRowColors.push(pixelColor);

			debugData.push({
				pixelX: pixelX.toNumber(),
				pixelY: pixelY.toNumber(),
				pixelCenterX: pixelCenterX.toNumber(),
				pixelCenterY: pixelCenterY.toNumber(),
				halfPixelWidth: halfPixelWidth.toNumber(),
				halfPixelHeight: halfPixelHeight.toNumber(),
				previousPixelWidth: previousPixelWidth.toNumber(),
				previousPixelHeight: previousPixelHeight.toNumber(),
				xAxisModulo: xAxisModulo.toNumber(),
				yAxisModulo: yAxisModulo.toNumber(),
				isModuloNull: isModuloNull,
				xAxisColorIndex: xAxisColorIndex,
				yAxisColorIndex: yAxisColorIndex,
				noteColor: pixelColor.getHexString(),
			});
		}
		newColors.push(newRowColors);
	}

	// console.log(
	// 	"center",
	// 	new Box3()
	// 		.setFromObject(test)
	// 		.getCenter(test.position).multiplyScalar( - 1 )
	// );

	// console.table(debugData);
	// console.log(
	// 	"%c⇒ %i black pixel(s).",
	// 	importantConsoleInfoStyle,
	// 	newColors.filter((color) => color.equals(new Color(0x000000))).length
	// );

	return { imagePixels, newColors };
}

/**
 * Creates a pixelated image as described in the statement of the problem.
 *
 * @param pixelColors - Array containing the pixels of each row
 * @return The group object containing all of the pixels.
 */
export function createPixelatedImageObject(
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

/**
 * Extracts the colors of each pixel of a given size from the image.
 *
 * @param params
 * @param params.xResolution - The number of pixels on the x-axis
 * @param params.yResolution - The number of pixels on the y-axis
 * @param params.image - The image to extract the colors from
 * @returns An array of arrays of colors (one array per row).
 */
export async function getPixelColorsFromImage({
	xResolution,
	yResolution,
	image,
}: {
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
		createImageFittedInCanvas({
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

	return pixelColors;
}

/**
 * By Ken Fyrstenberg Nilsen
 *
 * If image and context are the only arguments, the rectangle will equal the canvas.
 *
 * @example
 *
 * ```js
 * createImageFittedInCanvas({canvas, image, x, y, width, height, offsetX, offsetY})
 * ```
 */
export function createImageFittedInCanvas({
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
 *
 * @param ctx
 * @param numberOfPixels - The number of pixels to fit on a side
 * @param pixelSize - The size of a pixel
 * @returns An array of color arrays.
 */
export function extractPixelatedImageColors(
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
 * Pixelates an image.
 *
 * @param canvas
 * @param ctx
 * @param image - The image to be pixelated
 * @param numberOfXAxisPixels - The number of pixels on the X axis of the output image.
 * @param numberOfYAxisPixels - The number of pixels on the Y axis of the output image.
 */
export function pixelateCanvasImage(
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
 *
 * @param image - The image to be cropped
 * @param outputImageAspectRatio - The aspect ratio of the cropped image.
 */
export function crop(image: HTMLImageElement, outputImageAspectRatio = 1) {
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
