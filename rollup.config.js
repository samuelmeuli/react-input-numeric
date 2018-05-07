import babel from 'rollup-plugin-babel';
import postcss from 'rollup-plugin-postcss';


export default {
	input: 'src/InputNumeric',
	output: {
		file: 'lib/InputNumeric.js',
		format: 'cjs'
	},
	external: ['react', 'prop-types', 'decimal.js'],
	plugins: [
		postcss(),
		babel({
			exclude: 'node_modules/**',
			plugins: ['external-helpers']
		})
	]
};
