<template>
	<view>
		<up-swiper keyName="imageUrl" height="160" indicator :list="bannerList"></up-swiper>

		<!-- 金刚区：每页 10 个（2 行 x 5 列），横向翻页 -->
		<view class="entries-wrap">
			<up-scroll-list :indicator="entryPages.length > 1" indicator-active-color="#DD261C">
				<view class="entries-page" v-for="(page, pageIndex) in entryPages" :key="pageIndex">
					<view v-for="item in page" :key="item.id" class="entries-item">
						<image :src="item.iconUrl" class="entries-icon" mode="aspectFill"></image>
						<view class="entries-title">{{ item.title }}</view>
					</view>
				</view>
			</up-scroll-list>
		</view>

		<!-- 活动区 -->
		<PromoSections />
	</view>
</template>

<script lang="ts" setup>
	import { ref, computed } from "vue"
	import { onLoad } from "@dcloudio/uni-app"

	import { contentApi } from "@/api/contentApi"
	import type { BannerItem, EntriesItem } from "@/api/types"
	import PromoSections from "./components/PromoSections.vue"

	const bannerList = ref<BannerItem[]>([])
	const entries = ref<EntriesItem[]>([])

	// 金刚区分页：每页 10 个（2 行 x 5 列）
	const ENTRIES_PAGE_SIZE = 10
	const entryPages = computed<EntriesItem[][]>(() => {
		const pages : EntriesItem[][] = []
		for (let i = 0; i < entries.value.length; i += ENTRIES_PAGE_SIZE) {
			pages.push(entries.value.slice(i, i + ENTRIES_PAGE_SIZE))
		}
		return pages
	})

	// 获取轮播图
	const getBanners = async () => {
		const { data } = await contentApi.banners()
		bannerList.value = data
	}

	// 获取金刚区
	const getEntries = async () => {
		const { data } = await contentApi.homeEntries();
		entries.value = data
	}

	onLoad(() => {
		void getBanners()
		void getEntries()
	})
</script>

<style lang="scss" scoped>
	.entries-wrap {

		/* #ifdef H5 */
		// 松手吸附到整页，还原 swiper 的翻页手感
		:deep(.u-scroll-list .uni-scroll-view) {
			scroll-snap-type: x mandatory;
		}

		/* #endif */

		.entries-page {
			width: 750rpx; // 一页 = 一屏宽
			flex-shrink: 0;
			display: flex;
			flex-wrap: wrap;
			padding: 20rpx 0 10rpx;

			/* #ifdef H5 */
			scroll-snap-align: start;
			/* #endif */

			.entries-item {
				width: 20%; // 每行 5 个
				display: flex;
				flex-direction: column;
				align-items: center;
				padding: 20rpx 0;
			}
		}

		.entries-icon {
			width: 88rpx;
			height: 88rpx;
		}

		.entries-title {
			margin-top: 12rpx;
			font-size: 24rpx;
			color: $color-text;
		}
	}
</style>
