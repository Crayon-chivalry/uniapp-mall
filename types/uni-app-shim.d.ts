// HBuilderX 项目没有 npm 安装 @dcloudio/uni-app（编译时使用 HBuilderX 内置运行时），
// VS Code 的 TS 服务无法解析该模块，这里做类型声明仅供编辑器提示使用
declare module "@dcloudio/uni-app" {
	type OnLoadOptions = Record<string, string | undefined>;

	const onLoad: (callback: (options?: OnLoadOptions) => void) => void;
	const onShow: (callback: () => void) => void;
	const onHide: (callback: () => void) => void;
	const onReady: (callback: () => void) => void;
	const onUnload: (callback: () => void) => void;
	const onResize: (callback: (options?: { size: { windowWidth: number; windowHeight: number } }) => void) => void;
	const onPullDownRefresh: (callback: () => void) => void;
	const onReachBottom: (callback: () => void) => void;
	const onTabItemTap: (callback: (options?: { index: number; text: string; pagePath: string }) => void) => void;
	const onShareAppMessage: (callback: (options?: any) => { title?: string; path?: string; imageUrl?: string }) => void;
	const onPageScroll: (callback: (options?: { scrollTop: number }) => void) => void;
	const onNavigationBarButtonTap: (callback: (options?: { index: number }) => void) => void;
	const onBackPress: (callback: (options?: { from: "backbutton" | "navigateBack" }) => boolean | void) => void;
}
