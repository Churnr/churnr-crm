import React , { useState} from 'react'
import {auth} from '../firebase.js'
import {Button, Card, Alert, Table } from 'react-bootstrap'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar.js'

export default function Dashboard() {
const [error, setError] = useState('')
const {currentUser, logout} = useAuth()
const [respone, setRespone] = useState([])

const handleSubmit = async () => {
  const token = await auth.currentUser.getIdToken(true);
  console.log(token)
  const headers = {
      'Authorization': token
  }
  const response = await ( await fetch('http://localhost:5001/churnr-system/us-central1/app/helloWorld2', {headers})).json();
  setRespone(response)
  console.log(response)
}
return (
<div style={{minHeight: "100vh"}}>

<Navbar/>
  <button onClick={handleSubmit}>Press me</button>
        <h2 className='text-center mb-4'>Dashboard</h2>
        {error && <Alert variant='danger'>{error}</Alert>}
        <strong> Email: </strong> {currentUser.email}
        <Table striped bordered hover variant="dark">
  <thead>
    <tr>
      <th>First Name</th>
      <th>Last Name</th>
      <th>Username</th>
      <th>Email template</th>
    </tr>
  </thead>
  <tbody>
    {/* {respone.map(row => {
        return (
        <tr>
        <td key={row.FirstName}>{row.FirstName}</td>
        <td key={row.LastName}>{row.LastName}</td>
        <td key={row.UserName}>{row.UserName}</td>
        <td>
            <button >Send email</button>
          </td>
        </tr>
      )})} */}
      
  </tbody>
</Table>

    </div>
  )
}
