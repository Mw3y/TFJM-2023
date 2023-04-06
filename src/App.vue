<template>
	<RouterView />
</template>

<style>
	:root {
		/* color-scheme: light dark; */
		color-scheme: light;
		color: rgba(255, 255, 255, 0.87);
		/* background-color: rgb(250, 249, 246); */
		background-color: #ebebeb;
		/* background-color: #242424; */

		font-synthesis: none;
		text-rendering: optimizeLegibility;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		-webkit-text-size-adjust: 100%;
	}

	html,
	body {
		margin: 0;
	}

	canvas {
		display: block;
	}

	/* Pixelated canvas style */
	.pixelated {
		image-rendering: optimizeSpeed; /* Legal fallback */
		image-rendering: -moz-crisp-edges; /* Firefox        */
		image-rendering: -o-crisp-edges; /* Opera          */
		image-rendering: -webkit-optimize-contrast; /* Safari         */
		image-rendering: optimize-contrast; /* CSS3 Proposed  */
		image-rendering: crisp-edges; /* CSS4 Proposed  */
		image-rendering: pixelated; /* CSS4 Proposed  */
		-ms-interpolation-mode: nearest-neighbor; /* IE8+           */
	}
</style>
