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
import { setCameraZoomToFitObject } from "./controls";

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
 * Creates a new note mesh and its outline.
 * The note is centered at the given position.
 *
 * @example
 * const noteObject = createNoteObject(new Vector3(0, 0, 0))
 *
 * @param position - The position of the center of the note
 * @param width - The width of the note
 * @param height - The height of the note
 * @return { Array } An array with the note mesh and the outline.
 */
export function createNoteObject(
	position: Vector3,
	color: Color = new Color(Math.random() * 0xffffff),
	width: number = 1,
	height: number = 1,
	disableOutline: boolean = false
) {
	// Create the mesh of a new note
	const noteMesh = new Mesh(
		new PlaneGeometry(width, height, 1, 1),
		new MeshBasicMaterial({
			color,
		})
	);

	// Draw the outline of the note
	const outline = createObjectOutline(
		noteMesh.geometry,
		// If disableOutline is set to true, the outline is not visible
		// since it is set to the same color as the plane geometry.
		disableOutline ? color : new Color(0x000000)
	);

	// Set the note & outline position
	noteMesh.position.copy(position);
	outline.position.copy(position);

	return [noteMesh, outline];
}

/**
 * Creates a row of notes as described in the statement of the problem.
 *
 * @example
 * const noteRow = createNotesRow({ notesNumber: 4})
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
	// If there's too many notes, the outline is hidden.
	const disableNoteOutline = notesNumber >= 500;

	const notesRow = new Group();
	const newColors = new Array<Color>();

	// Create the note mesh and outline for each note
	for (let i = 0; i < notesNumber; i++) {
		// The position of the note
		const position = new Vector3(noteWidth.times(i).toNumber(), 0, 0);

		const halfNoteWidth = noteWidth.dividedBy(2);
		const noteX = new Decimal(position.x);
		const noteCenterX = noteX.add(halfNoteWidth);

		// Determine if the note falls between two previous notes
		const isModuloNull = noteCenterX.modulo(previousNoteWidth).equals(0);
		// Determine the index of the note color
		const colorIndex = noteCenterX
			.dividedToIntegerBy(previousNoteWidth)
			.toNumber();

		// If the note center falls between two previous notes, it is deleted and colored white.
		// Otherwise, its color is based on the color of the previous note that it falls within.
		const noteColor = isModuloNull
			? new Color(0xffffff)
			: colors[colorIndex];

		// Create the note object
		const [noteMesh, noteOutline] = createNoteObject(
			position,
			noteColor,
			noteWidth.toNumber(),
			noteHeight.toNumber(),
			disableNoteOutline
		);

		// Add the generated note components to the row
		notesRow.add(noteMesh, noteOutline);
		// Save the new color at its index
		newColors.push(noteColor);
	}

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

		// Save the generated row
		notesRows.push(notesRow);

		// Center the row on the x-axis
		centerObject(notesRow);
		// Add y-axis spacing
		notesRow.position.add(new Vector3(0, -i * 1.5));

		// Save data to create the next row
		colors = newColors;
		previousRowWidth = noteWidth.times(notesNumber);
		previousNoteWidth = new Decimal(getObject3DSize(notesRow).x).dividedBy(
			notesNumber
		);
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
 */
export function drawSoundtracks(
	scene: Scene,
	camera: PerspectiveCamera,
	resolutions: Array<number>,
	colors: Array<Color>,
	scaleFactor: number,
	decimalAccuracy: number,
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
	centerObject(allNotesRows);
	setCameraZoomToFitObject(camera, allNotesRows, 2.5, scaleFactor);

	// Render the notes rows
	scene.add(allNotesRows);
}

export function generateColorPalette(maxResolution: number) {
	const colors = [
		new Color(0x009fe3),
		new Color(0x80cff1),
		new Color(0xea5e00),
		new Color(0xf4af80),
		new Color(0x3d405b),
		new Color(0x5f6178),
		new Color(0xd32b51),
		new Color(0xb74083),
		new Color(0x845a9f),
		new Color(0x3f517d),
		new Color(0x386982),
		new Color(0x038cb7),
		new Color(0x00a0a4),
		new Color(0x00a578),
		new Color(0x2c9d13),
		new Color(0xc49d0a),
	];

	while (colors.length < maxResolution) {
		colors.push(...colors);
	}

	return colors;
}
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
