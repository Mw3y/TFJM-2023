import { createRouter, createWebHistory } from "vue-router";

export default createRouter({
	history: createWebHistory("/cpge/tfjm-2023/problem-4"),
	routes: [
		{
			name: "SoundtracksPlayground",
			path: "/playground/soundtracks",
			component: () => import("./pages/Playground.vue"),
			props: {
				type: "notes",
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
