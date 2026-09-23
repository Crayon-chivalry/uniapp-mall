import { computed } from "vue";
import { useStore, type Module } from "vuex";

// 用户信息
export interface UserData {
	userId: string;
	phone: string | number;
	id: number;
	nickname: string;
	avatar?: string;
}

export interface UserState {
	token: string | null;
	user: UserData | null;
	isLoggedIn: boolean;
}

// 用户模块：登录态 + 用户信息
// 持久化由 store/index.ts 的 vuex-persistedstate 统一处理，模块只管状态本身
const userStore: Module<UserState, any> = {
	namespaced: true,
	state: (): UserState => ({
		token: null,
		user: null,
		isLoggedIn: false,
	}),
	mutations: {
		// 保持登录信息
		signIn(state, payload: { token: string; user: UserData }) {
			state.token = payload.token;
			state.user = payload.user;
			state.isLoggedIn = true;
		},
		// 清除登录信息
		signOut(state) {
			state.token = null;
			state.user = null;
			state.isLoggedIn = false;
		},
		// 更新用户信息
		updateUser(state, userData: Partial<UserData>) {
			if (state.user) {
				state.user = { ...state.user, ...userData };
			}
		},
	},
};

// 组合式 API：页面里 const { user, signOut } = useUserStore()
// 返回的 state 是 computed，模板中自动解包，脚本中需要 .value
export function useUserStore() {
	const store = useStore();
	return {
		token: computed(() => store.state.userStore.token),
		user: computed(() => store.state.userStore.user),
		isLoggedIn: computed(() => store.state.userStore.isLoggedIn),
		// 保持登录信息
		signIn: (payload: { token: string; user: UserData }) =>
			store.commit("userStore/signIn", payload),
		// 清除登录信息
		signOut: () => store.commit("userStore/signOut"),
		// 更新用户信息
		updateUser: (userData: Partial<UserData>) =>
			store.commit("userStore/updateUser", userData),
	};
}

export default userStore;
