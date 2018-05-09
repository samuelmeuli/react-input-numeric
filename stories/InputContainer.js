import React, { Component } from 'react';
import InputNumeric from '../lib/InputNumeric';

export default class InputContainer extends Component {
	constructor() {
		super();

		this.state = {
			value: 0
		};
	}

	render() {
		return (
			<InputNumeric
				value={this.state.value}
				onChange={value => this.setState({ value })}
				max={10}
				decimals={4}
				snapToStep
			/>
		);
	}
}
