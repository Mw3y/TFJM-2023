<script lang="ts" setup>
	import { useRouter } from "vue-router";

	const router = useRouter();
	const props = defineProps<{
		playground: "soundtracks" | "images";
	}>();
</script>

<template>
	<ul
		class="cursor-pointer border border-[#bdbdbd] text-sm font-medium text-center divide-x divide-[#bdbdbd] rounded-xl sm:flex"
	>
		<li class="w-full">
			<a
				@click="router.push({ name: 'SoundtracksPlayground' })"
				class="rounded-l-xl"
				:class="[
					props.playground === 'soundtracks'
						? 'tab-active'
						: 'tab-inactive',
				]"
			>
				Bandes son
			</a>
		</li>
		<li class="w-full">
			<a
				@click="router.push({ name: 'ImagesPlayground' })"
				class="rounded-r-xl"
				:class="[
					props.playground === 'images'
						? 'tab-active'
						: 'tab-inactive',
				]"
			>
				Images
			</a>
		</li>
	</ul>
</template>

<style type="text/css" scoped>
	.tab-active {
		@apply inline-block w-full px-4 py-2 text-neutral-700 bg-white focus:outline-none;
	}

	.tab-inactive {
		@apply inline-block w-full px-4 py-2 bg-gray-50 text-neutral-500 hover:text-neutral-700 hover:bg-white focus:outline-none;
	}
</style>
