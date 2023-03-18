<template>
	<form>
		<label
			for="search"
			class="mb-2 text-sm font-medium text-gray-900 sr-only"
		>
			4, 7
		</label>
		<div class="relative">
			<input
				type="search"
				id="search"
				class="block w-full p-4 text-base text-neutral-600 border border-[#bdbdbd] rounded-xl bg-gray-50 focus:ring-blue-500 focus:border-blue-500 outline-none"
				placeholder="Résolutions : 4, 7"
				required
			/>
			<button
				type="submit"
				class="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2"
			>
				Valider
			</button>
		</div>
	</form>
</template>
