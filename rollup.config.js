import babel from 'rollup-plugin-babel'

const license = `/*!
 * vuex-history
 * https://github.com/yomotsu/vuex-history
 * (c) 2018 @yomotsu
 * Released under the MIT License.
 */`

export default {
	input: 'src/index.js',
	output: [
		{
			format: 'umd',
			name: 'VuexHistory',
			file: 'dist/vuex-history.js',
			indent: '\t',
			banner: license
		},
		{
			format: 'es',
			file: 'dist/vuex-history.module.js',
			indent: '\t',
			banner: license
		}
	],
	// sourceMap: false,
	plugins: [
		babel( { exclude: 'node_modules/**' } )
	]
};
