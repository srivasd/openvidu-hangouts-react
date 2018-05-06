import React from 'react';
import ReactDOM from 'react-dom';
import OpenviduHangoutsReact from './OpenviduHangoutsReact';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<OpenviduHangoutsReact />, div);
});
