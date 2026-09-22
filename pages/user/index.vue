<template>
	<view>
		<!-- 个人信息 -->
		<view class="profile">
			<view class="profile-row">
				<up-avatar :src="src" :size="60"></up-avatar>
				<view>
					<view class="name">用户名称</view>
					<view class="phone">14152526363</view>
				</view>
			</view>
			<view class="edit">
				<up-icon name="edit-pen"></up-icon>
				编辑资料
			</view>
		</view>

		<view class="cards">
			<!-- 订单 -->
			<view class="card">
				<view class="card-header">
					<view class="card-title">我的订单</view>
					<view class="more">
						<text>查看全部</text>
						<up-icon name="arrow-right" size="14"></up-icon>
					</view>
				</view>
				<up-divider></up-divider>
				<view class="order">
					<view class="order-item" v-for="item in orderItems" :key="item.status">
						<image :src="item.icon" mode="widthFix" class="order-image"></image>
						<view>{{ item.name }}</view>
					</view>
				</view>
			</view>
			<!-- 功能服务 -->
			<view class="card actions">
				<view class="cell" v-for="(item, index) in actionsItems" :key="index">
					<view class="cell-row">
						<image :src="item.icon" mode="widthFix" class="cell-icon"></image>
						<view>{{ item.name }}</view>
					</view>
					<up-icon name="arrow-right"></up-icon>
				</view>
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
	import type { OrderStatus } from "@/api/types";

	interface OrderItem {
		name : string;
		icon : string;
		status : OrderStatus;
	}

	const orderItems : OrderItem[] = [
		{ name: "待付款", icon: "/static/images/order1.png", status: "pending" },
		{ name: "待发货", icon: "/static/images/order2.png", status: "paid" },
		{ name: "待收货", icon: "/static/images/order3.png", status: "shipped" },
		{ name: "已完成", icon: "/static/images/order4.png", status: "completed" }
	];

	const actionsItems = [
		{
			name: "地址管理",
			icon: "/static/images/address.png",
			path: "/address",
		},
		{ name: "客服中心", icon: "/static/images/service.png", path: "" },
		{ name: "设置", icon: "/static/images/settings.png", path: "/settings" },
	]
</script>

<style lang="scss" scoped>
	.profile {
		@include flex-between;
		padding: $space-1 * 8 $space-4;
		background: linear-gradient(180deg, #FDE9E7 0%, rgba(253, 233, 231, 0) 100%);

		.profile-row {
			display: flex;
			align-items: center;
			gap: $space-3;

			.name {
				font-weight: 600;
				font-size: 36rpx;
			}

			.phone {
				margin-top: $space-1;
				font-size: 24rpx;
			}
		}

		.edit {
			display: flex;
			align-items: center;
			font-size: 24rpx;
		}
	}

	.cards {
		@include flex-column($space-4);
		padding: 0 $space-3;
	}

	.card {
		padding: $space-3;
		border-radius: $radius-3;
		background-color: #fff;

		.card-header {
			// margin-bottom: $space-3;
			@include flex-between;

			.card-title {
				font-size: 32rpx;
				font-weight: 600;
			}

			.more {
				display: flex;
				align-items: center;
				color: $color-text-secondary;
				font-size: 24rpx;

				// 图标字体的字形在 em 框内天然偏上，flex 只能居中盒子，这里做 2rpx 视觉校正
				:deep(.u-icon) {
					transform: translateY(3rpx);
				}
			}
		}
	}

	.order {
		display: flex;
		text-align: center;
		font-size: 24rpx;

		.order-item {
			flex: 1;
		}

		.order-image {
			margin-bottom: $space-1;
			width: 60rpx;
		}
	}

	.actions {
		padding: 0 $space-3;

		.cell {
			@include flex-between;
			padding: $space-3 0;
			font-size: 24rpx;
			border-bottom: 1px solid $color-border;

			.cell-row {
				display: flex;
				align-items: center;
				gap: $space-1;

				.cell-icon {
					width: 48rpx;
				}
			}
		}
	}
</style>
