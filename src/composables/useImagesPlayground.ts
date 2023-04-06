import {
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

import { Ref } from "vue";

export function useImagesPlayground(
	scene: Scene,
	camera: PerspectiveCamera,
	orbitControls: OrbitControls,
	resolutions: Ref<number[]>,
	scaleFactor: Ref<number>,
	decimalAccuracy: Ref<number>
) {
	const loader = new SVGLoader();

	// https://threejs.org/examples/models/svg/tiger.svg
	loader.load("/images/mona-lisa.svg", function (data) {
		const paths = data.paths;

		const group = new Group();
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
					color: new Color()
						.setStyle(fillColor),
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

		scene.add(group);

	});
}
