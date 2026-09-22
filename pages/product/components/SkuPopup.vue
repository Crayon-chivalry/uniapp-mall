<template>
	<up-popup :show="visible" mode="bottom" :safeAreaInsetBottom="true" :closeOnClickOverlay="true" @close="onClose">
		<view class="sku-popup">
			<!-- 头部：图片 / 价格 / 库存 / 已选 -->
			<view class="header">
				<image class="cover" :src="cover" mode="aspectFill"></image>
				<view class="info">
					<view class="price">￥<text>{{ price }}</text></view>
					<view class="stock">库存 {{ stock }}</view>
					<view v-if="isMultiSpec" class="selected">已选：{{ selectedText || "请选择规格" }}</view>
				</view>
				<view class="close" @tap="onClose">
					<up-icon name="close" size="16" color="#8B8D8C"></up-icon>
				</view>
			</view>

			<!-- 规格选择 + 数量（单规格商品只渲染数量） -->
			<view class="body">
				<template v-if="isMultiSpec">
					<view v-for="group in specGroups" :key="group.name" class="group">
						<view class="group-name">{{ group.name }}</view>
						<view class="options">
							<view
								v-for="value in group.values"
								:key="value"
								class="option"
								:class="{
									active: selected[group.name] === value,
									disabled: !isValueAvailable(group.name, value)
								}"
								@tap="handleSelect(group.name, value)"
							>
								{{ value }}
							</view>
						</view>
					</view>
				</template>

				<!-- 数量选择 -->
				<view class="group quantity-group">
					<view class="group-name">数量</view>
					<up-number-box :min="1" :max="stock || 1" v-model="quantity"></up-number-box>
				</view>
			</view>

			<!-- 确认按钮 -->
			<view class="footer">
				<view class="confirm" :class="mode === 'cart' ? 'confirm-cart' : 'confirm-buy'" @tap="handleConfirm">
					{{ mode === "cart" ? "加入购物车" : "立即购买" }}
				</view>
			</view>
		</view>
	</up-popup>
</template>

<script lang="ts" setup>
	import { ref, computed, watch } from "vue"

	import type { ProductItem, SkuItem } from "@/api/types"

	interface Props {
		visible: boolean
		goods: ProductItem | null
		/** 弹窗模式：cart=加入购物车 buy=立即购买（控制确认按钮文案和颜色） */
		mode?: "cart" | "buy"
	}

	const props = withDefaults(defineProps<Props>(), { mode: "cart" })

	const emit = defineEmits<{
		(e: "update:visible", value: boolean): void
		(e: "confirm", sku: SkuItem, quantity: number): void
	}>()

	// 已选规格 { 规格名: 规格值 }
	const selected = ref<Record<string, string>>({})
	const quantity = ref(1)

	// 从 skus 中提取规格分组：[{ name: "颜色", values: ["红色", "蓝色"] }]
	// 过滤空规格（单规格商品的 specs 可能为 [{ name: "", value: "" }]）
	const specGroups = computed(() => {
		if (!props.goods) return []
		const map = new Map<string, string[]>()
		props.goods.skus.forEach((sku) => {
			sku.specs
				.filter((spec) => spec.name && spec.value)
				.forEach((spec) => {
					const values = map.get(spec.name) ?? []
					if (!values.includes(spec.value)) {
						values.push(spec.value)
						map.set(spec.name, values)
					}
				})
		})
		return Array.from(map, ([name, values]) => ({ name, values }))
	})

	// 是否多规格商品
	const isMultiSpec = computed(() => specGroups.value.length > 0)

	// 是否已选完所有规格
	const isComplete = computed(() => specGroups.value.every((group) => selected.value[group.name]))

	// 判断某规格值在当前其他维度的选择下是否存在对应 SKU
	// 用待测值替换该维度，其余维度保持当前选择
	const isValueAvailable = (name: string, value: string) => {
		if (!props.goods) return false
		const candidate = { ...selected.value, [name]: value }
		return props.goods.skus.some((sku) =>
			specGroups.value.every((group) =>
				sku.specs.some(
					(spec) => spec.name === group.name && spec.value === candidate[group.name]
				)
			)
		)
	}

	// 当前选中的 SKU（未选完时为 null，单规格商品取默认 SKU）
	const currentSku = computed<SkuItem | null>(() => {
		if (!props.goods || !isComplete.value) return null
		if (!isMultiSpec.value) {
			return props.goods.skus.find((sku) => sku.isDefault) ?? props.goods.skus[0] ?? null
		}
		return (
			props.goods.skus.find((sku) =>
				specGroups.value.every((group) =>
					sku.specs.some(
						(spec) => spec.name === group.name && spec.value === selected.value[group.name]
					)
				)
			) ?? null
		)
	})

	// 展示信息：选完规格后取 SKU 信息，否则取商品默认信息
	const price = computed(() => currentSku.value?.price ?? props.goods?.price ?? "")
	const stock = computed(() => currentSku.value?.stock ?? props.goods?.stock ?? 0)
	const cover = computed(() => currentSku.value?.cover ?? props.goods?.cover ?? "")
	const selectedText = computed(() =>
		specGroups.value
			.map((group) => selected.value[group.name])
			.filter(Boolean)
			.join(" / ")
	)

	// 弹窗每次打开时重置选择状态（多规格商品默认选中每组第一个规格）
	watch(
		() => props.visible,
		(visible) => {
			if (!visible) return
			const defaultSelected: Record<string, string> = {}
			specGroups.value.forEach((group) => {
				defaultSelected[group.name] = group.values[0]
			})
			selected.value = defaultSelected
			quantity.value = 1
		}
	)

	const handleSelect = (name: string, value: string) => {
		if (!isValueAvailable(name, value)) return
		selected.value = { ...selected.value, [name]: value }
	}

	const handleConfirm = () => {
		if (!currentSku.value) {
			// 提示未选完的规格
			const missing = specGroups.value
				.filter((group) => !selected.value[group.name])
				.map((group) => group.name)
			uni.showToast({
				title: missing.length ? `请选择${missing.join("、")}` : "该商品暂无可用规格",
				icon: "none",
			})
			return
		}
		emit("confirm", currentSku.value, quantity.value)
	}

	const onClose = () => {
		emit("update:visible", false)
	}
</script>

<style lang="scss" scoped>
	.sku-popup {
		max-height: 70vh;
		display: flex;
		flex-direction: column;
		background-color: #fff;
		border-radius: 24rpx 24rpx 0 0;
		overflow: hidden;
	}

	.header {
		position: relative;
		display: flex;
		gap: $space-3;
		padding: $space-4 $space-3;

		.cover {
			width: 180rpx;
			height: 180rpx;
			border-radius: $radius-2;
		}

		.info {
			flex: 1;
			min-width: 0;
			display: flex;
			flex-direction: column;
			gap: $space-1;
			justify-content: center;
		}

		.price {
			color: $color-primary;

			text {
				font-size: 42rpx;
				font-weight: 600;
			}
		}

		.stock,
		.selected {
			font-size: 24rpx;
			color: $color-text-secondary;
		}

		.close {
			position: absolute;
			top: $space-3;
			right: $space-3;
			width: 48rpx;
			height: 48rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			color: $color-text-secondary;
		}
	}

	.body {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		padding: 0 $space-3 $space-3;
	}

	.group {
		margin-top: $space-4;

		.group-name {
			font-size: 28rpx;
			font-weight: 600;
			margin-bottom: $space-3;
		}

		.options {
			display: flex;
			flex-wrap: wrap;
			gap: $space-2;

			.option {
				padding: $space-1 $space-3;
				font-size: 26rpx;
				color: $color-text;
				background-color: #F5F5F5;
				border: 1px solid transparent;
				border-radius: 99px;

				&.active {
					color: $color-primary;
					border-color: $color-primary;
					background-color: rgba(230, 30, 30, 0.05);
				}

				// 组合不存在对应 SKU 时置灰不可点
				&.disabled {
					color: #C0C4CC;
					background-color: #F7F8FA;
					opacity: 0.7;
				}
			}
		}
	}

	// 数量选择行：标题与步进器两端对齐
	.quantity-group {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-bottom: $space-4;

		.group-name {
			margin-bottom: 0;
		}
	}

	.footer {
		padding: $space-3;
		border-top: 1px solid $color-border;

		.confirm {
			height: 80rpx;
			line-height: 80rpx;
			text-align: center;
			font-size: 30rpx;
			font-weight: 600;
			color: #fff;
			border-radius: 99px;

			// 加入购物车：黄色（与 ActionBar 第一个按钮一致）
			&.confirm-cart {
				background-color: $color-danger;
			}

			// 立即购买：主题色
			&.confirm-buy {
				background-color: $color-primary;
			}
		}
	}
</style>
