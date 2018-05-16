import React from 'react';
import { storiesOf } from '@storybook/react';
import { withState } from '@dump247/storybook-state';

import Code from './Code';
import InputNumeric from '../lib/InputNumeric';
import './style.css';


storiesOf('InputNumeric', module)
	.add('Default', withState({ value: 10 })(({ store }) => (
		<main>
			<InputNumeric
				{...store.state}
				value={store.state.value}
				onChange={value => store.set({ value })}
			/>
			<br />
			<Code
				options={{
					value: 'this.state.value',
					onChange: 'value => this.setState({ value })'
				}}
			/>
		</main>
	)))
	.add('Non-integer step', withState({ value: 10 })(({ store }) => (
		<main>
			<InputNumeric
				{...store.state}
				value={store.state.value}
				snapToStep
				step={0.2}
				onChange={value => store.set({ value })}
			/>
			<br />
			<Code
				options={{
					value: 'this.state.value',
					snapToStep: true,
					step: 0.2,
					onChange: 'value => this.setState({ value })'
				}}
			/>
		</main>
	)))
	.add('Trailing zeros', withState({ value: 10 })(({ store }) => (
		<main>
			<InputNumeric
				{...store.state}
				value={store.state.value}
				decimals={2}
				showTrailingZeros
				step={0.01}
				onChange={value => store.set({ value })}
			/>
			<br />
			<Code
				options={{
					value: 'this.state.value',
					decimals: 2,
					showTrailingZeros: true,
					step: 0.01,
					onChange: 'value => this.setState({ value })'
				}}
			/>
		</main>
	)));
