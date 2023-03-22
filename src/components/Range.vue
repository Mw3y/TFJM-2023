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
	<div class="flex flex-col gap-1">
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
			class="w-full h-2 bg-white rounded-lg appearance-none cursor-pointer"
		/>
	</div>
</template>
