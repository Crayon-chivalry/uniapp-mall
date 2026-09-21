<template>
	<view>
		<up-navbar title="购物车" leftIcon="" placeholder>
			<template #right>
				<view @click="isEdit = !isEdit">{{isEdit ? "完成": "编辑"}}</view>
			</template>
		</up-navbar>
	</view>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

	const isEdit = ref<boolean>(false)
</script>

<style lang="scss" scoped>

</style>
