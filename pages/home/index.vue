<template>
	<view class="home">
		<!-- 顶部半弧背景：垫在搜索框和轮播图上半部下面 -->
		<view class="top-arc"></view>

		<view class="search">
			<up-search placeholder="搜索关键词" :disabled="true" :showAction="false"></up-search>
		</view>

		<!-- 轮播图 -->
		<up-swiper class="banner" keyName="imageUrl" height="140" indicator :list="bannerList"></up-swiper>

		<!-- 金刚区：每页 10 个（2 行 x 5 列），横向翻页 -->
		<view class="entries-wrap">
			<up-scroll-list :indicator="entryPages.length > 1" indicatorColor="#fff0f0" indicator-active-color="#DD261C">
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

		<!-- 商品列表 -->
		<ProductWaterfall v-model="productList" />
	</view>
</template>

<script lang="ts" setup>
	import { ref, computed } from "vue"
	import { onLoad } from "@dcloudio/uni-app"

	import { contentApi } from "@/api/contentApi"
	import { shopApi } from "@/api/shopApi"
	import type { BannerItem, EntriesItem, ProductItem } from "@/api/types"
	import PromoSections from "./components/PromoSections.vue"
	import ProductWaterfall from "@/components/ProductWaterfall.vue"

	const bannerList = ref<BannerItem[]>([])
	const entries = ref<EntriesItem[]>([])
	const productList = ref<ProductItem[]>([])

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

	// 获取商品
	const getProduct = async () => {
		const { data } = await shopApi.productList({
			page: 1,
			pageSize: 10
		})
		productList.value = data.list
		console.log(data)
	}

	onLoad(() => {
		void getBanners()
		void getEntries()
		void getProduct()
	})
</script>

<style lang="scss" scoped>
	.home {
		position: relative;
	}

	// 顶部半弧背景：绝对定位垫底，高度 ≈ 搜索框 + 轮播图一半
	.top-arc {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 300rpx;
		background: linear-gradient(180deg, #FF6A45 0%, $color-primary 100%);
		border-radius: 0 0 50% 50% / 0 0 60rpx 60rpx;
	}

	// 内容叠在弧形背景之上
	.search,
	.banner {
		position: relative;
		z-index: 1;
	}

	.search {
		padding: $space-3;
	}

	.banner {
		margin: 0 $space-3;
	}

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
				padding: $space-2 0;
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

		:deep(.u-scroll-list__indicator) {
			margin-top: $space-2;
		}
	}
</style>
