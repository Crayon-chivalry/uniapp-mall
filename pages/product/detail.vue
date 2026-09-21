<template>
	<view>
		<up-navbar title="详情" placeholder :autoBack="true">
		</up-navbar>

		<template v-if="product">
			<up-swiper height="375" indicator :list="product.images" @click="previewImage"></up-swiper>

			<view class="info">
				<view class="col">
					<view class="price">￥<text>{{ product.price }}</text></view>
					<view class="sales">已售{{ product.sales }}</view>
				</view>
				<view class="name">{{ product.name }} {{ product.description }}</view>
			</view>

			<view class="details">
				<view class="details-title">商品详情</view>
				<up-parse :content="product.detailContent"></up-parse>
			</view>
		</template>
	</view>
</template>

<script lang="ts" setup>
	import { ref } from 'vue';
	import { onLoad } from "@dcloudio/uni-app"

	import type { ProductItem } from "@/api/types"
	import { shopApi } from '../../api/shopApi';

	const productId = ref("")
	const product = ref<ProductItem | null>(null)


	// 预览图片
	const previewImage = (current : number) => {
		uni.previewImage({
			urls: product.value.images,
			current
		});
	}

	// 获取商品详情
	const getProduct = async () => {
		const { data } = await shopApi.product(Number(productId.value))
		console.log(data)
		product.value = data
	}

	onLoad((e) => {
		productId.value = e.id
		void getProduct()
	})
</script>

<style lang="scss" scoped>
	.info {
		padding: $space-3;
		background-color: #fff;

		.col {
			@include flex-between;

			.price {
				color: $color-primary;

				text {
					font-size: 42rpx;
					font-weight: 600;
				}
			}

			.sales {
				color: $color-text-secondary;
			}
		}

		.name {
			margin-top: $space-3;
			font-size: 32rpx;
			font-weight: 600;
		}
	}

	.details {
	  margin-top: $space-3;
	  background-color: #fff;

	  .details-title {
	    padding: $space-3;
	    border-bottom: 1px solid $color-border;
	  }
	}
</style>
