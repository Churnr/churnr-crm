import React , { useState} from 'react'
import {Button, Card, Alert, Table } from 'react-bootstrap'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar.js'

export default function Dashboard() {
const [error, setError] = useState('')
const {currentUser, logout} = useAuth()
return (
<div style={{minHeight: "100vh"}}>
<Navbar/>


        <h2 className='text-center mb-4'>Dashboard</h2>
        {error && <Alert variant='danger'>{error}</Alert>}
        <strong> Email: </strong> {currentUser.email}
        <Table striped bordered hover variant="dark">
  <thead>
    <tr>
      <th>#</th>
      <th>First Name</th>
      <th>Last Name</th>
      <th>Username</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>Mark</td>
      <td>Otto</td>
      <td>@mdo</td>
    </tr>
    <tr>
      <td>2</td>
      <td>Jacob</td>
      <td>Thornton</td>
      <td>@fat</td>
    </tr>
    <tr>
      <td>3</td>
      <td colSpan={2}>Larry the Bird</td>
      <td>@twitter</td>
    </tr>
  </tbody>
</Table>

    </div>
  )
}
