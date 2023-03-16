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
} from "three";

import { Decimal } from "decimal.js";

Decimal.config({
	modulo: Decimal.EUCLID,
	precision: 16,
});

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
	color?: Color,
	width: number = 1,
	height: number = 1
) {
	// Create the mesh of a new note
	const noteMesh = new Mesh(
		new PlaneGeometry(width, height, 1, 1),
		new MeshBasicMaterial({
			color: color ?? new Color(Math.random() * 0xffffff),
		})
	);

	// Draw the outline of the note
	const geometry = new EdgesGeometry(noteMesh.geometry);
	const material = new LineBasicMaterial({ color: 0xffffff });
	const outline = new LineSegments(geometry, material);
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
export function createNotesRow({
	notesNumber,
	colors,
	rowOffset,
	noteWidth = new Decimal(1),
	noteHeight = new Decimal(1),
	previousNoteWidth = new Decimal(1),
	verticalAxisMargin = 0.75,
}: {
	notesNumber: number;
	colors?: Array<Color>;
	rowOffset?: number;
	noteWidth?: Decimal;
	noteHeight?: Decimal;
	previousNoteWidth?: Decimal;
	verticalAxisMargin?: number;
}) {
	const row = new Group();
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
			: colors?.[colorIndex];

		// Create the note object
		const [noteMesh, noteOutline] = createNoteObject(
			position,
			noteColor,
			noteWidth.toNumber(),
			noteHeight.toNumber()
		);

		// Add the generated note components to the row
		row.add(noteMesh, noteOutline);
	}

	// Center the row on the x-axis
	row.position.set(
		rowOffset ?? calculateHorizontalOffset(row),
		verticalAxisMargin,
		0
	);

	return row;
}

/**
 * Calculates the size of a 3D object.
 * @param object - The object to get the size of
 * @return { Vector3 } A triplet of numbers containing the size of the object on each axis.
 */
export function getObject3DSize(object: Object3D<Event>): Vector3 {
	return new Box3().setFromObject(object, true).getSize(new Vector3());
}

export function calculateHorizontalOffset(
	object: Object3D<Event>,
	noteWidth: number = 1
) {
	return (noteWidth - getObject3DSize(object).x) / 2;
}
