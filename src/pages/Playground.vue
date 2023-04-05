<script setup lang="ts">
	import Playground from "../components/Playground.vue";

	const props = defineProps<{
		type: "notes" | "images";
	}>();
</script>

<template>
	<Playground :type="props.type" />
</template>
