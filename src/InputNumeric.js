import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Decimal } from 'decimal.js';

import './style.scss';


const propTypes = {
	value: PropTypes.number.isRequired,
	max: PropTypes.number,
	min: PropTypes.number,
	decimals: PropTypes.number,
	step: PropTypes.number,
	name: PropTypes.string,
	disabled: PropTypes.bool,
	showButtons: PropTypes.bool,
	showTrailingZeros: PropTypes.bool,
	snapToStep: PropTypes.bool,
	onBlur: PropTypes.func,
	onChange: PropTypes.func
};

const defaultProps = {
	max: null,
	min: null,
	decimals: 2,
	step: 1,
	name: null,
	disabled: false,
	showButtons: true,
	showTrailingZeros: false,
	snapToStep: false,
	onBlur: null,
	onChange: null
};

export default class InputNumeric extends Component {
	/**
	 * Validate programmatically changed values
	 */
	static getDerivedStateFromProps(nextProps, prevState) {
		// Check whether value is a number
		let newValue;
		try {
			newValue = new Decimal(nextProps.value);
		} catch (e) {
			return null;
		}

		// Only perform validation if the entered value is different than the one stored in state
		if (!newValue.equals(prevState.value)) {
			const transformedValue = InputNumeric.applyOptions(newValue, prevState.value, nextProps);
			if (nextProps.onChange) {
				nextProps.onChange(newValue.toNumber());
			}
			if (nextProps.onBlur) {
				nextProps.onBlur(newValue.toNumber());
			}
			return {
				value: transformedValue,
				valueEntered: null
			};
		}
		return null;
	}

	/**
	 * Transform value according to props:
	 * - Make sure it the Decimal lies between props.min and props.max (if specified)
	 * - Snap manually entered Decimals to the nearest step (if specified)
	 * @param {Decimal} newValue - value to be transformed
	 * @param {Decimal} oldValue - effective value stored in state
	 * @param {object} props
	 */
	static applyOptions(newValue, oldValue, props) {
		let transformedValue = newValue;

		// Make sure value is in specified range (between min and max)
		if (props.min !== null && transformedValue.lessThanOrEqualTo(props.min)) {
			// Value is min or smaller: set to min
			return new Decimal(props.min);
		} else if (props.max !== null && transformedValue.greaterThanOrEqualTo(props.max)) {
			// Value is max or larger: set to max
			return new Decimal(props.max);
		}

		// Snap to step if option is enabled
		if (props.snapToStep === true) {
			transformedValue = transformedValue.toNearest(props.step);
		}

		return transformedValue;
	}

	constructor(props) {
		super(props);
		this.mouseDownDelay = 250; // duration until mouseDown is treated as such (instead of click)
		this.mouseDownInterval = 75; // interval for increasing/decreasing value on mouseDown

		const value = new Decimal(this.props.value);
		this.state = {
			value, // final, validated number (Decimal)
			valueEntered: null // unvalidated number displayed while editing input (null or String)
		};
	}

	onInputChange(e) {
		// Temporarily save the new value entered in the input field
		this.setState({
			valueEntered: e.target.value
		});
	}

	onInputBlur() {
		// Reset input field if value is not a number
		let valueEntered;
		try {
			valueEntered = new Decimal(this.state.valueEntered);
		} catch (e) {
			this.setState({
				valueEntered: null
			});
			return;
		}

		// Transform and save valueEntered according to props, execute onChange and onBlur from props
		const value = InputNumeric.applyOptions(valueEntered, this.state.value, this.props);
		this.setState({
			value,
			valueEntered: null
		});
		if (this.props.onChange) {
			this.props.onChange(value.toNumber());
		}
		if (this.props.onBlur) {
			this.props.onBlur(value.toNumber());
		}
	}

	/**
	 * Decrement the input field's value by one step (this.props.step)
	 */
	decrement() {
		const oldValue = this.state.value;
		if (oldValue.modulo(this.props.step).isZero()) {
			// If current value is divisible by step: Subtract step
			const newValue = InputNumeric.applyOptions(
				oldValue.minus(this.props.step),
				oldValue,
				this.props
			);
			this.setState({
				value: newValue,
				valueEntered: null
			});
			if (this.props.onChange) {
				this.props.onChange(newValue.toNumber());
			}
		} else {
			// If current value is not divisible by step: Round to nearest lower multiple of step
			const newValue = oldValue.toNearest(this.props.step, Decimal.ROUND_DOWN);
			this.setState({
				value: newValue,
				valueEntered: null
			});
		}
	}

	/**
	 * Increment the input field's value by one step (this.props.step)
	 */
	increment() {
		const oldValue = this.state.value;
		if (oldValue.modulo(this.props.step).isZero()) {
			// If current value is divisible by step: Add step
			const newValue = InputNumeric.applyOptions(
				oldValue.plus(this.props.step),
				oldValue,
				this.props
			);
			this.setState({
				value: newValue,
				valueEntered: null
			});
			if (this.props.onChange) {
				this.props.onChange(newValue.toNumber());
			}
		} else {
			// If current value is not divisible by step: Round to nearest higher multiple of step
			const newValue = oldValue.toNearest(this.props.step, Decimal.ROUND_UP);
			this.setState({
				value: newValue,
				valueEntered: null
			});
		}
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
		if (this.timeout || this.interval) {
			if (this.timeout) {
				clearTimeout(this.timeout);
				this.timeout = null;
			}
			if (this.interval) {
				clearInterval(this.interval);
				this.interval = null;
			}
			if (this.props.onBlur) {
				this.props.onBlur(this.state.value.toNumber());
			}
		}
	}

	render() {
		// Determine value to be displayed in the input field
		let displayedValue;
		if (this.state.valueEntered != null) {
			// Display entered (non-validated) value while input field is being edited
			displayedValue = this.state.valueEntered;
		} else if (this.props.showTrailingZeros === true) {
			// Add trailing zeros if option is enabled
			displayedValue = this.state.value.toFixed(this.props.decimals);
		} else {
			// Round to specified number of decimals
			displayedValue = this.state.value.toDecimalPlaces(this.props.decimals);
		}

		const decrementButton = (
			<button
				type="button"
				disabled={this.props.disabled}
				onMouseDown={() => this.startDecrement()}
				onMouseUp={() => this.stop()}
				onMouseLeave={() => this.stop()}
				onTouchStart={(e) => {
					e.preventDefault(); // prevent onClick from being fired
					this.startDecrement();
				}}
				onTouchEnd={(e) => {
					e.preventDefault(); // prevent onClick from being fired
					this.stop();
				}}
			>
				–
			</button>
		);
		const incrementButton = (
			<button
				type="button"
				disabled={this.props.disabled}
				onMouseDown={() => this.startIncrement()}
				onMouseUp={() => this.stop()}
				onMouseLeave={() => this.stop()}
				onTouchStart={(e) => {
					e.preventDefault(); // prevent onClick from being fired
					this.startIncrement();
				}}
				onTouchEnd={(e) => {
					e.preventDefault(); // prevent onClick from being fired
					this.stop();
				}}
			>
				+
			</button>
		);

		return (
			<div className="input-numeric">
				{this.props.showButtons && decrementButton}
				<input
					name={null}
					type="number"
					pattern={Number.isInteger(this.props.step) ? '[0-9]*' : '[0-9\.]*'}
					disabled={this.props.disabled}
					value={displayedValue}
					onChange={e => this.onInputChange(e)}
					onBlur={() => this.onInputBlur()}
				/>
				{this.props.showButtons && incrementButton}
			</div>
		);
	}
}

InputNumeric.propTypes = propTypes;
InputNumeric.defaultProps = defaultProps;
