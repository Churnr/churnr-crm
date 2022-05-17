import React , { useState} from 'react'
import {auth} from '../firebase.js'
import { Table, Tabs, Row, Tab, Col, Nav } from 'react-bootstrap'
// import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar.js'



export default function Dashboard() {

const [responeDunning, setResponeDunning] = useState([])
const [responeActive, setResponeActive] = useState([])
const [responeRetained, setResponeRetained] = useState([])
const handleSubmit = async () => {
  const token = await auth.currentUser.getIdToken(true);
  console.log(token)
  const headers = {
      'Authorization': token
  }
  const response = await ( await fetch('https://us-central1-churnr-system-development.cloudfunctions.net/slackApp/getData', {headers})).json();
  setResponeDunning(response[0]);
  setResponeActive(response[1]);
  setResponeRetained(response[2]);
  console.log(responeDunning)
}
return (    
  <>
<button onClick={handleSubmit}>click me</button>
  
<div style={{minHeight: "100vh"}}>

<Navbar/>
          
<Tab.Container id="left-tabs-example" defaultActiveKey="first">
  <Row className="wrapper-row" bsPrefix>
    <Col className="left-pane" bsPrefix> 
      <Nav variant="pills" className="flex-column">
        <Nav.Item>
          <Nav.Link eventKey="first">LalaToys</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="second">Spiritium</Nav.Link>
        </Nav.Item>
      </Nav>
    </Col>
    <Col className="right-pane" bsPrefix>
      <Tab.Content>
        <Tab.Pane eventKey="first">
        <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example" className="mb-3">
        <Tab eventKey="dunnings" title="Dunning">
  <Table striped bordered hover variant="dark">
  <thead>
    <tr>
      <th>First Name</th>
      <th>Last Name</th>
      <th>Email</th>
      <th>Phone</th>      
      <th>Customer id</th>
      <th>Error state</th>
      <th>Error</th>
      <th>Order</th>
      <th>Dunning created</th>
      <th>Invoice settled</th>
    </tr>
  </thead>
  <tbody>
    {responeDunning.map(row => {
        return (
        <tr>
        <td key={row?.first_name}>{row?.first_name}</td>
        <td key={row?.last_name}>{row?.last_name}</td>
        <td key={row?.email}>{row?.email}</td>
        <td key={row?.phone}>{row?.phone}</td>        
        <td key={row?.handle}>{row?.handle}</td>      
        <td key={row?.errorState}>{row?.errorState}</td>
        <td key={row?.error}>{row?.error}</td>
        <td key={row?.ordertext}>{row?.ordertext +" " + row?.amount+ "kr"}</td>
        <td key={new Date(row?.created).toDateString()}>{new Date(row?.created).toDateString()}</td>
        <td key={row?.settled_invoices}>{row?.settled_invoices}</td>
        </tr>
      )})}
      
  </tbody>
</Table>
  </Tab>
  <Tab eventKey="dunning" title="Active Dunning">
  <Table striped bordered hover variant="dark">
  <thead>
    <tr>
      <th>First Name</th>
      <th>Last Name</th>
      <th>Email</th>
      <th>Phone</th>      
      <th>Customer id</th>
      <th>Error state</th>
      <th>Error</th>
      <th>Acquirer message</th>
      <th>Order text</th>
      <th>Order amount</th>
      <th>Dunning created</th>
      <th>Invoice settled</th>      
      <th>Email Count</th>      
      <th>Flow Start Date</th>
      <th>Flow Status</th>
    </tr>
  </thead>
  <tbody>
    {responeActive.map(row => {
        return (
        <tr>
        <td key={row?.first_name}>{row?.first_name}</td>
        <td key={row?.last_name}>{row?.last_name}</td>
        <td key={row?.email}>{row.email}</td>
        <td key={row?.phone}>{row?.phone}</td>        
        <td key={row?.handle}>{row?.handle}</td>      
        <td key={row?.errorState}>{row?.errorState}</td>
        <td key={row?.error}>{row?.error}</td>
        <td key={row?.acquirer_message}>{row?.acquirer_message}</td>
        <td key={row?.ordertext}>{row?.ordertext}</td>
        <td key={row?.amount}>{row?.amount}</td>
        <td key={new Date(row?.created).toDateString()}>{new Date(row?.created).toDateString()}</td>
        <td key={row?.settled_invoices}>{row?.settled_invoices}</td>     
        <td key={row?.emailCount}>{row?.emailCount}</td>
        <td key={"active"+ new Date(row?.flowStartDate._seconds*1000).toDateString()}>{new Date(row?.flowStartDate._seconds*1000).toDateString()}</td>
        <td key={row?.activeFlow}>{ row?.activeFlow === true ? (<span class="activetrue">●</span>) : <span class="activefalse">●</span>
        }</td>
        </tr>
      )})}
      
  </tbody>
</Table>
  </Tab>

  <Tab eventKey="retained" title="Retained">
  <Table striped bordered hover variant="dark">
  <thead>
    <tr>
      <th>First Name</th>
      <th>Last Name</th>
      <th>Email</th>
      <th>Phone</th>      
      <th>Customer id</th>
      <th>Error state</th>
      <th>Error</th>
      <th>Acquirer message</th>
      <th>Order text</th>
      <th>Order amount</th>
      <th>Dunning created</th>
      <th>Invoice settled</th>      
      <th>Email Count</th>      
      <th>Flow Start Date</th>
      <th>Flow Status</th>
      <th>Retained Date</th>
    </tr>
  </thead>
  <tbody>
    {responeRetained.map(row => {
        return (
        <tr>
        <td key={row?.first_name}>{row?.first_name}</td>
        <td key={row?.last_name}>{row?.last_name}</td>
        <td key={row?.email}>{row.email}</td>
        <td key={row?.phone}>{row?.phone}</td>        
        <td key={row?.handle}>{row?.handle}</td>      
        <td key={row?.errorState}>{row?.errorState}</td>
        <td key={row?.error}>{row?.error}</td>
        <td key={row?.acquirer_message}>{row?.acquirer_message}</td>
        <td key={row?.ordertext}>{row?.ordertext}</td>
        <td key={row?.amount}>{row?.amount}</td>
        <td key={new Date(row?.created).toDateString()}>{new Date(row?.created).toDateString()}</td>
        <td key={row?.settled_invoices}>{row?.settled_invoices}</td>     
        <td key={row?.emailCount}>{row?.emailCount}</td>
        <td key={"retained"+ new Date(row?.flowStartDate._seconds*1000).toDateString()}>{new Date(row?.flowStartDate._seconds*1000).toDateString()}</td>
        <td key={row?.activeFlow}>{ row?.activeFlow === true ? (<span class="activetrue">●</span>) : <span class="activefalse">●</span>
        }</td>
        <td key={"retaineddate"+ new Date(row?.retainedDate._seconds*1000).toDateString()}>{new Date(row?.retainedDate._seconds*1000).toDateString()}</td>
        </tr>
      )})}
      
  </tbody>
</Table>
  </Tab>
  <Tab eventKey="onhold" title="Onhold">
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
    {/* {respone.map(row? => {
        return (
        <tr>
        <td key={row?.FirstName}>{row?.FirstName}</td>
        <td key={row?.LastName}>{row?.LastName}</td>
        <td key={row?.UserName}>{row?.UserName}</td>
        <td>
            <button >Send email</button>
          </td>
        </tr>
      )})} */}
      
  </tbody>
</Table>
  </Tab>
  <Tab eventKey="redunning" title="Redunning">
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
    {/* {respone.map(row? => {
        return (
        <tr>
        <td key={row?.FirstName}>{row?.FirstName}</td>
        <td key={row?.LastName}>{row?.LastName}</td>
        <td key={row?.UserName}>{row?.UserName}</td>
        <td>
            <button >Send email</button>
          </td>
        </tr>
      )})} */}
      
  </tbody>
</Table>
  </Tab>
  <Tab eventKey="dialog" title="Dialog">
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
    {/* {respone.map(row? => {
        return (
        <tr>
        <td key={row?.FirstName}>{row?.FirstName}</td>
        <td key={row?.LastName}>{row?.LastName}</td>
        <td key={row?.UserName}>{row?.UserName}</td>
        <td>
            <button >Send email</button>
          </td>
        </tr>
      )})} */}
      
  </tbody>
</Table>
  </Tab>
</Tabs>
        </Tab.Pane>
        <Tab.Pane eventKey="second">
        <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example" className="mb-3">
  <Tab eventKey="dunning" title="Active Dunning">
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
    {/* {respone.map(row? => {
        return (
        <tr>
        <td key={row?.FirstName}>{row?.FirstName}</td>
        <td key={row?.LastName}>{row?.LastName}</td>
        <td key={row?.UserName}>{row?.UserName}</td>
        <td>
            <button >Send email</button>
          </td>
        </tr>
      )})} */}
      
  </tbody>
</Table>
  </Tab>
  <Tab eventKey="retained" title="Retained">
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
    {/* {respone.map(row? => {
        return (
        <tr>
        <td key={row?.FirstName}>{row?.FirstName}</td>
        <td key={row?.LastName}>{row?.LastName}</td>
        <td key={row?.UserName}>{row?.UserName}</td>
        <td>
            <button >Send email</button>
          </td>
        </tr>
      )})} */}
      
  </tbody>
</Table>
  </Tab>
  <Tab eventKey="onhold" title="Onhold">
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
    {/* {respone.map(row? => {
        return (
        <tr>
        <td key={row?.FirstName}>{row?.FirstName}</td>
        <td key={row?.LastName}>{row?.LastName}</td>
        <td key={row?.UserName}>{row?.UserName}</td>
        <td>
            <button >Send email</button>
          </td>
        </tr>
      )})} */}
      
  </tbody>
</Table>
  </Tab>
  <Tab eventKey="redunning" title="Redunning">
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
    {/* {respone.map(row? => {
        return (
        <tr>
        <td key={row?.FirstName}>{row?.FirstName}</td>
        <td key={row?.LastName}>{row?.LastName}</td>
        <td key={row?.UserName}>{row?.UserName}</td>
        <td>
            <button >Send email</button>
          </td>
        </tr>
      )})} */}
      
  </tbody>
</Table>
  </Tab>
  <Tab eventKey="dialog" title="Dialog">
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
    {/* {respone.map(row? => {
        return (
        <tr>
        <td key={row?.FirstName}>{row?.FirstName}</td>
        <td key={row?.LastName}>{row?.LastName}</td>
        <td key={row?.UserName}>{row?.UserName}</td>
        <td>
            <button >Send email</button>
          </td>
        </tr>
      )})} */}
      
  </tbody>
</Table>
  </Tab>
</Tabs>
        </Tab.Pane>
      </Tab.Content>
    </Col>
  </Row>
</Tab.Container>

</div>
    </>
  )
}


 /*
  ActiveDunnig:
  Kundeid
  Navn
  Email
  Telefon nr
  Dunning dato
  Dunning årsag (error og error state)
  Beløb
  Ordren (texten i ordren)
  Betalte invoices i alt
  Antal emails sendt

  Retained:
  Kundeid
  Navn
  Email
  Telefon nr
  Dunning dato
  Dunning årsag (error og error state)
  Beløb
  Ordren (texten i ordren)
  Betalte invoices
  Antal emails sendt
  Dato på retained

  Onhold:
  Kundeid
  Navn
  Email
  Telefon nr
  Dunning dato
  Dunning årsag (error og error state)
  Beløb
  Ordren (texten i ordren)
  Betalte invoices
  Antal emails sendt
  Dato på onhold

  Redunning:
  Kundeid
  Navn
  Email
  Telefon nr
  Dunning dato
  Dunning årsag (error og error state)
  Beløb
  Ordren (texten i ordren)
  Betalte invoices
  Antal emails sendt
  Dato på onhold
  Årsag på tidligere dunning


  Dialog:
  Kundeid
  Navn
  Email
  Telefon nr
  Dunning dato
  Dunning årsag (error og error state)
  Beløb
  Ordren (texten i ordren)
  Betalte invoices
  Antal emails sendt
  Evt kommentar felt

  */