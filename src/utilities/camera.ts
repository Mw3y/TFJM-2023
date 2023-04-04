import { PerspectiveCamera, Object3D, Box3, Vector3, Event } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

/**
 * Zoom the camera to fit an object in the field of view.
 *
 * @author Michal Jirků <https://wejn.org/2020/12/cracking-the-threejs-object-fitting-nut/>
 *
 * @param camera - The camera to use for zooming. Must have fov scaled by aspect ratio
 * @param object - offset The offset to apply to the before zooming
 * @param offset
 */
export function setCameraZoomToFitObject(
	camera: PerspectiveCamera,
	object: Object3D<Event>,
	orbitControls: OrbitControls,
	offset: number = 0,
	scaleFactor: number = 1
) {
	const boundingBox = new Box3().setFromObject(object);

	const size = new Vector3();
	boundingBox.getSize(size);

	// Figure out how to fit the box in the view:
	// 1. figure out horizontal FOV (on non-1.0 aspects)
	// 2. figure out distance from the object in X and Y planes
	// 3. select the max distance (to fit both sides in)
	//
	// The reason is as follows:
	//
	// Imagine a bounding box (BB) is centered at (0,0,0).
	// Camera has vertical FOV (camera.fov) and horizontal FOV
	// (camera.fov scaled by aspect, see fovh below)
	//
	// Therefore if you want to put the entire object into the field of view,
	// you have to compute the distance as: z/2 (half of Z size of the BB
	// protruding towards us) plus for both X and Y size of BB you have to
	// figure out the distance created by the appropriate FOV.
	//
	// The FOV is always a triangle:
	//
	//  (size/2)
	// +--------+
	// |       /
	// |      /
	// |     /
	// | F° /
	// |   /
	// |  /
	// | /
	// |/
	//
	// F° is half of respective FOV, so to compute the distance (the length
	// of the straight line) one has to: `size/2 / Math.tan(F)`.
	//
	// FTR, from https://threejs.org/docs/#api/en/cameras/PerspectiveCamera
	// the camera.fov is the vertical FOV.

	const fov = camera.fov * (Math.PI / 180);
	const fovh = 2 * Math.atan(Math.tan(fov / 2) * camera.aspect);
	const dx = size.z / 2 + Math.abs(size.x / 2 / Math.tan(fovh / 2));
	const dy = size.z / 2 + Math.abs(size.y / 2 / Math.tan(fov / 2));
	let cameraZ = Math.max(dx, dy);

	// Offset the camera, if desired (to avoid filling the whole canvas)
	if (offset !== undefined && offset !== 0) {
		cameraZ *= offset;
	}

	camera.position.set(0, 0, cameraZ);
	orbitControls.target.set(0, 0, cameraZ)

	// Set the far plane of the camera so that it easily encompasses the whole object
	const minZ = boundingBox.min.z;
	const cameraToFarEdge = minZ < 0 ? -minZ + cameraZ : cameraZ - minZ;

	camera.far = cameraToFarEdge * 3 * scaleFactor;
	camera.updateProjectionMatrix();
}
