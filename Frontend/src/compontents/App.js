import React from "react";

import {AuthProvider} from '../contexts/AuthContext'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Dashboard from './Dashboard'
import Guide from "./Guide";
import Login from './Login'
import PrivateRoute from "./PrivateRoute";
function App() {
  return ( 
  <div className="wrapper">
<Router>
  <AuthProvider>
    <Routes>
      <Route exact path="/" element={<PrivateRoute> <Dashboard/></PrivateRoute> }></Route>
      <Route exact path="/guide" element={<Guide/> }></Route>
      <Route path="/login" element={<Login/>}></Route>
    </Routes>
  </AuthProvider>
   </Router>
 </div>
  )
}

export default App;
