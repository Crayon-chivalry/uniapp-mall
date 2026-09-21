// 根据 linkUrl 跳转：外链新窗口打开，站内路由跳转
export const navigateByLink = (linkUrl: string | null | undefined) => {
	if (!linkUrl) return;

	// #ifdef H5
	if (/^https?:\/\//.test(linkUrl)) {
		window.open(linkUrl, "_blank", "noopener,noreferrer");
		return;
	}
	// #endif

	uni.navigateTo({
		url: linkUrl,
		fail: () => {
			// tabbar 页面不能用 navigateTo，回退 switchTab
			uni.switchTab({ url: linkUrl });
		},
	});
};
