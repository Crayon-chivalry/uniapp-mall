<template>
	<view>
		<up-navbar title="注册" placeholder :autoBack="true">
		</up-navbar>

		<view class="container">
			<up-form labelPosition="left" :model="formData" :rules="rules" ref="formRef" class="form" labelWidth="24rpx"
				errorType="toast">
				<up-form-item prop="phone">
					<up-input v-model="formData.phone" type="number" border="none" placeholder="请输入手机号"></up-input>
				</up-form-item>
				<up-form-item prop="nickname">
					<up-input v-model="formData.nickname" border="none" placeholder="请输入昵称"></up-input>
				</up-form-item>
				<up-form-item prop="password">
					<up-input v-model="formData.password" type="password" border="none" placeholder="请输入登录密码"></up-input>
				</up-form-item>
				<up-form-item prop="passwordConfirm">
					<up-input v-model="formData.passwordConfirm" type="password" border="none" placeholder="请再次输入密码"></up-input>
				</up-form-item>
			</up-form>

			<up-button type="primary" text="注册" class="btn" @click="register"></up-button>

			<view class="links">
				<text @click="gotoLogin">已有账号？立即登录</text>
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
	import { ref } from 'vue';
	import { userApi } from "@/api/userApi";

	type FormRef = {
		validate : () => Promise<boolean>
		resetFields: () => void
	}

	const formRef = ref<FormRef | null>(null)

	// 返回登录页
	const gotoLogin = () => {
		uni.navigateTo({ url: "/pages/auth/login" });
	};
	const rules = {
		'phone': {
			type: 'number',
			required: true,
			message: '请填写手机号',
			trigger: ['blur', 'change'],
		},
		'nickname': {
			type: 'string',
			required: true,
			message: '请填写昵称',
			trigger: ['blur', 'change'],
		},
		'password': {
			type: 'string',
			required: true,
			message: '请填写登录密码',
			trigger: ['blur', 'change'],
		},
		'passwordConfirm': [{
			type: 'string',
			required: true,
			message: '请再次填写密码',
			trigger: ['blur', 'change'],
		}, {
			trigger: ['blur', 'change'],
			validator: (rule : object, value : string, callback : (error ?: any) => void) => {
				if (value !== formData.value.password) {
					callback(new Error('密码不一致'));
				} else {
					callback()
				}
			}
		}],
	}
	const formData = ref({
		phone: "",
		password: "",
		nickname: "",
		passwordConfirm: ""
	})

	// 提交
	const register = () => {
		formRef.value?.validate().then(async (valid : boolean) => {
			if (!valid) return
			const res = await userApi.register({
				phone: formData.value.phone,
				password: formData.value.password,
				nickname: formData.value.nickname
			})
			uni.showToast({
				title: res.message
			})
			formRef.value?.resetFields()
		}).catch(() => { })
	}
</script>

<style lang="scss" scoped>
	page {
		background-color: #fff;
	}

	.container {
		padding: $space-4;
	}

	.form {
		margin-bottom: $space-6;
		@include flex-column($space-3);

		:deep(.u-form-item__body) {
			padding: $space-4 $space-3;
			border-radius: $radius-3;
			background-color: rgb(246, 246, 246);
		}
	}

	.links {
		margin-top: $space-3;
		@include flex-center;
		font-size: 12px;
		color: $color-text-secondary;
	}
</style>
