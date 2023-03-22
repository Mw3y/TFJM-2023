<script setup lang="ts">
	import { computed, ref, watch } from "vue";
	import Input from "./Input.vue";
	import Range from "./Range.vue";

	const props = defineProps<{
		scaleFactorMax: number;
		defaultDecimalAccuracy: number;
	}>();

	const emit = defineEmits<{
		(e: "resolutionChange", value: Array<number>): void;
		(e: "scaleFactorChange", value: number): void;
		(e: "decimalAccuracyChange", value: number): void;
	}>();

	const scaleFactor = ref(props.scaleFactorMax.toString());
	const scaleFactorLabel = computed(
		() => "Échelle " + scaleFactor.value + "%"
	);
	watch(scaleFactor, () =>
		emit("scaleFactorChange", parseInt(scaleFactor.value))
	);

	const decimalAccuracy = ref(props.defaultDecimalAccuracy.toString());
	const decimalAccuracyLabel = computed(
		() => "Précision ." + decimalAccuracy.value
	);
	watch(decimalAccuracy, () =>
		emit("decimalAccuracyChange", parseInt(decimalAccuracy.value))
	);

	const resolutions = computed(() => {
		return resolutionsInputContent.value
			.replaceAll(" ", "")
			.replace(/,\s*$/, "")
			.split(",")
			.map((value) => parseInt(value))
			.filter((value) => !isNaN(value));
	});

	const resolutionsInputContent = ref("");
	function handleResolutionsChange() {
		emit("resolutionChange", resolutions.value);
	}

	function validateResolutionInput(event: Event) {
		const pattern = /(?:,|\s|\d+)/;
		const key = (event as KeyboardEvent).key;
		if (!pattern.test(key)) {
			event.preventDefault();
		}
	}

	function addResolutionSeparator() {
		if (
			resolutions.value.length > 0 &&
			!resolutionsInputContent.value.trim().endsWith(",")
		) {
			resolutionsInputContent.value += ", ";
		}
	}

	/**
	 * Hide or show the sidebar on button click
	 */
	const isSidebarHidden = ref(false);
	function hideOrShowSidebar() {
		isSidebarHidden.value = !isSidebarHidden.value;
	}
</script>

<template>
	<div
		:class="{ '!w-fit !p-3': isSidebarHidden }"
		class="flex gap-4 flex-col max-w-md max-h-screen lg:max-w-none absolute top-0 left-0 right-0 sm:right-auto w-11/12 sm:2/12 md:w-4/12 lg:w-3/12 xl:w-1/6 m-4 rounded-xl bg-[#f0f0f0] px-4 py-3 shadow-2xl shadow-zinc-200 border-[#bdbdbd] border"
	>
		<img
			@click="hideOrShowSidebar"
			:class="{ 'pl-0': !isSidebarHidden }"
			class="w-10 h-10 p-2"
			src="/svg/arrow-left.svg"
		/>
		<div v-if="!isSidebarHidden" class="flex flex-col gap-4 mb-4">
			<Input
				id="resolutions-input"
				v-model="resolutionsInputContent"
				:validator="validateResolutionInput"
				@keydown.tab.prevent="addResolutionSeparator"
				@submit="handleResolutionsChange"
			/>
			<div class="flex flex-col gap-2">
				<Range
					:label="decimalAccuracyLabel"
					:min="1"
					:max="16"
					v-model="decimalAccuracy"
					id="decimal-accuracy"
				/>
				<Range
					:label="scaleFactorLabel"
					:min="1"
					:max="props.scaleFactorMax"
					v-model="scaleFactor"
					id="scale-selector"
				/>
			</div>
		</div>

		<h3
			v-if="!isSidebarHidden"
			class="hidden sm:block text-neutral-500 font-normal text-base leading-5"
		>
			Créé par Maxence ESPAGNET,<br />Lycée Pierre-Paul Riquet
		</h3>
	</div>
</template>
