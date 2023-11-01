import React from 'react';
import ReactDOM from 'react-dom';
import App from "./app";

const DemoApp: React.FC = () => {
  return(
    <App/>
  )
};

ReactDOM.render(<DemoApp />, document.getElementById('root'));