import React from "react";
import {AppContext} from "./contexts/app-context";
import {useState} from "react";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from 'react-router-dom';
import {HomePage} from "./pages/home";
import {Example1Page} from "./pages/example-1";

function App() {
  const [state, setState] = useState({})

  return (
    <AppContext.Provider value={{state, setState}}>
      <Router>
        <div>
          <nav>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/example-1">Example 1</Link>
              </li>
            </ul>
          </nav>

          <Routes>
            <Route path="/example-1" element={<Example1Page/>}/>
            <Route path="/" element={<HomePage/>}/>
          </Routes>
        </div>
      </Router>
    </AppContext.Provider>
  );
}

export default App;
