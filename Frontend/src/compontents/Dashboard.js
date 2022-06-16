import React, { useState, useEffect } from "react";
import { auth } from "../firebase.js";
// import { Table, Tabs, TabContainer, Tab, Col, Nav } from "react-bootstrap";
import { Tabs, TabList, TabPanels, Tab, TabPanel, IconButton } from '@chakra-ui/react'
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Select,
} from '@chakra-ui/react'
import { RepeatIcon } from '@chakra-ui/icons'
// import { MonthPicker } from "@mui/x-date-pickers/MonthPicker";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
// import Button from "@mui/material/Button";
// import Container from "@mui/material/Container";
import NewDataFromDateInterval from "./DateInterval.tsx";

// import { useNavigate } from 'react-router-dom'
import Navbar from "./Navbar.js";

export default function Dashboard() {
  const [responeDunning, setResponeDunning] = useState([]);
  const [responeActive, setResponeActive] = useState([]);
  const [responeRetained, setResponeRetained] = useState([]);
  const [responeOnhold, setResponeOnhold] = useState([]);
  const [response, setResponse] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isData, setisData] = useState(false);
  const [date, setDate] = useState(new Date());
  const minDate = new Date("2020-01-01T00:00:00.000");
  const maxDate = new Date("2034-01-01T00:00:00.000");
  useEffect(() => {
    if (isData === false) {
      getData();
      // setLoading(false);
    } else {
      dateFilter();
    }
  }, [date]);

  const refreshData = async () => {
    console.log("WHAT");
    const token = await auth.currentUser.getIdToken(true);
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    await fetch(
      "https://europe-west2-churnr-system.cloudfunctions.net/dataApi/refresh",
      { headers }
    );
  };
  const dateFilter = () => {
    const newDunningList = NewDataFromDateInterval(
      response.Lalatoys.dunningList,
      date
    );
    const newDctiveDunning = NewDataFromDateInterval(
      response.Lalatoys.activeDunning,
      date
    );
    const newRetainedList = NewDataFromDateInterval(
      response.Lalatoys.retainedList,
      date
    );
    const newOnHoldList = NewDataFromDateInterval(
      response.Lalatoys.onHoldList,
      date
    );

    setResponeDunning(newDunningList);
    setResponeActive(newDctiveDunning);
    setResponeRetained(newRetainedList);
    setResponeOnhold(newOnHoldList);
  };
  const getData = async () => {
    setLoading(true);
    const token = await auth.currentUser.getIdToken(true);
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const data = await (
      await fetch(
        "https://europe-west2-churnr-system.cloudfunctions.net/dataApi/getData",
        { headers }
      )
    ).json();
    setResponse(data);
    const newDunningList = NewDataFromDateInterval(
      data.Lalatoys.dunningList,
      date
    );
    const newDctiveDunning = NewDataFromDateInterval(
      data.Lalatoys.activeDunning,
      date
    );
    const newRetainedList = NewDataFromDateInterval(
      data.Lalatoys.retainedList,
      date
    );
    const newOnHoldList = NewDataFromDateInterval(
      data.Lalatoys.onHoldList,
      date
    );

    setResponeDunning(newDunningList);
    setResponeActive(newDctiveDunning);
    setResponeRetained(newRetainedList);
    setResponeOnhold(newOnHoldList);
    setisData(true);
    setLoading(false);
  };
  return (
    <>
      <div>
        <Navbar />

        {/* Date picker */}
        {loading ? (
          <p>Loading...</p>
        ) : ( 
          <div style={{display:"flex !important", flexDirection: "column"}}>
        {/* <Container maxWidth={"xs"}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <MonthPicker
            date={date}
            minDate={minDate}
            maxDate={maxDate}
            onChange={(newDate) => setDate(newDate)}
            sx={{ flexWrap: "nowrap", justifyContent: "space-around" }}
          />
        </LocalizationProvider>
      </Container> */}
      <Tabs>
  <div className="select-controller" style={{display: "flex", flexDirection: "row"}}>
    <Select>
    <option value='LalaToys'>LalaToys</option>
    <option value='Spiritium'>Spiritium</option>
  </Select>
  <Select>
    <option value='LalaToys'>Dunning</option>
    <option value='Spiritium'>Active dunning</option>
    <option value='Spiritium'>Retained</option>
    <option value='Spiritium'>Onhold</option>
    <option value='Spiritium'>Redunning</option>
    <option value='Spiritium'>Dialog</option>
    <option value='Spiritium'>Månedsrapport</option>
  </Select>
  <Select>
    <option value='#'>Januar</option>
    <option value='#'>Februar</option>
    <option value='#'>Marts</option>
    <option value='#'>April</option>
    <option value='#'>Maj</option>
    <option value='#'>Juni</option>
    <option value='#'>Juli</option>
    <option value='#'>August</option>
    <option value='#'>September</option>
    <option value='#'>Oktober</option>
    <option value='#'>November</option>
    <option value='#'>December</option>
  </Select>
   <IconButton  bgColor='blue.200'  icon={<RepeatIcon />}></IconButton>
  </div>
  <TabList style={{display:"flex", flexDirection: "column"}}>
  
  <TableContainer>
  <Table variant='striped' bgColor='blue.50' colorScheme='blue'>
    <Thead bgColor='gray.100' >
    <Tr>
        <Th>First Name</Th>
        <Th>Last Name</Th>
        <Th>Email</Th>
        <Th>Phone</Th>
        <Th>Customer id</Th>
        <Th>Error state</Th>
        <Th>Error</Th>
        <Th>Order</Th>
        <Th>Dunning created</Th>
        <Th>Invoice settled</Th>
      </Tr>
    </Thead>
    <Tbody>
    {responeActive.map((row, index) => {
                   return (
                     <Tr key={"dunning" + index + row?.last_name}>
                       <Td>{row?.first_name}</Td>
                       <Td>{row?.last_name}</Td>
                       <Td>{row?.email}</Td>
                       <Td>{row?.phone}</Td>
                       <Td>{row?.handle}</Td>
                       <Td>{row?.errorState}</Td>
                       <Td>{row?.error}</Td>
                       <Td>
                         {row?.ordertext +
                           " " +
                           Number(row?.amount) / 100 +
                           "kr"}
                       </Td>
                       <Td>
                         {new Date(row?.created).toDateString()}
                       </Td>
                       <Td>{row?.settled_invoices}</Td>
                     </Tr>
                   );
                 })}
    </Tbody>
  </Table>
</TableContainer></TabList>
</Tabs>
</div>
        )}
      </div>
    </>
  );
}

/*
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
//  <div style={{ minWidth: "100% !important", display: "flex", flexDirection: "row" }}>
//  <TabContainer defaultActiveKey="first">
//    <div className="left-pane" bsPrefix>
//      <Nav variant="pills" className="flex-column">
//        <Nav.Item>
//          <Nav.Link eventKey="first">LalaToys</Nav.Link>
//        </Nav.Item>
//        <Nav.Item>
//          <Nav.Link eventKey="second">Spiritium</Nav.Link>
//        </Nav.Item>
//      </Nav>
//    </div>
//    <div className="right-pane" style={{
//      overflowX: "auto",
//      overflowY: "hidden"
//    }}>
//      <Tab.Content>
//        <div></div>
//        <Tab.Pane eventKey="first" >
         

     

//          <Tabs
//            defaultActiveKey="dunnings"
//            id="uncontrolled-tab-example"
//            variant="pills"

//          >
//            <Tab eventKey="dunnings" title="Dunning">
//              <Table striped bordered hover variant="dark">
//                <thead>
//                  <tr>
//                    <th>First Name</th>
//                    <th>Last Name</th>
//                    <th>Email</th>
//                    <th>Phone</th>
//                    <th>Customer id</th>
//                    <th>Error state</th>
//                    <th>Error</th>
//                    <th>Order</th>
//                    <th>Dunning created</th>
//                    <th>Invoice settled</th>
                   
//                  </tr>
//                </thead>
//                <tbody>
//                  {responeDunning.map((row, index) => {
//                    return (
//                      <tr key={"dunning" + index + row?.last_name}>
//                        <td>{row?.first_name}</td>
//                        <td>{row?.last_name}</td>
//                        <td>{row?.email}</td>
//                        <td>{row?.phone}</td>
//                        <td>{row?.handle}</td>
//                        <td>{row?.errorState}</td>
//                        <td>{row?.error}</td>
//                        <td>
//                          {row?.ordertext +
//                            " " +
//                            Number(row?.amount) / 100 +
//                            "kr"}
//                        </td>
//                        <td>
//                          {new Date(row?.created).toDateString()}
//                        </td>
//                        <td>{row?.settled_invoices}</td>
//                      </tr>
//                    );
//                  })}
//                </tbody>
//              </Table>
//            </Tab>
//            <Tab eventKey="dunning" title="Active Dunning">
//              <Table striped bordered hover variant="dark">
//                <thead>
//                  <tr>
//                    <th>First Name</th>
//                    <th>Last Name</th>
//                    <th>Email</th>
//                    <th>Phone</th>
//                    <th>Customer id</th>
//                    <th>Error state</th>
//                    <th>Error</th>
//                    <th>Acquirer message</th>
//                    <th>Order text</th>
//                    <th>Order amount</th>
//                    <th>Dunning created</th>
//                    <th>Invoice settled</th>
//                    <th>Flow Count</th>
//                    <th>Flow Start Date</th>
//                    <th>Flow Status</th>
//                  </tr>
//                </thead>
//                <tbody>
//                  {responeActive.map((row, index) => {
//                    return (
//                      <tr key={"active" + index + row?.first_name}>
//                        <td>{row?.first_name}</td>
//                        <td>{row?.last_name}</td>
//                        <td>{row.email}</td>
//                        <td>{row?.phone}</td>
//                        <td>{row?.handle}</td>
//                        <td>{row?.errorState}</td>
//                        <td>{row?.error}</td>
//                        <td>
//                          {row?.acquirer_message
//                            ? row?.acquirer_message
//                            : "No message"}
//                        </td>
//                        <td>{row?.ordertext}</td>
//                        <td>{Number(row?.amount) / 100 + "kr"}</td>
//                        <td>
//                          {new Date(row?.created).toDateString()}
//                        </td>
//                        <td>{row?.settled_invoices}</td>
//                        <td>
//                          {row?.flowCount
//                            ? row?.flowCount
//                            : "Flow begins tomorrow"}
//                        </td>
//                        <td>
//                          {row?.flowStartDate ? (
//                            new Date(
//                              row?.flowStartDate._seconds * 1000
//                            ).toDateString()
//                          ) : (
//                            <span>No date</span>
//                          )}
//                        </td>
//                        <td>
//                          {row?.activeFlow === true
//                            ? "Started"
//                            : "Endend"}
//                        </td>
//                      </tr>
//                    );
//                  })}
//                </tbody>
//              </Table>
//            </Tab>

//            <Tab eventKey="retained" title="Retained">
//              <Table striped bordered hover variant="dark">
//                <thead>
//                  <tr>
//                    <th>First Name</th>
//                    <th>Last Name</th>
//                    <th>Email</th>
//                    <th>Phone</th>
//                    <th>Customer id</th>
//                    <th>Error state</th>
//                    <th>Error</th>
//                    <th>Acquirer message</th>
//                    <th>Order text</th>
//                    <th>Order amount</th>
//                    <th>Dunning created</th>
//                    <th>Invoice settled</th>
//                    <th>Flow Count</th>
//                    <th>Flow Start Date</th>
//                    <th>Flow Status</th>
//                    <th>Retained Date</th>
//                  </tr>
//                </thead>
//                <tbody>
//                  {responeRetained.map((row, index) => {
//                    return (
//                      <tr key={"retained" + index + row?.first_name}>
//                        <td>{row?.first_name}</td>
//                        <td>{row?.last_name}</td>
//                        <td>{row.email}</td>
//                        <td>{row?.phone}</td>
//                        <td>{row?.handle}</td>
//                        <td>{row?.errorState}</td>
//                        <td>{row?.error}</td>
//                        <td>
//                          {row?.acquirer_message
//                            ? row?.acquirer_message
//                            : "No message"}
//                        </td>
//                        <td>{row?.ordertext}</td>
//                        <td>{Number(row?.amount) / 100 + "kr"}</td>
//                        <td>
//                          {new Date(row?.created).toDateString()}
//                        </td>
//                        <td>{row?.settled_invoices}</td>
//                        <td>
//                          {row?.flowCount
//                            ? row?.flowCount
//                            : "No count"}
//                        </td>
//                        <td>
//                          {row?.flowStartDate ? (
//                            new Date(
//                              row?.flowStartDate._seconds * 1000
//                            ).toDateString()
//                          ) : (
//                            <span>No date</span>
//                          )}
//                        </td>
//                        <td>
//                          {row?.activeFlow ? "Started" : "Endend"}
//                        </td>
//                        <td key={"retaineddate" + index}>
//                          {new Date(
//                            row?.invoiceEndDate._seconds * 1000
//                          ).toDateString()}
//                        </td>
//                      </tr>
//                    );
//                  })}
//                </tbody>
//              </Table>
//            </Tab>
//            <Tab eventKey="onhold" title="Onhold">
//              <Table striped bordered hover variant="dark">
//                <thead>
//                  <tr>
//                    <th>First Name</th>
//                    <th>Last Name</th>
//                    <th>Email</th>
//                    <th>Phone</th>
//                    <th>Customer id</th>
//                    <th>Error state</th>
//                    <th>Error</th>
//                    <th>Acquirer message</th>
//                    <th>Order text</th>
//                    <th>Order amount</th>
//                    <th>Dunning created</th>
//                    <th>Invoice settled</th>
//                    <th>Flow Count</th>
//                    <th>Flow Start Date</th>
//                    <th>Flow Status</th>
//                    <th>Onhold Date</th>
//                  </tr>
//                </thead>
//                <tbody>
//                  {responeOnhold.map((row, index) => {
//                    return (
//                      <tr key={"onHold" + index + row?.first_name}>
//                        <td>{row?.first_name}</td>
//                        <td>{row?.last_name}</td>
//                        <td>{row.email}</td>
//                        <td>{row?.phone}</td>
//                        <td>{row?.handle}</td>
//                        <td>{row?.errorState}</td>
//                        <td>{row?.error}</td>
//                        <td>
//                          {row?.acquirer_message
//                            ? row?.acquirer_message
//                            : "No message"}
//                        </td>
//                        <td>{row?.ordertext}</td>
//                        <td>{Number(row?.amount) / 100 + "kr"}</td>
//                        <td>
//                          {new Date(row?.created).toDateString()}
//                        </td>
//                        <td>{row?.settled_invoices}</td>
//                        <td>
//                          {row?.flowCount
//                            ? row?.flowCount
//                            : "No count"}
//                        </td>
//                        <td>
//                          {row?.flowStartDate ? (
//                            new Date(
//                              row?.flowStartDate._seconds * 1000
//                            ).toDateString()
//                          ) : (
//                            <span>No date</span>
//                          )}
//                        </td>
//                        <td>
//                          {row?.activeFlow ? "Started" : "Endend"}
//                        </td>
//                        <td key={"ondholdDate" + index}>
//                          {new Date(
//                            row?.invoiceEndDate._seconds * 1000
//                          ).toDateString()}
//                        </td>
//                      </tr>
//                    );
//                  })}
//                </tbody>
//              </Table>
//            </Tab>
//            <Tab eventKey="redunning" title="Redunning">
//              <Table striped bordered hover variant="dark">
//                <thead>
//                  <tr>
//                    <th>First Name</th>
//                    <th>Last Name</th>
//                    <th>Username</th>
//                    <th>Email template</th>
//                  </tr>
//                </thead>
//                <tbody>
               
//                </tbody>
//              </Table>
//            </Tab>
//            <Tab eventKey="dialog" title="Dialog">
//              <Table striped bordered hover variant="dark">
//                <thead>
//                  <tr>
//                    <th>First Name</th>
//                    <th>Last Name</th>
//                    <th>Username</th>
//                    <th>Email template</th>
//                  </tr>
//                </thead>
//                <tbody>
               
//                </tbody>
//              </Table>
//            </Tab>
//            <Tab eventKey="Refresh" title="Refresh">
//              <Table striped bordered hover variant="dark">
//              <Button
//            variant="contained"
//            onClick={refreshData}
//            color="success"
//          >
//            ⟳
//          </Button>
//              </Table>
//            </Tab>
//          </Tabs>
         
//        </Tab.Pane>
//        <Tab.Pane eventKey="second">
//          <Tabs
//            defaultActiveKey="profile"
//            id="uncontrolled-tab-example"
//            className="mb-3"
//          >
//            <Tab eventKey="dunning" title="Active Dunning">
//              <Table striped bordered hover variant="dark">
//                <thead>
//                  <tr>
//                    <th>First Name</th>
//                    <th>Last Name</th>
//                    <th>Username</th>
//                    <th>Email template</th>
//                  </tr>
//                </thead>
//                <tbody>
                
//                </tbody>
//              </Table>
//            </Tab>
//            <Tab eventKey="retained" title="Retained">
//              <Table striped bordered hover variant="dark">
//                <thead>
//                  <tr>
//                    <th>First Name</th>
//                    <th>Last Name</th>
//                    <th>Username</th>
//                    <th>Email template</th>
//                  </tr>
//                </thead>
//                <tbody>
                 
//                </tbody>
//              </Table>
//            </Tab>
//            <Tab eventKey="onhold" title="Onhold">
//              <Table striped bordered hover variant="dark">
//                <thead>
//                  <tr>
//                    <th>First Name</th>
//                    <th>Last Name</th>
//                    <th>Username</th>
//                    <th>Email template</th>
//                  </tr>
//                </thead>
//                <tbody>
                 
//                </tbody>
//              </Table>
//            </Tab>
//            <Tab eventKey="redunning" title="Redunning">
//              <Table striped bordered hover variant="dark">
//                <thead>
//                  <tr>
//                    <th>First Name</th>
//                    <th>Last Name</th>
//                    <th>Username</th>
//                    <th>Email template</th>
//                  </tr>
//                </thead>
//                <tbody>
                
//                </tbody>
//              </Table>
//            </Tab>
//            <Tab eventKey="dialog" title="Dialog">
//              <Table striped bordered hover variant="dark">
//                <thead>
//                  <tr>
//                    <th>First Name</th>
//                    <th>Last Name</th>
//                    <th>Username</th>
//                    <th>Email template</th>
//                  </tr>
//                </thead>
//                <tbody>
//                            </tbody>
//              </Table>
//            </Tab>
           

//          </Tabs>
         
//        </Tab.Pane>
//      </Tab.Content>
//    </div>
//  </TabContainer></div>