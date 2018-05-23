import React from 'react';
import OpenviduReact from '../lib';
import './App.css';

const App = () => (
  <div className="demoapp">
    <OpenviduReact wsUrl={"localhost"} sessionId={"A"} participantId={1} token={"ljadskblvlifuvbklieu14857362sff45"}/>
  </div>
);

export default App;
