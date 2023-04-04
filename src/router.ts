import { createRouter, createWebHistory } from "vue-router";

export default createRouter({
	history: createWebHistory("/tfjm-2023/problem-4"),
	routes: [
		{
			path: "/",
			component: () => import("./pages/Playground.vue"),
		},
		{
			path: "/unauthorized",
			component: () => import("./pages/UnAuthorized.vue"),
		},
	],
});
