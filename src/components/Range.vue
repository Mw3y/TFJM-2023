<script setup lang="ts">
	const props = defineProps<{
		id: string;
		label: string;
		modelValue?: string;
		min: number;
		max: number;
	}>();

	const emit = defineEmits(["update:modelValue"]);
	const updateValue = (event: Event) => {
		emit("update:modelValue", (event.target as HTMLInputElement).value);
	};
</script>

<template>
	<label
		v-if="props.label"
		:for="props.id"
		class="block mb-2 text-lg font-medium text-neutral-500"
	>
		{{ props.label }}
	</label>
	<input
		:id="props.id"
		:max="props.max"
		:min="props.min"
		:value="modelValue"
		@input="updateValue"
		type="range"
		class="w-full h-2 mb-6 bg-white rounded-lg appearance-none cursor-pointer"
	/>
</template>
