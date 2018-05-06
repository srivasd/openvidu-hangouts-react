import React from 'react';
import OpenviduReact from '../lib';

const App = () => (
  <div>
    <OpenviduReact wsUrl={"localhost"} sessionId={"A"} participantId={1} token={"ljadskblvlifuvbklieu14857362sff45"} distribution={"default"} />
  </div>
);

export default App;
