<script setup lang="ts">
	import Playground from "../components/Playground.vue";

	const props = defineProps<{
		type: "soundtracks" | "images";
	}>();
</script>

<template>
	<Playground :type="props.type" />
</template>
