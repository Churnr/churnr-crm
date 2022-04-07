import React from "react";

import {Container} from 'react-bootstrap'
import {AuthProvider} from '../contexts/AuthContext'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Dashboard from './Dashboard'
import Login from './Login'
import PrivateRoute from "./PrivateRoute";
function App() {
  return (
  <Container 
  className="d-flex align-items-center justify-content-center" 
  style={{ minHeight: "100vh" }}>
  <div className="w-100" style={{ minWidth: "100vw"}}>
<Router>
  <AuthProvider>
    <Routes>
      <Route exact path="/" element={<PrivateRoute> <Dashboard/></PrivateRoute> }></Route>
      <Route path="/login" element={<Login/>}></Route>
    </Routes>
  </AuthProvider>
   </Router>
 </div>
  </Container>
  )
}

export default App;
