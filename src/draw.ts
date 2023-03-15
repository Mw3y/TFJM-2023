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
} from "three";

/**
 * Creates a new note mesh and its outline.
 * The note is centered at the given position.
 * 
 * @example
 * const noteObject = createNoteObject(new Vector3(0, 0, 0))

 * @param position - The position of the center of the note
 * @param width - The width of the note
 * @param height - The height of the note
 * @return { Array } An array with the note mesh and the outline.
 */
export function createNoteObject(
	position: Vector3,
	width: number = 1,
	height: number = 1
) {
	// Create the mesh of a new note
	const noteMesh = new Mesh(
		new PlaneGeometry(width, height, 1, 1),
		new MeshBasicMaterial({
			color: new Color().setHex(Math.random() * 0xffffff),
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
 * Calculates the size of a 3D object.
 * @param object - The object to get the size of
 * @return { Vector3 } A triplet of numbers containing the size of the object on each axis.
 */
export function getObject3DSize(object: Object3D<Event>): Vector3 {
	return new Box3().setFromObject(object, true).getSize(new Vector3());
}

