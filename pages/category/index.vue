<template>
	<view>
		<view class="search">
			<up-search placeholder="搜索关键词" :disabled="true" :showAction="false" bgColor="#F2F2F2"></up-search>
		</view>

		<up-cate-tab class="cate-tab" :tabList="list">
			<template #pageItem="{pageItem}">
				<view class="item">
					<up-icon :customStyle="{paddingTop:20+'rpx'}" :name="pageItem.icon" :size="40"></up-icon>
					<text class="grid-text">{{pageItem.name}}</text>
				</view>
			</template>
		</up-cate-tab>
	</view>
</template>

<script lang="ts" setup>
	import { ref } from "vue"
	import { onLoad } from "@dcloudio/uni-app"

	import { shopApi } from "@/api/shopApi"
	import type { CategoriesItem } from "@/api/types"

	const list = ref<CategoriesItem[]>([])

	const getCategory = async () => {
		const { data } = await shopApi.categories({ page: 1, pageSize: 100 })
		list.value = data.list.map(item => {
			return {
				...item,
				title: item.name
			}
		})
	}

	onLoad(() => {
		void getCategory()
	})
</script>

<style lang="scss" scoped>
	.search {
		padding: $space-3;
		background-color: #fff;
	}

	.cate-tab {
		height: calc(100vh - 108px) !important;
		/* #ifdef H5 */
		height: calc(100vh - 108px - var(--window-top)) !important;
		/* #endif */

		:deep(.item-container) {
				display: grid;
				grid-template-columns: repeat(3, 1fr);
		}

		.item {
			@include flex-center;
			flex-direction: column;
			font-size: 26rpx;
			text-align: center;
		}
	}
</style>
