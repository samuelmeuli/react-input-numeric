import React, { Component } from 'react';
import PropTypes from 'prop-types';


const propTypes = {
	value: PropTypes.number.isRequired,
	step: PropTypes.number,
	min: PropTypes.number,
	max: PropTypes.number,
	onChange: PropTypes.func
};

const defaultProps = {
	step: 1,
	min: 0,
	max: 100,
	onChange: null
};

export default class InputNumeric extends Component {
	static getDerivedStateFromProps(nextProps, prevState) {
		const newValue = nextProps.value;
		if (newValue !== prevState.value) {
			return {
				newValue
			};
		}	else {
			return null;
		}
	}

	constructor(props) {
		super(props);
		this.mouseDownDelay = 250;
		this.mouseDownInterval = 75;

		this.state = {
			newValue: this.props.value
		};
	}

	onChange(e) {
		this.setState({
			newValue: e.target.value
		});
	}

	onBlur() {
		const newValue = this.validate(this.state.newValue);
		this.props.onChange(newValue);
	}

	validate(newValue) {
		if (newValue === '') {
			// no input
			return this.props.min;
		} else if (newValue <= this.props.min) {
			// value is min or smaller
			return this.props.min;
		} else if (newValue >= this.props.max) {
			// value is max or larger
			return this.props.max;
		} else if (Number.isInteger(this.props.step)) {
			// value is between min and max and an integer
			return parseInt(newValue, 10);
		} else {
			// value is between min and max and a float
			return parseFloat(newValue);
		}
	}

	decrement() {
		const newValue = this.validate(this.props.value - this.props.step);
		this.props.onChange(newValue);
	}

	startDecrement() {
		this.decrement();
		this.decrementTimeout = setTimeout(() => {
			this.decrementInterval = setInterval(() => {
				this.decrement();
			}, this.mouseDownInterval);
		}, this.mouseDownDelay);
	}

	stopDecrement() {
		if (this.decrementTimeout) {
			clearTimeout(this.decrementTimeout);
		}
		if (this.decrementInterval) {
			clearInterval(this.decrementInterval);
		}
	}

	increment() {
		const newValue = this.validate(this.props.value + this.props.step);
		this.props.onChange(newValue);
	}

	startIncrement() {
		this.increment();
		this.incrementTimeout = setTimeout(() => {
			this.incrementInterval = setInterval(() => {
				this.increment();
			}, this.mouseDownInterval);
		}, this.mouseDownDelay);
	}

	stopIncrement() {
		if (this.incrementTimeout) {
			clearTimeout(this.incrementTimeout);
		}
		if (this.incrementInterval) {
			clearInterval(this.incrementInterval);
		}
	}

	render() {
		return (
			<div className="number-input">
				<button
					type="button"
					onMouseDown={() => this.startDecrement()}
					onMouseUp={() => this.stopDecrement()}
					onMouseLeave={() => this.stopDecrement()}
				>
					–
				</button>
				<input
					type="number"
					value={this.state.newValue}
					step={this.props.step}
					onChange={e => this.onChange(e)}
					onBlur={() => this.onBlur()}
				/>
				<button
					type="button"
					onMouseDown={() => this.startIncrement()}
					onMouseUp={() => this.stopIncrement()}
					onMouseLeave={() => this.stopIncrement()}
				>
					+
				</button>
			</div>
		);
	}
}

InputNumeric.propTypes = propTypes;
InputNumeric.defaultProps = defaultProps;
