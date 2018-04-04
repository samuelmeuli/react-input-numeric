import React, { Component } from 'react';
import PropTypes from 'prop-types';


const propTypes = {
	value: PropTypes.number.isRequired,
	step: PropTypes.number,
	min: PropTypes.number,
	max: PropTypes.number,
	decimals: PropTypes.number,
	onBlur: PropTypes.func,
	onChange: PropTypes.func
};

const defaultProps = {
	step: 1,
	min: null,
	max: null,
	decimals: 0,
	onBlur: null,
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

	/**
	 * Round number to specified precision (and avoid the floating-number arithmetic issue)
	 * Source: MDN
	 */
	static round(number, decimals) {
		// Shift the decimals to get a whole number, then round using Math.round() and move the number
		// of whole numbers, based on the specified precision, back to decimals
		return this.shift(Math.round(this.shift(number, decimals, false)), decimals, true);
	}

	/**
	 * Helper function for rounding: Move the number of decimals, based on the specified precision, to
	 * a whole number
	 * @param {boolean} reverseShift If true, round to one decimal place; if false, round to the tens
	 * Source: MDN
	 */
	static shift(number, decimals, reverseShift) {
		let precision = decimals;
		if (reverseShift) {
			precision = -precision;
		}
		const numArray = (`${number}`).split('e');
		return +(`${numArray[0]}e${numArray[1] ? (+numArray[1] + precision) : precision}`);
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
		if (this.props.onChange) {
			this.props.onChange(newValue);
		}
		if (this.props.onBlur) {
			this.props.onBlur(newValue);
		}
	}

	validate(newValue) {
		if (newValue === '') {
			// no input: use previous value
			return this.state.newValue;
		}
		const newNumber = parseFloat(newValue);
		if (this.props.min && newNumber <= this.props.min) {
			// value is min or smaller: set to min
			return this.props.min;
		} else if (this.props.max && newNumber >= this.props.max) {
			// value is max or larger: set to max
			return this.props.max;
		} else {
			// value is between min and max: round number to specified number of decimals
			return InputNumeric.round(newNumber, this.props.decimals);
		}
	}

	/**
	 * Decrement the input field's value by one step (this.props.step)
	 */
	decrement() {
		const newValue = this.validate(this.state.newValue - this.props.step);
		this.setState({
			newValue
		});
	}

	/**
	 * Increment the input field's value by one step (this.props.step)
	 */
	increment() {
		const newValue = this.validate(this.state.newValue + this.props.step);
		this.setState({
			newValue
		});
	}

	/**
	 * Start an interval in which the input field's value is repeatedly decremented
	 */
	startDecrement() {
		this.decrement();
		this.timeout = setTimeout(() => {
			this.interval = setInterval(() => {
				this.decrement();
			}, this.mouseDownInterval);
		}, this.mouseDownDelay);
	}

	/**
	 * Start an interval in which the input field's value is repeatedly incremented
	 */
	startIncrement() {
		this.increment();
		this.timeout = setTimeout(() => {
			this.interval = setInterval(() => {
				this.increment();
			}, this.mouseDownInterval);
		}, this.mouseDownDelay);
	}

	/**
	 * Stop the decrement/increment interval and execute the onChange() and onBlur() functions
	 */
	stop() {
		if (this.timeout) {
			clearTimeout(this.timeout);
		}
		if (this.interval) {
			clearInterval(this.interval);
		}
		if (this.props.onChange) {
			this.props.onChange(this.state.newValue);
		}
		if (this.props.onBlur) {
			this.props.onBlur(this.state.newValue);
		}
	}

	render() {
		return (
			<div className="number-input">
				<button
					type="button"
					onMouseDown={() => this.startDecrement()}
					onMouseUp={() => this.stop()}
					onMouseLeave={() => this.stop()}
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
					onMouseUp={() => this.stop()}
					onMouseLeave={() => this.stop()}
				>
					+
				</button>
			</div>
		);
	}
}

InputNumeric.propTypes = propTypes;
InputNumeric.defaultProps = defaultProps;
