<template>
	<view>
		<up-navbar title="登录" placeholder :autoBack="true">
		</up-navbar>

		<view class="container">
			<view class="top">
				<view class="top-title">欢迎登录APP</view>
				<view class="top-label">未注册的用户请点击快速注册，注册后登录</view>
			</view>

			<up-form labelPosition="left" :model="formData" :rules="rules" ref="formRef" class="form" labelWidth="24rpx">
				<up-form-item prop="phone" :borderBottom="true">
					<up-input v-model="formData.phone" border="none" placeholder="请输入手机号"></up-input>
				</up-form-item>
				<up-form-item prop="password" :borderBottom="true">
					<up-input v-model="formData.password" type="password" border="none" placeholder="请输入登录密码"></up-input>
				</up-form-item>
			</up-form>

			<view class="agreement">
				<up-checkbox label="已经阅读并同意" name="agree" usedAlone labelSize="24rpx" labelColor="#8B8D8C" activeColor="#DD261C"
					size="32rpx" v-model:checked="checked">
				</up-checkbox>
				<view class="link-text">用户协议、隐私政策</view>
			</view>

			<up-button type="primary" text="登录" class="btn" @click="login"></up-button>

			<view class="links">
				<view @click="navigateByLink('./register')">还没有账号？去注册</view>
				<view @click="navigateByLink('./resetPassword')">忘记密码</view>
			</view>

			<view class="footer">
				<up-divider text="其他登录方式"></up-divider>
				<view class="row">
					<image src="/static/images/qq.png" mode="widthFix" class="icon" />
					<image src="/static/images/weChat.png" mode="widthFix" class="icon" />
					<image src="/static/images/alipay.png" mode="widthFix" class="icon" />
				</view>
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
	import { ref } from "vue";
	import { onLoad } from "@dcloudio/uni-app";

	import { userApi } from "@/api/userApi";
	import { useUserStore } from "@/store/modules/userStore";
	import { navigateByLink } from "@/utils/index"

	type FormRef = {
		validate: () => Promise<boolean>
	}

	const { signIn } = useUserStore ();

	const formRef = ref<FormRef | null>(null)
	const rules = {
		'phone': {
			type: 'number',
			required: true,
			message: '请填写手机号',
			trigger: ['blur', 'change'],
		},
		'password': {
			type: 'string',
			required: true,
			message: '请填写登录密码',
			trigger: ['blur', 'change'],
		},
	}
	const formData = ref({
		phone: "",
		password: ""
	})

	const checked = ref(true)

	// 登录失效被跳转过来时携带的回跳路径（request.ts 401 处理写入）
	let redirectPath = "";

	onLoad((options: any) => {
		const raw = options?.redirect || "";
		try {
			redirectPath = decodeURIComponent(raw);
		} catch {
			redirectPath = raw;
		}
	});

	// 登录成功后的跳转：优先回跳失效前的页面；tabbar 页面 redirectTo 会失败，回退 switchTab；没有回跳目标则回首页
	const backToPage = () => {
		if (redirectPath) {
			uni.redirectTo({
				url: redirectPath,
				fail: () => uni.switchTab({ url: redirectPath }),
			});
			return;
		}
		uni.switchTab({ url: "/pages/home/index" });
	};

	// 登录
	const login = () => {
		formRef.value?.validate().then(async (valid: boolean) => {
			if(!valid) return
			if(!checked.value) {
				uni.showToast({
					title: "请先同意用户协议、隐私政策",
					icon: "none"
				})
				return
			}
			const res = await userApi.login({
				phone: formData.value.phone,
				password: formData.value.password
			})
			const { accessToken, user } = res.data
			signIn({token: accessToken, user});
			uni.showToast({
				title: res.message,
				icon: "success"
			})
			backToPage();
		}).catch(() => {})
	}
</script>

<style lang="scss" scoped>
	page {
		background-color: #fff;
	}

	.container {
		padding: $space-1 * 8 $space-4;
	}

	.top {
		.top-title {
			font-size: 48rpx;
			font-weight: 600;
		}

		.top-label {
			font-size: 24rpx;
			color: $color-text-secondary;
		}
	}

	.form {
		margin: $space-1 * 8 0 $space-3;

		:deep(.u-form-item__body) {
			padding: $space-4 $space-3;
		}
	}

	.agreement {
		margin-bottom: $space-6;
		display: flex;
		align-items: center;
		gap: $space-1;
		font-size: 24rpx;

		.link-text {
			text-decoration: underline;
			color: $color-text-secondary;
		}
	}

	.links {
		margin-top: $space-3;
		@include flex-between;
		font-size: 12px;
		color: $color-text-secondary;
	}

	.footer {
		position: absolute;
		inset: auto $space-4 $space-1 * 8;

		.row {
			margin-top: $space-3;
			display: flex;
			justify-content: space-around;

			.icon {
				width: 80rpx;
			}
		}
	}
</style>
