import React, { Component } from 'react';
import InputNumeric from '../lib/InputNumeric';

export default class InputContainer extends Component {
	constructor() {
		super();

		this.state = {
			value: 10
		};
	}

	render() {
		return (
			<InputNumeric
				value={this.state.value}
				onChange={value => this.setState({ value })}
				min={0}
				max={50}
			/>
		);
	}
}
