<script setup lang="ts">
	import { computed, ref, watch } from "vue";
	import Input from "./Input.vue";
	import Range from "./Range.vue";

	const props = defineProps<{
		scaleFactorMax: number;
		defaultScaleFactor: number;
		decimalAccuracyMax: number;
		defaultDecimalAccuracy: number;
		defaultSoundtrackResolutions: number[];
		defaultImageResolutions: number[][];
		playground: "soundtracks" | "images";
	}>();

	const version = __APP_VERSION__;
	const isSoundtracksPlayground = props.playground === "soundtracks";

	const emit = defineEmits<{
		(e: "soundtrackResolutionsChange", value: Array<number>): void;
		(e: "imageResolutionsChange", value: Array<number[]>): void;
		(e: "scaleFactorChange", value: number): void;
		(e: "decimalAccuracyChange", value: number): void;
	}>();

	const scaleFactor = ref(props.defaultScaleFactor.toString());
	const scaleFactorLabel = computed(
		() => "Échelle : " + scaleFactor.value + "%"
	);
	watch(scaleFactor, () =>
		emit("scaleFactorChange", parseInt(scaleFactor.value))
	);

	const decimalAccuracy = ref(props.defaultDecimalAccuracy.toString());
	const decimalAccuracyLabel = computed(
		() => "Précision : " + decimalAccuracy.value + " décimales"
	);
	watch(decimalAccuracy, () =>
		emit("decimalAccuracyChange", parseInt(decimalAccuracy.value))
	);

	const imagesResolutions = computed(() => {
		return resolutionsInputContent.value
			.replaceAll(" ", "")
			.replace(/,\s*$/, "")
			.split(",")
			.map((value) =>
				value
					.trim()
					.slice(1, -1)
					.split(";")
					.map((str) => parseInt(str))
					.filter((int) => !isNaN(int))
			);
	});

	const soundtrackResolutions = computed(() => {
		return resolutionsInputContent.value
			.replaceAll(" ", "")
			.replace(/,\s*$/, "")
			.split(",")
			.map((str) => parseInt(str))
			.filter((int) => !isNaN(int));
	});

	const defaultResolutions = isSoundtracksPlayground
		? props.defaultSoundtrackResolutions.join(", ")
		: props.defaultImageResolutions
				.map((resolutions) => "(" + resolutions.join("; ") + ")")
				.join(", ");

	const resolutionsInputContent = ref(defaultResolutions);
	function handleResolutionsChange() {
		isSoundtracksPlayground
			? emit("soundtrackResolutionsChange", soundtrackResolutions.value)
			: emit("imageResolutionsChange", imagesResolutions.value);
	}

	function validateResolutionInput(event: Event) {
		const pattern = isSoundtracksPlayground
			? /(?:,|\s|\d+)/
			: /(?:,|\s|\d+|\(|\)|;)/; // Allow parentheses
		const key = (event as KeyboardEvent).key;
		if (!pattern.test(key)) {
			event.preventDefault();
		}
	}

	function addResolutionSeparator() {
		if (
			(soundtrackResolutions.value.length > 0 ||
				imagesResolutions.value.length > 0) &&
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
		class="flex gap-4 flex-col max-w-md max-h-screen lg:max-w-none absolute top-0 left-0 right-0 sm:right-auto w-11/12 sm:2/12 md:w-4/12 lg:w-3/12 xl:w-3/12 2xl:w-1/6 m-4 rounded-xl bg-[#f0f0f0] px-4 py-3 shadow-2xl shadow-zinc-200 border-[#bdbdbd] border"
	>
		<img
			@click="hideOrShowSidebar"
			:class="{ 'pl-0': !isSidebarHidden }"
			class="w-10 h-10 p-2"
			src="/svg/arrow-left.svg"
		/>
		<div v-if="!isSidebarHidden" class="flex flex-col gap-4 mb-4">
			<div class="flex flex-col space-y-2">
				<p class="text-neutral-500 text-lg font-medium">
					Résolution(s) :
				</p>
				<p class="text-neutral-500 text-sm">
					<strong>Astuce 🛈 :</strong> Appuyer sur TAB pour créer une
					nouvelle résolution.
				</p>
				<Input
					id="resolutions-input"
					v-model="resolutionsInputContent"
					:validator="validateResolutionInput"
					@keydown.tab.prevent="addResolutionSeparator"
					@submit="handleResolutionsChange"
				/>
			</div>

			<div class="flex flex-col gap-4">
				<Range
					:label="decimalAccuracyLabel"
					:min="100"
					:max="decimalAccuracyMax"
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
			<p class="text-neutral-500 text-sm">
				<strong>Astuce 🛈 :</strong> Des informations de débogage telles
				que le nombre de silences sont disponibles dans la console
				(touche F12).
			</p>
		</div>

		<h3
			v-if="!isSidebarHidden"
			class="text-neutral-500 font-normal text-base leading-5"
		>
			Créé par
			<a
				class="underline font-medium"
				href="https://suivix.xyz"
				target="_blank"
				>Maxence ESPAGNET</a
			>, TG11, Lycée Pierre-Paul Riquet - v.{{ version }}
		</h3>
	</div>
</template>
