<template>
	<view v-if="list.length > 0" class="container">
		<view v-for="section in list" :key="section.id" class="section" :class="section.layoutType">
			<view
				v-for="(item, index) in section.imageItems"
				:key="item.id ?? `${section.id}-${index}`"
				class="item"
				@tap="handleClick(item)"
			>
				<image :src="item.imageUrl" mode="widthFix" />
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
	import { ref, onMounted } from "vue"

	import { contentApi } from "@/api/contentApi"
	import type { PromoImageItems, PromoSectionsItem } from "@/api/types"
	import { navigateByLink } from "@/utils"

	const list = ref<PromoSectionsItem[]>([])

	const getPromoSections = async () => {
		const { data } = await contentApi.promoSections()
		list.value = data
	}

	const handleClick = (item: PromoImageItems) => {
		navigateByLink(item.linkUrl)
	}

	onMounted(() => {
		void getPromoSections()
	})
</script>

<style lang="scss" scoped>
	.container {
		display: flex;
		flex-direction: column;
		gap: $space-3;
		margin: $space-1 0;
	}

	.section {
		display: grid;
		gap: $space-2;
		padding: 0 $space-3;

		&.single {
			grid-template-columns: 1fr;
		}

		&.double {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		// 左侧一张大图占两行，右侧上下两张小图
		&.triple {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			grid-template-rows: repeat(2, minmax(0, 1fr));

			.item:first-child {
				grid-row: 1 / 3;
			}
		}
	}

	.item {
		display: block;
		min-width: 0;
		overflow: hidden;
		border-radius: $radius-2;

		image {
			display: block;
			width: 100%;
			height: auto;
		}
	}
</style>
