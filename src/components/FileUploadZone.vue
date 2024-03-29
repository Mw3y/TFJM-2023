<script lang="ts" setup>
	import { ref } from "vue";
	import { createImage } from "../utilities/draw";

	const emit = defineEmits<{
		(e: "onImageUpload", value: HTMLImageElement): void;
	}>();

	const file = ref<File | null>();

	/**
	 * Executes whenever a file is uploaded & emits a new event.
	 * @param $event - The event associated with the file upload
	 */
	async function onFileUpload($event: Event) {
		const target = $event.target as HTMLInputElement;
		if (target && target.files) {
			const image = await createImageFromFile(target.files[0]);
			emit("onImageUpload", image);
			// console.log(target.files, image);
		}
	}

	/**
	 * Converts the raw file data into an HTML image element.
	 * @param file - The data of the file that was uploaded
	 * @return A promise which when resolved will return an HTML image element.
	 */
	async function createImageFromFile(file: File): Promise<HTMLImageElement> {
		return await new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.onload = async (e: ProgressEvent<FileReader>) => {
				resolve(await createImage(<string>e.target?.result));
			};

			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	}
</script>

<template>
	<div class="flex items-center justify-center w-full">
		<label
			for="dropzone-file"
			class="flex flex-col items-center justify-center w-full h-32 border-2 border-neutral-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
		>
			<div class="flex flex-col items-center justify-center pt-5 pb-5">
				<svg
					aria-hidden="true"
					class="w-10 h-10 mb-3 text-neutral-500"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
					></path>
				</svg>
				<p class="flex text-sm text-neutral-500">
					<span class="font-semibold text-center my-auto">
						Cliquez ici pour utiliser votre propre image.
					</span>
				</p>
			</div>
			<input
				id="dropzone-file"
				type="file"
				ref="file"
				@change="onFileUpload($event)"
				accept="image/*"
				capture
				class="hidden"
			/>
		</label>
	</div>
</template>
