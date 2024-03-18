<script setup lang="ts">
	import { computed, ref, watch } from "vue";
	import Input from "./Input.vue";
	import Range from "./Range.vue";
	import Tabs from "./Tabs.vue";
	import FileUploadZone from "./FileUploadZone.vue";

	const props = defineProps<{
		is3DEnabled: boolean;
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
		(e: "toggle3DMode", value: boolean): void;
		(e: "decimalAccuracyChange", value: number): void;
		(e: "onImageUpload", value: HTMLImageElement): void;
	}>();

	const is3DEnabled = ref(props.is3DEnabled);
	watch(is3DEnabled, () => emit("toggle3DMode", is3DEnabled.value));

	const decimalAccuracy = ref(props.defaultDecimalAccuracy.toString());
	const decimalAccuracyLabel = computed(
		() => "Précision : " + decimalAccuracy.value + " décimales"
	);
	watch(decimalAccuracy, () =>
		emit("decimalAccuracyChange", parseInt(decimalAccuracy.value))
	);

	const imagesResolutions = computed(() => {
		return (
			resolutionsInputContent.value
				.match(/\((\d+;\s?\d+)\)/g)
				?.map((value: string) =>
					value
						.match(/\d+/g)
						?.map((str) => parseInt(str))
						.filter((int) => !isNaN(int))
				) ?? [[]]
		);
	});

	const soundtrackResolutions = computed(() => {
		return (
			resolutionsInputContent.value
				.match(/\d+/g)
				?.map((str) => parseInt(str))
				.filter((int) => !isNaN(int)) ?? []
		);
	});

	const defaultResolutions = isSoundtracksPlayground
		? props.defaultSoundtrackResolutions.join(", ")
		: props.defaultImageResolutions
				.map((resolutions) => "(" + resolutions.join("; ") + ")")
				.join(", ");

	const resolutionsInputContent = ref(defaultResolutions);
	function handleResolutionsChange() {
		if (isSoundtracksPlayground) {
			emit("soundtrackResolutionsChange", soundtrackResolutions.value);
		} else if (imagesResolutions.value) {
			emit(
				"imageResolutionsChange",
				<typeof props.defaultImageResolutions>imagesResolutions.value
			);
		}
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
		const trimmedInputContent = resolutionsInputContent.value.trim();
		if (
			!trimmedInputContent.endsWith(",") &&
			!trimmedInputContent.endsWith(";") &&
			trimmedInputContent.length > 0
		) {
			if (
				!isSoundtracksPlayground &&
				!["(", ")", ",", ";"].includes(trimmedInputContent.slice(-1))
			) {
				// if (
				// 	imagesResolutions.value[imagesResolutions.value.length - 1]
				// 		?.length === 2
				// ) {
				// 	resolutionsInputContent.value += "), ";
				// } else {
				resolutionsInputContent.value += "; ";
				// }
			}
			// Automatically add a new resolution
			else if (!trimmedInputContent.endsWith("(")) {
				resolutionsInputContent.value += ", ";
				if (!isSoundtracksPlayground) {
					resolutionsInputContent.value += "(";
				}
			}
		} else if (trimmedInputContent.endsWith("),")) {
			resolutionsInputContent.value += "(";
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
		class="flex gap-4 flex-col max-w-md sm:max-h-[90vh] overflow-y-auto lg:max-w-none absolute top-0 left-0 right-0 sm:right-auto w-11/12 sm:2/12 md:w-4/12 lg:w-3/12 xl:w-3/12 2xl:w-[22.5%] m-4 rounded-xl bg-[#f0f0f0] px-4 py-3 shadow-2xl shadow-zinc-200 border-[#bdbdbd] border"
	>
		<img
			@click="hideOrShowSidebar"
			:class="{ 'pl-0': !isSidebarHidden }"
			class="w-10 h-10 p-2"
			src="/svg/arrow-left.svg"
		/>
		<div v-if="!isSidebarHidden" class="flex flex-col gap-4 mb-4">
			<Tabs :playground="props.playground" />
			<div class="flex flex-col space-y-2">
				<p class="text-neutral-700 text-lg font-medium">
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
				<label
					class="relative inline-flex items-center gap-2 cursor-pointer"
				>
					<input
						type="checkbox"
						v-model="is3DEnabled"
						class="sr-only peer"
					/>
					<div
						class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
					></div>
					<span for="3d-mode" class="font-medium text-neutral-700"
						>Mode 3D
					</span>
				</label>
			</div>
			<p class="text-neutral-500 text-sm">
				<strong>Astuce 🛈 :</strong> Des informations de débogage telles
				que le nombre de silences sont disponibles dans la console
				(touche F12).
			</p>
			<FileUploadZone
				v-if="!isSoundtracksPlayground"
				@on-image-upload="emit('onImageUpload', $event)"
			/>
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
