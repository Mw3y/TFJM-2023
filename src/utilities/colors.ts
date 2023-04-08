import randomColor from "randomcolor";
import { Color } from "three";

/**
 * Generates a color palette for the first soundtrack.
 * @param maxResolution - The maximum number of notes to generate
 * @param random - Whether the colors should be randomly generated
 * @return An array of colors.
 */
export function generateColorPalette(maxResolution: number, random = true) {
	const predefinedColors = [
		new Color(0x009fe3),
		// new Color(0x80cff1),
		new Color(0xea5e00),
		// new Color(0xf4af80),
		// new Color(0x3d405b),
		// new Color(0x5f6178),
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
		// ffbe0b,fb5607,ff006e,8338ec,3a86ff
		new Color(0xffbe0b),
		new Color(0xfb5607),
		new Color(0xff006e),
		new Color(0x8338ec),
		new Color(0x3a86ff),
		// 2a9d8f,e9c46a,f4a261,e76f51
		new Color(0x2a9d8f),
		new Color(0xe9c46a),
		new Color(0xf4a261),
		new Color(0xe76f51),
		// 61e294,7bcdba,9799ca,bd93d8,b47aea
		new Color(0x61e294),
		new Color(0x7bcdba),
		new Color(0x9799ca),
		// new Color(0xbd93d8),
		new Color(0xb47aea),
		// 3d5a80,98c1d9,e0fbfc,ee6c4d,293241
		new Color(0x3d5a80),
		new Color(0xee6c4d),
		// 1f2041,4b3f72,ffc857,119da4,19647e
		new Color(0x4b3f72),
		new Color(0xffc857),
		new Color(0x119da4),
		new Color(0x19647e),
		// 033f63,28666e,7c9885,b5b682,fedc97
		new Color(0x7c9885),
		new Color(0xb5b682),
		new Color(0xfedc97),
	];

	const colors = [];
	if (random) {
		const randomColors = randomColor({
			seed: maxResolution,
			format: "hsl",
			luminosity: "dark",
			count: Math.ceil((maxResolution - predefinedColors.length) / 2),
		}).map((c) => new Color(c).convertLinearToSRGB());

		const notLightenedcolors: Color[] =
			predefinedColors.concat(randomColors);

		for (const color of notLightenedcolors) {
			colors.push(color);
			// Create a lighter shade of the color
			colors.push(
				new Color().copy(color).lerp(new Color(0xffffff), 0.505)
			);
		}
	} else {
		for (let i = predefinedColors.length; i < maxResolution; i ++) {
			const newColor = predefinedColors[i % predefinedColors.length];
			const lighterColor = new Color()
				.copy(newColor)
				.lerp(new Color(0xffffff), 0.505);
			colors.push(newColor, lighterColor);
		}
	}

	return colors;
}