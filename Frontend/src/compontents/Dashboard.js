import React , { useState, useEffect} from 'react'
import {auth} from '../firebase.js'
import { Table, Tabs, Row, Tab, Col, Nav } from 'react-bootstrap'
import { MonthPicker } from "@mui/x-date-pickers/MonthPicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import Container from '@mui/material/Container';
import NewDataFromDateInterval from './DateInterval.tsx';
// import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar.js'



export default function Dashboard() {
const [responeDunning, setResponeDunning] = useState([])
const [responeActive, setResponeActive] = useState([])
const [responeRetained, setResponeRetained] = useState([])
const [responeOnhold, setResponeOnhold] = useState([])
const [response, setResponse] = useState([])
const [loading, setLoading] = useState(true);
const [date, setDate] = useState(new Date());
const minDate = new Date("2020-01-01T00:00:00.000");
const maxDate = new Date("2034-01-01T00:00:00.000");
  useEffect( () => {
      getData();
    }, [date]);

const dateFilter = () => {
  const newDunningList = NewDataFromDateInterval(response.Lalatoys.dunningList, date);
  const newDctiveDunning = NewDataFromDateInterval(response.Lalatoys.activeDunning, date);
  const newRetainedList = NewDataFromDateInterval(response.Lalatoys.retainedList, date);
  const newOnHoldList = NewDataFromDateInterval(response.Lalatoys.onHoldList, date);
 
  setResponeDunning(newDunningList)
  setResponeActive(newDctiveDunning);
  setResponeRetained(newRetainedList);
  setResponeOnhold(newOnHoldList);

}
const getData = async () => {
  setLoading(true);
  const token = await auth.currentUser.getIdToken(true);
  console.log(token)
  const headers = {
      'Authorization': `Bearer ${token}`
  }
  const data = await ( await fetch('https://europe-west2-churnr-system-development.cloudfunctions.net/slackApp/getData', {headers})).json();
  setResponse(data);
  const newDunningList = NewDataFromDateInterval(response.Lalatoys.dunningList, date);
  const newDctiveDunning = NewDataFromDateInterval(response.Lalatoys.activeDunning, date);
  const newRetainedList = NewDataFromDateInterval(response.Lalatoys.retainedList, date);
  const newOnHoldList = NewDataFromDateInterval(response.Lalatoys.onHoldList, date);
 
  setResponeDunning(newDunningList)
  setResponeActive(newDctiveDunning);
  setResponeRetained(newRetainedList);
  setResponeOnhold(newOnHoldList);
  setLoading(false);
}
return (    
  <>

  
<div style={{minHeight: "100vh"}}>
<Navbar/>
<Container maxWidth="xs">
<LocalizationProvider dateAdapter={AdapterDateFns}>
<MonthPicker date={date}
            minDate={minDate}
            maxDate={maxDate}
            onChange={(newDate) => setDate(newDate)} sx={{flexWrap: 'nowrap', justifyContent: 'space-around'}}/>
              </LocalizationProvider> 
  </Container>
{loading ? (<p>Loading...</p>) : (
<Container sx={{marginLeft: "0", width: "100vw"}}>
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
        <Tabs defaultActiveKey="dunnings" id="uncontrolled-tab-example" className="mb-3">
        <Tab eventKey="dunnings" title="Dunning">
  <Table striped bordered hover variant="dark" >
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
    {responeDunning.map((row, index) => {
        return (
        <tr key={"dunning"+ index + row?.last_name}>
        <td >{row?.first_name}</td>
        <td >{row?.last_name}</td>
        <td >{row?.email}</td>
        <td >{row?.phone}</td>        
        <td >{row?.handle}</td>      
        <td >{row?.errorState}</td>
        <td >{row?.error}</td>
        <td >{row?.ordertext +" " + Number(row?.amount)/100 + "kr"}</td>
        <td >{new Date(row?.created).toDateString()}</td>
        <td >{row?.settled_invoices}</td>
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
    {responeActive.map((row, index) => {
        return (
        <tr key={"active" + index + row?.first_name}>
        <td >{row?.first_name}</td>
        <td >{row?.last_name}</td>
        <td >{row.email}</td>
        <td >{row?.phone}</td>        
        <td >{row?.handle}</td>      
        <td >{row?.errorState}</td>
        <td >{row?.error}</td>
        <td >{row?.acquirer_message}</td>
        <td >{row?.ordertext}</td>
        <td >{Number(row?.amount)/100 +"kr"}</td>
        <td >{new Date(row?.created).toDateString()}</td>
        <td >{row?.settled_invoices}</td>     
        <td >{row?.emailCount}</td>
        <td >{row?.flowStartDate ? (new Date(row?.flowStartDate._seconds*1000).toDateString()) : <span>No date</span>}</td>
        <td >{ row?.activeFlow === true ? "Started" : "Endend"
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
    {responeRetained.map((row, index) => {
        return (
        <tr key={"retained" + index + row?.first_name}>
        <td >{row?.first_name}</td>
        <td >{row?.last_name}</td>
        <td >{row.email}</td>
        <td >{row?.phone}</td>        
        <td >{row?.handle}</td>      
        <td >{row?.errorState}</td>
        <td >{row?.error}</td>
        <td >{row?.acquirer_message ? row?.acquirer_message : "No message"}</td>
        <td >{row?.ordertext}</td>
        <td >{Number(row?.amount)/100 +"kr"}</td>
        <td >{new Date(row?.created).toDateString()}</td>
        <td >{row?.settled_invoices}</td>     
        <td >{row?.emailCount ? row?.emailCount : "No count"}</td>
        <td >{row?.flowStartDate ? (new Date(row?.flowStartDate._seconds*1000).toDateString()) : <span>No date</span>}</td>
        <td >{ row?.activeFlow ? "Started" : "Endend"
        }</td>
        <td key={"retaineddate" + index}>{new Date(row?.invoiceEndDate._seconds*1000).toDateString()}</td>
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
      <th>Onhold Date</th>
    </tr>
  </thead>
  <tbody>
    {responeOnhold.map((row, index) => {
        return (
        <tr key={"onHold" + index + row?.first_name}>
        <td >{row?.first_name}</td>
        <td >{row?.last_name}</td>
        <td >{row.email}</td>
        <td >{row?.phone}</td>        
        <td >{row?.handle}</td>      
        <td >{row?.errorState}</td>
        <td >{row?.error}</td>
        <td >{row?.acquirer_message  ? row?.acquirer_message : "No message"}</td>
        <td >{row?.ordertext}</td>
        <td >{Number(row?.amount)/100 +"kr"}</td>
        <td >{new Date(row?.created).toDateString()}</td>
        <td >{row?.settled_invoices}</td>     
        <td >{row?.emailCount  ? row?.emailCount : "No count"}</td>
        <td >{row?.flowStartDate  ? (new Date(row?.flowStartDate._seconds*1000).toDateString()) : <span>No date</span>}</td>
        <td >{ row?.activeFlow ? "Started" : "Endend"
        }</td>
        <td key={"ondholdDate" + index}>{new Date(row?.invoiceEndDate._seconds*1000).toDateString()}</td>
        </tr>
      )})}
      
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
</Container>
)}
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