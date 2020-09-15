module.exports = {
	css: {
		loaderOptions: {
			sass: {
				implementation: require('sass'),
				prependData: `@use "@/scss/_variables.scss";`,
				sassOptions: {
					indentWidth: 2,
					includePaths: ['node_modules']
				}
			}
		}
	}
};