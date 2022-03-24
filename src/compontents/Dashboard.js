import React , { useState} from 'react'
import {Button, Card, Alert} from 'react-bootstrap'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
const [error, setError] = useState('')
const {currentUser, logout} = useAuth()
const navigate = useNavigate();

async function handleLogout() {
    setError('')

    try {

    await logout()
    navigate('/login', { replace: true })
    } catch {
        setError('Failed to logout')
    }

}
return (
<>
    <Card> 
        <Card.Body>
        <h2 className='text-center mb-4'>Dashboard</h2>
        {error && <Alert variant='danger'>{error}</Alert>}
        <strong> Email: </strong> {currentUser.email}
        </Card.Body>
    </Card>
    <div className='w-300 text-center mt-2'>
        <Button variant='link' onClick={handleLogout}>Log Out</Button>
    </div>  
    </>
  )
}
