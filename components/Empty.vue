<template>
	<view class="empty">
		<image src="/static/images/empty.png" mode="widthFix" class="empty-image"></image>
		<view class="empty-text">{{ text }}</view>
	</view>
</template>

<script setup>
defineProps({
	text: {
		type: String,
		default: '暂无数据'
	}
})
</script>

<style lang="scss" scoped>
.empty {
	padding: 80rpx 0;
	text-align: center;

	.empty-image {
		width: 400rpx;
	}

	.empty-text {
		color: gray;
	}
}
</style>