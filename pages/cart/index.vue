<template>
	<view>
		<up-navbar title="购物车" leftIcon="" placeholder>
			<template #right>
				<view @click="isEdit = !isEdit">{{ isEdit ? "完成" : "编辑" }}</view>
			</template>
		</up-navbar>

		<!-- 商品 -->
		<view class="goods">
			<up-swipe-action class="swipe-action">
				<up-swipe-action-item :options="actionOptions" v-for="(item, index) in cartList" :key="item.id" :name="index"
					@click="() => removeCartItem(item.product.id, item.sku.id)">
					<view class="goods-item" @click="navigateByLink('/pages/product/detail?id=' + item.product.id)">
						<up-checkbox-group @change="() => toggleCartItemChecked(item.product.id, item.sku.id)">
							<up-checkbox :checked="item.checked" activeColor="#DD261C"></up-checkbox>
						</up-checkbox-group>
						<view class="goods-cover">
							<image :src="item.sku.cover || item.product.cover" />
						</view>
						<view class="goods-content">
							<view>
								<view class="goods-name">
									{{ item.product.name }}
								</view>
								<view class="goods-label">
									{{ formatSpecsLabel(item.sku.specs) }}
								</view>
							</view>
							<view class="goods-cell">
								<view class="goods-price">
									￥{{ item.sku.price }}
								</view>
								<view>
									<up-number-box v-model="item.quantity" :max="item.product.stock"
										@change="(quantity) => updateCartItemQuantity(item.product.id, item.sku.id, quantity.value)"></up-number-box>
								</view>
							</view>
						</view>
					</view>
				</up-swipe-action-item>
			</up-swipe-action>
			<empty text="购物车空空如也" v-if="cartList.length === 0" />
		</view>

		<!-- 动作栏 -->
		<div class="submit-bar">
			<div class="submit-left">
				<up-checkbox-group @change="() => setAllCartItemsChecked(!allChecked)">
					<up-checkbox :checked="allChecked" activeColor="#DD261C"></up-checkbox>
				</up-checkbox-group>
				<span>全选</span>
			</div>
			<div class="submit-content">
				<div class="submit-btn" @click="handleDeleteChecked" v-if="isEdit">
					删除
				</div>
				<template v-else>
					<div>
						合计：
						<span class="submit-amount">
							￥{{ totalAmount.toFixed(2) }}
						</span>
					</div>
					<div class="submit-btn" @click="submit">
						去结算({{ checkedItemCount }})
					</div>
				</template>
			</div>
		</div>
	</view>
</template>

<script lang="ts" setup>
import { onLoad } from '@dcloudio/uni-app';
import { computed, ref } from 'vue';

import { useCartStore } from '@/store/modules/cartStore';
import { formatSpecsLabel, navigateByLink } from '@/utils';
import Empty from '@/components/Empty.vue';

const {
	cartList,
	fetchCartList,
	toggleCartItemChecked,
	setAllCartItemsChecked,
	updateCartItemQuantity,
	removeCartItem,
	removeCartItems,
	setCheckoutItems
} = useCartStore()

const isEdit = ref<boolean>(false)
// 是否全选
const allChecked = computed(() => {
	return cartList.value.length > 0 && cartList.value.every((item) => item.checked);
})
// 计算合计
const totalAmount = computed(() => {
	return cartList.value
		.filter((item) => item.checked)
		.reduce(
			(total, item) => total + Number(item.sku.price) * item.quantity,
			0,
		);
})
// 勾选商品数量
const checkedItemCount = computed(() => {
	return cartList.value.filter((item) => item.checked).length;
})

// 滑动菜单配置
const actionOptions = [{
	text: '删除',
	style: {
		backgroundColor: '#DD261C',
	}
}]

// 批量删除
const handleDeleteChecked = () => {
	removeCartItems(
		cartList.value
			.filter((item) => item.checked)
			.map((item) => ({
				productId: item.product.id,
				skuId: item.sku.id,
			})),
	);
	isEdit.value = false
}

const submit = () => {
	const checkoutItems = cartList.value.filter((item) => item.checked)
	if(!checkoutItems.length) {
		uni.showToast({
			title: "请选择要下单的商品",
			icon: "none"
		})
		return
	}
	setCheckoutItems(checkoutItems);
	uni.navigateTo({url: '/pages/order/confirm'})
}

onLoad(() => {
	void fetchCartList()
})
</script>

<style lang="scss" scoped>
.goods {
	margin-top: $space-2;
	// @include flex-column($space-2);

	.goods-item {
		display: flex;
		gap: $space-3;
		padding: $space-2;
		background-color: #fff;
	}
}

.goods-cover {
	width: 80px;
	height: 80px;

	image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
}

.goods-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;

	.goods-name {
		@include text-hidden(2)
	}

	.goods-label {
		margin-top: $space-2;
		color: $color-text-secondary;
		font-size: 12px;
	}

	.goods-cell {
		@include flex-between;
	}

	.goods-price {
		color: #e02020;
	}
}

.submit-bar {
	position: absolute;
	left: 50%;
	width: min(100%, 480px);
	transform: translateX(-50%);
	bottom: 0;
	padding: $space-2 $space-3;
	@include flex-between;
	background-color: #fff;
	box-sizing: border-box;
	box-shadow: 0 -1px 0 $color-border inset;

	.submit-left {
		display: flex;
		align-items: center;
		gap: $space-2;
	}

	.submit-content {
		display: flex;
		align-items: center;
		gap: $space-3;
	}

	.submit-amount {
		font-size: 16px;
		font-weight: bold;
		color: $color-primary;
	}

	.submit-btn {
		padding: $space-2 + 2 0;
		width: 100px;
		color: #fff;
		text-align: center;
		border-radius: $radius-2;
		background-color: $color-primary;
	}
}

.swipe-action {
	@include flex-column($space-2);
}
</style>
