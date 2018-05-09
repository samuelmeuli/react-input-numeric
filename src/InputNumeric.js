import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Decimal } from 'decimal.js';


const propTypes = {
	value: PropTypes.number.isRequired,
	max: PropTypes.number,
	min: PropTypes.number,
	decimals: PropTypes.number,
	step: PropTypes.number,
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
			return {
				value: transformedValue,
				valueEntered: null
			};
		} else {
			return null;
		}
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
			}
			if (this.interval) {
				clearInterval(this.interval);
			}
			if (this.props.onChange) {
				this.props.onChange(this.state.value.toNumber());
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
					value={displayedValue}
					onChange={e => this.onInputChange(e)}
					onBlur={() => this.onInputBlur()}
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
