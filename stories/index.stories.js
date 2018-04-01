import React from 'react';
import { storiesOf } from '@storybook/react';
import InputContainer from './InputContainer';

storiesOf('InputNumeric', module)
	.add('Example', () => (
		<InputContainer />
	));
