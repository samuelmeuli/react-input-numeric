import React from 'react';
import PropTypes from 'prop-types';
import './style.css';


const propTypes = {
	title: PropTypes.string.isRequired
};

export default function InputNumeric(props) {
	return (
		<div className="input-numeric">
			<h1>{props.title}</h1>
			<p>This is an example component.</p>
		</div>
	);
}

InputNumeric.propTypes = propTypes;
