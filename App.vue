<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	:root,
	page,
	body,
	[data-up-theme='light'] {
	  --up-primary: #{$color-primary};
	}
</style>
