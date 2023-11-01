import React from 'react'
import { AppContext } from './contexts/app-context'
import { useState } from 'react'

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { HomePage } from './pages/home'
import {Example3Page} from "./pages/example-3";
import {Example1Page} from "./pages/example-1";
import {Example2Page} from "./pages/example-2";

function App() {
  const [state, setState] = useState({})

  return (
    <AppContext.Provider value={{ state, setState }}>
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
              <li>
                <Link to="/example-2">Example 2</Link>
              </li>
              <li>
                <Link to="/example-3">Example 3</Link>
              </li>
            </ul>
          </nav>

          <Routes>
            <Route path="/example-1" element={<Example1Page />} />
            <Route path="/example-2" element={<Example2Page />} />
            <Route path="/example-3" element={<Example3Page />} />
            <Route path="/" element={<HomePage />} />
          </Routes>
        </div>
      </Router>
    </AppContext.Provider>
  )
}

export default App
