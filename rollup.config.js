import typescript from 'rollup-plugin-typescript2';


const license = `/*!
 * vuex-history
 * https://github.com/yomotsu/vuex-history
 * (c) 2018 @yomotsu
 * Released under the MIT License.
 */`

const outputConfig = {
	globals: {
		vue: 'Vue'
	}
}

export default {
	input: 'src/index.ts',
	external: ['vue'],

	output: [
		{ file: 'dist/vuex-history.iife.js', name: 'VuexHistory', format: 'iife', browser: true, transpile: false, ...outputConfig },
		{ file: 'dist/vuex-history.cjs.js', name: 'VuexHistory', format: 'cjs', browser: true, ...outputConfig },
		{ file: 'dist/vuex-history.esm-browser.js', name: 'VuexHistory', format: 'es', browser: true, ...outputConfig },
		{ file: 'dist/vuex-history.esm-bundler.js', name: 'VuexHistory', format: 'es', ...outputConfig },
	],
	plugins: [
		typescript()
	]
};
