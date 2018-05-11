import React from 'react';
import PropTypes from 'prop-types';


const propTypes = {
	options: PropTypes.objectOf(PropTypes.PropTypes.oneOfType([
		PropTypes.bool,
		PropTypes.number,
		PropTypes.string
	])).isRequired
};

export default function Code(props) {
	return (
		<code>
			<p>{'<InputNumeric'}</p>
			{
				Object.keys(props.options).map((key) => {
					const value = props.options[key];
					if (typeof value === 'boolean') {
						if (value === true) {
							return <p key={key}>&nbsp;&nbsp;{key}</p>;
						}
						return <p key={key}>&nbsp;&nbsp;{key}=&#123;false&#125;</p>;
					}
					return <p key={key}>&nbsp;&nbsp;{key}=&#123;{value}&#125;</p>;
				})
			}
			<p>{'/>'}</p>
		</code>
	);
}

Code.propTypes = propTypes;
