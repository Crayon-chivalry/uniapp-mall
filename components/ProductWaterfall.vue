<template>
	<view class="waterfall">
		<up-waterfall v-model="list" columns="2">
			<template v-slot:column="{ colList, colIndex }">
				<view v-for="(item, index) in colList" :key="index" class="product" @click="hanleClick(item.id)">
					<image :src="item.cover" mode="widthFix" class="cover"></image>
					<view class="content">
						<view>{{ item.name }}</view>
						<view class="col">
							<view class="price">￥<text>{{ item.price }}</text></view>
							<view class="sales">已售{{ item.sales }}</view>
						</view>
					</view>
				</view>
			</template>
		</up-waterfall>

		<up-loadmore v-if="list.length" :status="loadmoreStatus" />

		<empty v-if="list.length === 0" />
	</view>
</template>

<script lang="ts" setup>
import type { ProductItem } from "@/api/types"
import Empty from "./Empty.vue";

type LoadmoreStatus = "loadmore" | "loading" | "nomore"

const porps = defineProps<{ loadmoreStatus: LoadmoreStatus }>()

const list = defineModel<ProductItem[]>({ required: true })

// 商品点击跳转详情
const hanleClick = (id: number) => {
	uni.navigateTo({
		url: "/pages/product/detail?id=" + id
	})
}
</script>

<style lang="scss" scoped>
.waterfall {
	padding: $space-2;
}

.product {
	margin: 10rpx 6rpx;
	border-radius: $radius-3;
	background-color: #fff;

	.cover {
		display: block;
		width: 100%;
		border-radius: $radius-3;
	}

	.content {
		padding: $space-2;

		.col {
			@include flex-between;
			margin-top: $space-1;
		}

		.name {
			@include text-hidden(2);
		}

		.price {
			color: $color-primary;
			font-weight: bold;

			text {
				font-size: 32rpx;
			}
		}

		.sales {
			color: $color-text-secondary;
			font-size: 24rpx;
		}
	}
}
</style>
