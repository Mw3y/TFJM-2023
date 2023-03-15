import { PerspectiveCamera, WebGLRenderer, MOUSE } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

/**
 * This is a helper function to enable 2D movement.

 * @param camera - The perspective camera used
 * @param renderer - The WebGL renderer
 * @return { OrbitControls } The controls that were created.
 */
export function enable2DMovement(
	camera: PerspectiveCamera,
	renderer: WebGLRenderer
): OrbitControls {
	// The control handler.
	const controls = new OrbitControls(camera, renderer.domElement);

	controls.target.set(0, 0, 0); // view direction perpendicular to XY-plane
	controls.enableRotate = false; // Disable the possibility to rotate
	controls.enableZoom = true; // Enable mouse scroll zoom

	// Swap the default controls the be more user friendly
	controls.mouseButtons.LEFT = MOUSE.RIGHT;
	controls.mouseButtons.RIGHT = MOUSE.LEFT;

	return controls;
}
