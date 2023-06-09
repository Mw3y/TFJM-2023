import { createRouter, createWebHashHistory } from "vue-router";

export default createRouter({
	history: createWebHashHistory("/TFJM-2023/"),
	routes: [
		{
			name: "SoundtracksPlayground",
			path: "/playground/soundtracks",
			component: () => import("./pages/SoundtracksPlayground.vue"),
		},
		{
			name: "ImagesPlayground",
			path: "/playground/images",
			component: () => import("./pages/ImagesPlayground.vue"),
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
