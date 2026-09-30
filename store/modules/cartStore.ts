import { computed } from "vue";
import { useStore, type Module } from "vuex";

import { shopApi } from "@/api/shopApi";
import type { CartItem, ProductItem, SkuItem } from "@/api/types";

// 购物车项：服务端结构 + 本地选中态（checked 仅存前端，不回传后端）
export type CartStoreItem = CartItem & { checked: boolean };

export interface CartState {
	cartList: CartStoreItem[];
	// 待结算商品（购物车勾选后带入确认订单页）
	checkoutItems: CartStoreItem[];
}

// 服务端列表可能是数组或 { items } / { list } 包裹结构，统一取出数组
function extractCartList(payload: any): CartItem[] {
	if (Array.isArray(payload)) return payload;
	if (Array.isArray(payload?.items)) return payload.items;
	if (Array.isArray(payload?.list)) return payload.list;
	return [];
}

// 服务端项 → 本地购物车项，默认不选
function normalizeCartItem(item: CartItem): CartStoreItem {
	return { ...item, checked: false };
}

// 按 商品id + skuId 定位购物车项
function findItem(state: CartState, productId: number, skuId: number) {
	return state.cartList.find(
		(item) => item.product.id === productId && item.sku.id === skuId
	);
}

// 购物车模块：列表 + 选中态 + 待结算商品
// 持久化由 store/index.ts 的 vuex-persistedstate 统一处理，模块只管状态本身
const cartStore: Module<CartState, any> = {
	namespaced: true,
	state: (): CartState => ({
		cartList: [],
		checkoutItems: [],
	}),
	mutations: {
		setCartList(state, list: CartStoreItem[]) {
			state.cartList = list;
		},
		setCheckoutItems(state, items: CartStoreItem[]) {
			state.checkoutItems = items;
		},
		// 设置指定购物车项的选中状态
		setItemChecked(
			state,
			payload: { productId: number; skuId: number; checked: boolean }
		) {
			const target = findItem(state, payload.productId, payload.skuId);
			if (target) target.checked = payload.checked;
		},
		// 切换指定购物车项的选中状态
		toggleItemChecked(state, payload: { productId: number; skuId: number }) {
			const target = findItem(state, payload.productId, payload.skuId);
			if (target) target.checked = !target.checked;
		},
		// 设置全部购物车项的选中状态
		setAllChecked(state, checked: boolean) {
			state.cartList.forEach((item) => {
				item.checked = checked;
			});
		},
		// 更新数量，限制在 [1, 库存] 范围内；库存为 0 时移除该项
		updateItemQuantity(
			state,
			payload: { productId: number; skuId: number; quantity: number }
		) {
			const target = findItem(state, payload.productId, payload.skuId);
			if (!target) return;

			const quantity = Math.min(
				Math.max(payload.quantity, 1),
				target.sku.stock
			);
			if (quantity <= 0) {
				state.cartList = state.cartList.filter((item) => item !== target);
			} else {
				target.quantity = quantity;
			}
		},
		// 移除指定购物车项
		removeItem(state, payload: { productId: number; skuId: number }) {
			state.cartList = state.cartList.filter(
				(item) =>
					item.product.id !== payload.productId ||
					item.sku.id !== payload.skuId
			);
		},
		// 批量移除（结算成功后清空对应项）
		removeItems(
			state,
			items: Array<{ productId: number; skuId: number }>
		) {
			state.cartList = state.cartList.filter(
				(cartItem) =>
					!items.some(
						({ productId, skuId }) =>
							cartItem.product.id === productId &&
							cartItem.sku.id === skuId
					)
			);
		},
	},
	actions: {
		// 拉取后端购物车列表
		async fetchCartList({ commit }) {
			const res = await shopApi.carts();
			const list = extractCartList(res.data);
			commit("setCartList", list.map(normalizeCartItem));
		},
		// 添加购物车项；新增后重新拉取后端最新列表
		async addCartItem(
			{ dispatch },
			payload: { product: ProductItem; sku: SkuItem; quantity?: number }
		) {
			const { product, sku, quantity = 1 } = payload;
			await shopApi.addCarts({
				productId: product.id,
				skuId: sku.id,
				quantity,
			});
			await dispatch("fetchCartList");
		},
		// 删除指定商品和 SKU 的购物车项
		async removeCartItem(
			{ state, commit },
			payload: { productId: number; skuId: number }
		) {
			const targetItem = findItem(state, payload.productId, payload.skuId);
			if (targetItem) {
				await shopApi.removeCarts([targetItem.id]);
			}
			commit("removeItem", payload);
		},
		// 批量删除已成功结算的购物车项
		async removeCartItems(
			{ state, commit },
			items: Array<{ productId: number; skuId: number }>
		) {
			const itemIds = state.cartList
				.filter((cartItem) =>
					items.some(
						({ productId, skuId }) =>
							cartItem.product.id === productId &&
							cartItem.sku.id === skuId
					)
				)
				.map((item) => item.id);

			if (itemIds.length > 0) {
				await shopApi.removeCarts(itemIds);
			}
			commit("removeItems", items);
		},
		// 更新指定购物车项的数量，数量会限制在库存范围内
		async updateCartItemQuantity(
			{ state, commit },
			payload: { productId: number; skuId: number; quantity: number }
		) {
			const targetItem = findItem(state, payload.productId, payload.skuId);
			if (targetItem) {
				await shopApi.updateCartsQuantity(targetItem.id, payload.quantity);
			}
			commit("updateItemQuantity", payload);
		},
	},
};

// 组合式 API：页面里 const { cartList, addCartItem } = useCartStore()
// 返回的 state 是 computed，模板中自动解包，脚本中需要 .value
export function useCartStore() {
	const store = useStore();
	return {
		// store 未做模块类型标注，state 为 any，需显式标注以获得类型推断
		cartList: computed<CartStoreItem[]>(() => store.state.cartStore.cartList),
		checkoutItems: computed<CartStoreItem[]>(
			() => store.state.cartStore.checkoutItems
		),
		// 拉取后端购物车列表
		fetchCartList: () => store.dispatch("cartStore/fetchCartList"),
		// 添加购物车项；新增后重新拉取后端最新列表
		addCartItem: (product: ProductItem, sku: SkuItem, quantity = 1) =>
			store.dispatch("cartStore/addCartItem", { product, sku, quantity }),
		// 设置待确认订单的商品
		setCheckoutItems: (items: CartStoreItem[]) =>
			store.commit("cartStore/setCheckoutItems", items),
		// 删除指定商品和 SKU 的购物车项
		removeCartItem: (productId: number, skuId: number) =>
			store.dispatch("cartStore/removeCartItem", { productId, skuId }),
		// 批量删除已成功结算的购物车项
		removeCartItems: (items: Array<{ productId: number; skuId: number }>) =>
			store.dispatch("cartStore/removeCartItems", items),
		// 设置指定购物车项的选中状态
		setCartItemChecked: (productId: number, skuId: number, checked: boolean) =>
			store.commit("cartStore/setItemChecked", { productId, skuId, checked }),
		// 切换指定购物车项的选中状态
		toggleCartItemChecked: (productId: number, skuId: number) =>
			store.commit("cartStore/toggleItemChecked", { productId, skuId }),
		// 设置全部购物车项的选中状态
		setAllCartItemsChecked: (checked: boolean) =>
			store.commit("cartStore/setAllChecked", checked),
		// 更新指定购物车项的数量，数量会限制在库存范围内
		updateCartItemQuantity: (productId: number, skuId: number, quantity: number) =>
			store.dispatch("cartStore/updateCartItemQuantity", { productId, skuId, quantity }),
	};
}

export default cartStore;
