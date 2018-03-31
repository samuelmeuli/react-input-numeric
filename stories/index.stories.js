import React from 'react';
import { storiesOf } from '@storybook/react';
import InputNumeric from '../lib/InputNumeric';


storiesOf('InputNumeric', module)
	.add('Component with title', () => (
		<InputNumeric title="Hello World!" />
	));
