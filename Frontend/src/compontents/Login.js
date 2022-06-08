import React, { useRef, useState } from 'react'
import { Card, Form, Button, Alert } from 'react-bootstrap'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Login() {
    const emailRef = useRef()
    const passwordRef = useRef()
    const { login } = useAuth()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate();
    async function handleSubmit(e) {
        e.preventDefault()

        try {
            setError('')
            setLoading(true)
            console.log("WHAT");
            await login(emailRef.current.value, passwordRef.current.value)
            navigate('/', { replace: true })
        } catch (error) {
            console.log(error);
            setError("Yo, failed to sign in, homie")
        }
        setLoading(false)

    }
    return (
        <>
            <div className="login-wrapper" style={{ height: "100vh", display: "flex" }}>

                <div className="w-100" style={{ maxWidth: "400px", margin: "auto" }}>
                    <Card>
                        <Card.Body>
                            <h2 className='text-center mb-4'>Log in</h2>
                            {error && <Alert variant='danger'>{error}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                <Form.Group id='email'>
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control type='email' ref={emailRef} required />
                                </Form.Group>
                                <Form.Group id='password'>
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type='password' ref={passwordRef} required />
                                </Form.Group>
                                <Button variant="dark" disabled={loading} className='w-100' type='submit' style={{ marginTop: "2rem" }}>Log in
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                    <div className='w-300 text-center mt-2'>

                        Need an account? Ask an Admin foo..
                    </div>
                </div>
            </div>
        </>
    )
}
