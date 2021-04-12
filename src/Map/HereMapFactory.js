export default (appCode) => {
	return {
		appCode,
		getPlatform: () => {
			return new window.H.service.Platform({
				apikey: appCode,
			});
		},
		getHereMap: (container, mapType, options) => {
			return new window.H.Map(container, mapType, options);
		},
	};
};