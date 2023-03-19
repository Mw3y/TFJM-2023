<script setup lang="ts">
	const props = defineProps<{
		id: string;
		modelValue: string;
	}>();

	const emit = defineEmits(["update:modelValue", "submit"]);
	const updateValue = (event: Event) => {
		emit("update:modelValue", (event.target as HTMLInputElement).value);
	};
</script>

<template>
	<div class="relative">
		<input
			:id="id"
			:value="modelValue"
			@input="updateValue"
			@keyup.enter="emit('submit')"
			type="text"
			class="block w-full p-4 text-base text-neutral-600 border border-[#bdbdbd] rounded-xl bg-gray-50 focus:ring-blue-500 focus:border-blue-500 outline-none"
			placeholder="Résolutions : 4, 7"
			required
		/>
		<button
			@click="emit('submit')"
			type="submit"
			class="text-white absolute right-2.5 bottom-2.5 bg-blue-600 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2"
		>
			Valider
		</button>
	</div>
</template>
