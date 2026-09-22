<template>
	<view>
		<view class="placeholder"></view>

		<view class="action-bar">
			<view class="bar-icons">
				<view class="icon-item">
					<image src="/static/images/bar-service.png" mode="widthFix" class="icon"></image>
					<view>客服</view>
				</view>
				<view class="icon-item" @click="uni.switchTab({url: '/pages/cart/index'})">
					<image src="/static/images/bar-cart.png" mode="widthFix" class="icon"></image>
					<view>购物车</view>
				</view>
			</view>
			<view class="action-btns">
				<view class="btn" @click="handleBtnClick('cart')">加入购物车</view>
				<view class="btn" @click="handleBtnClick('buy')">立即购买</view>
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
	export type actionType = "cart" | "buy"

	const emit = defineEmits(["onClick"])

	const handleBtnClick = (type: actionType) => {
		emit("onClick", type)
	}
</script>

<style lang="scss" scoped>
	.action-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 100rpx;
		padding: 0 $space-3;
		display: flex;
		align-items: center;
		gap: $space-4;
		background-color: #fff;
		border-top: 1px solid $color-border;
		z-index: 9;
	}

	.bar-icons {
		display: flex;
		gap: $space-4;

		.icon-item {
			text-align: center;
			font-size: 24rpx;

			.icon {
				width: 36rpx;
			}
		}
	}

	.action-btns {
		flex: 1;
		display: flex;
		border-radius: 99px;
		overflow: hidden;

		.btn {
			flex: 1;
			height: 80rpx;
			line-height: 80rpx;
			text-align: center;
			color: #fff;

			&:nth-child(1) {
				background-color: $color-danger;
			}

			&:nth-child(2) {
				background-color: $color-primary;
			}
		}
	}

	.placeholder {
		height: 100rpx;
	}
</style>
