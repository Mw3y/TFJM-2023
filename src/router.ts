import { createRouter, createWebHashHistory } from "vue-router";

export default createRouter({
	history: createWebHashHistory("/cpge/tfjm-2023/problem-4"),
	routes: [
		{
			name: "SoundtracksPlayground",
			path: "/playground/soundtracks",
			component: () => import("./pages/Playground.vue"),
			props: {
				type: "soundtracks",
			},
		},
		{
			name: "ImagessPlayground",
			path: "/playground/images",
			component: () => import("./pages/Playground.vue"),
			props: {
				type: "images",
			},
		},
		{
			path: "/unauthorized",
			component: () => import("./pages/UnAuthorized.vue"),
		},
		{
			path: "/:catchAll(.*)",
			redirect: { name: "SoundtracksPlayground" },
		},
	],
});
