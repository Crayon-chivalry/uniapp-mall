import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";
import userStore from "./modules/userStore";

// 需要持久化的模块（白名单，新增模块按需加入）
const PERSIST_PATHS = ["userStore"];

const store = createStore({
	modules: { userStore },
	plugins: [
		// 持久化：H5 下 localStorage 可用，但小程序/App 没有，storage 统一适配为 uni 的同步缓存
		createPersistedState({
			key: "user-storage",
			paths: PERSIST_PATHS,
			storage: {
				getItem: (key) => uni.getStorageSync(key),
				setItem: (key, value) => uni.setStorageSync(key, value),
				removeItem: (key) => uni.removeStorageSync(key),
			},
		}),
	],
});

export default store;
