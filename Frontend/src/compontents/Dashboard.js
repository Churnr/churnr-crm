import React, { useState, useEffect } from "react";
import { auth } from "../firebase.js";
import { Table, Tabs, TabContainer, Tab, Col, Nav } from "react-bootstrap";
import { MonthPicker } from "@mui/x-date-pickers/MonthPicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import { NewDataFromDateInterval, NewDataFromDateIntervalFromRetainedAndOnHold } from "./DateInterval.tsx";
// import { useNavigate } from 'react-router-dom'
import Navbar from "./Navbar.js";

export default function Dashboard() {
  const [responeDunning, setResponeDunning] = useState([]);
  const [responeActive, setResponeActive] = useState([]);
  const [responeRetained, setResponeRetained] = useState([]);
  const [responeOnhold, setResponeOnhold] = useState([]);
  const [monthlyReportExpired, setmonthlyReportExpired] = useState([]);
  const [monthlyReportNotRetained, setmonthlyReportNotRetained] = useState([]);
  const [monthlyReportRetained, setmonthlyReportRetained] = useState([]);
  const [monthlyReportOnhold, setmonthlyReportOnhold] = useState([]);
  const [monthlyRapportdata, setmonthlyRapportdata] = useState([]);
  const [monthlyReport, setMonthlyReport] = useState([]);
  const [response, setResponse] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isData, setisData] = useState(false);
  const [date, setDate] = useState(new Date());
  const minDate = new Date("2020-01-01T00:00:00.000");
  const maxDate = new Date("2034-01-01T00:00:00.000");
  useEffect(() => {
    if (isData === false) {
      getMonthlyRapport();
      getData();
    } else {
      dateFilter();
      
    }
  }, [date]);

  const getMonthlyRapport = async () => {
    setLoading(true);
    const token = await auth.currentUser.getIdToken(true);
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const dataMonthly = await (await fetch(
      "https://europe-west2-churnr-system.cloudfunctions.net/dataApi/getRapport",
      { headers }
      )
    ).json();
    setMonthlyReport(dataMonthly.Lalatoys[0]);
    setmonthlyReportNotRetained(dataMonthly.Lalatoys[0].notRetained);
    setmonthlyReportExpired(dataMonthly.Lalatoys[0].expired);
    setmonthlyReportRetained(dataMonthly.Lalatoys[0].retained);
    setmonthlyReportOnhold(dataMonthly.Lalatoys[0].onHold);
    setmonthlyRapportdata();
    setLoading(false);
  };

  const refreshData = async () => {
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
    const newRetainedList = NewDataFromDateIntervalFromRetainedAndOnHold(
      response.Lalatoys.retainedList,
      date
    );
    const newOnHoldList = NewDataFromDateIntervalFromRetainedAndOnHold(
      response.Lalatoys.onHoldList,
      date
    );
    setResponeDunning(newDunningList);
    setResponeActive(response.Lalatoys.activeDunning);
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
    const newRetainedList = NewDataFromDateIntervalFromRetainedAndOnHold(
      data.Lalatoys.retainedList,
      date
    );
    const newOnHoldList = NewDataFromDateIntervalFromRetainedAndOnHold(
      data.Lalatoys.onHoldList,
      date
    );

    setResponeDunning(newDunningList);
    setResponeActive(data.Lalatoys.activeDunning);
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
          <div style={{ minWidth: "100% !important", display: "flex", flexDirection: "row" }}>
            <TabContainer defaultActiveKey="first">
              <div className="left-pane" bsPrefix>
                <Nav variant="pills" className="flex-column">
                  <Nav.Item>
                    <Nav.Link eventKey="first">LalaToys</Nav.Link>
                  </Nav.Item>
                </Nav>
              </div>
              <div className="right-pane" style={{
                overflowX: "auto",
                overflowY: "hidden"
              }}>
                <Tab.Content>
                  <div></div>
                  <Tab.Pane eventKey="first" >
                    <Button
                      variant="contained"
                      onClick={refreshData}
                      color="success"
                    >
                      ⟳
                    </Button>

                    <Container maxWidth={"xs"}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <MonthPicker
                          date={date}
                          minDate={minDate}
                          maxDate={maxDate}
                          onChange={(newDate) => setDate(newDate)}
                          sx={{ flexWrap: "nowrap", justifyContent: "space-around" }}
                        />
                      </LocalizationProvider>
                    </Container>

                    <Tabs
                      defaultActiveKey="dunnings"
                      id="uncontrolled-tab-example"

                    >
                      <Tab eventKey="dunnings" title="Dunning">
                        <Table striped bordered hover variant="dark">
                          <thead>
                            <tr>
                              <th>First Name</th>
                              <th>Last Name</th>
                              <th>Email</th>
                              <th>Phone</th>
                              <th>Customer id</th>
                              <th>Invoice id</th>
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
                                <tr key={"dunning" + index + row?.last_name}>
                                  <td>{row?.first_name}</td>
                                  <td>{row?.last_name}</td>
                                  <td>{row?.email}</td>
                                  <td>{row?.phone}</td>
                                  <td>{row?.handle}</td>
                                  <td>{row?.invoice_id}</td>
                                  <td>{row?.errorState}</td>
                                  <td>{row?.error}</td>
                                  <td>
                                    {row?.ordertext +
                                      " " +
                                      Number(row?.amount) / 100 +
                                      "kr"}
                                  </td>
                                  <td>
                                    {new Date(row?.created).toDateString()}
                                  </td>
                                  <td>{row?.settled_invoices}</td>
                                </tr>
                              );
                            })}
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
                              <th>Invoice id</th>
                              <th>Error state</th>
                              <th>Error</th>
                              <th>Acquirer message</th>
                              <th>Order text</th>
                              <th>Order amount</th>
                              <th>Dunning created</th>
                              <th>Invoice settled</th>
                              <th>Flow Count</th>
                              <th>Flow Start Date</th>
                              <th>Flow Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {responeActive.map((row, index) => {
                              return (
                                <tr key={"active" + index + row?.first_name}>
                                  <td>{row?.first_name}</td>
                                  <td>{row?.last_name}</td>
                                  <td>{row.email}</td>
                                  <td>{row?.phone}</td>
                                  <td>{row?.handle}</td>
                                  <td>{row?.invoice_id}</td>
                                  <td>{row?.errorState}</td>
                                  <td>{row?.error}</td>
                                  <td>
                                    {row?.acquirer_message
                                      ? row?.acquirer_message
                                      : "No message"}
                                  </td>
                                  <td>{row?.ordertext}</td>
                                  <td>{Number(row?.amount) / 100 + "kr"}</td>
                                  <td>
                                    {new Date(row?.created).toDateString()}
                                  </td>
                                  <td>{row?.settled_invoices}</td>
                                  <td>
                                    {row?.flowCount
                                      ? row?.flowCount
                                      : "Flow begins tomorrow"}
                                  </td>
                                  <td>
                                    {row?.flowStartDate ? (
                                      new Date(
                                        row?.flowStartDate._seconds * 1000
                                      ).toDateString()
                                    ) : (
                                      <span>No date</span>
                                    )}
                                  </td>
                                  <td>
                                    {row?.activeFlow === true
                                      ? "Started"
                                      : "Endend"}
                                  </td>
                                </tr>
                              );
                            })}
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
                              <th>Invoice id</th>
                              <th>Error state</th>
                              <th>Error</th>
                              <th>Acquirer message</th>
                              <th>Order text</th>
                              <th>Order amount</th>
                              <th>Dunning created</th>
                              <th>Invoice settled</th>
                              <th>Flow Count</th>
                              <th>Flow Start Date</th>
                              <th>Flow Status</th>
                              <th>Retained Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {responeRetained.map((row, index) => {
                              return (
                                <tr key={"retained" + index + row?.first_name}>
                                  <td>{row?.first_name}</td>
                                  <td>{row?.last_name}</td>
                                  <td>{row.email}</td>
                                  <td>{row?.phone}</td>
                                  <td>{row?.handle}</td>
                                  <td>{row?.invoice_id}</td>
                                  <td>{row?.errorState}</td>
                                  <td>{row?.error}</td>
                                  <td>
                                    {row?.acquirer_message
                                      ? row?.acquirer_message
                                      : "No message"}
                                  </td>
                                  <td>{row?.ordertext}</td>
                                  <td>{Number(row?.amount) / 100 + "kr"}</td>
                                  <td>
                                    {new Date(row?.created).toDateString()}
                                  </td>
                                  <td>{row?.settled_invoices}</td>
                                  <td>
                                    {row?.flowCount
                                      ? row?.flowCount
                                      : "No count"}
                                  </td>
                                  <td>
                                    {row?.flowStartDate ? (
                                      new Date(
                                        row?.flowStartDate._seconds * 1000
                                      ).toDateString()
                                    ) : (
                                      <span>No date</span>
                                    )}
                                  </td>
                                  <td>
                                    {row?.activeFlow ? "Started" : "Endend"}
                                  </td>
                                  <td key={"retaineddate" + index}>
                                    {new Date(
                                      row?.invoiceEndDate._seconds * 1000
                                    ).toDateString()}
                                  </td>
                                </tr>
                              );
                            })}
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
                              <th>Invoice id</th>
                              <th>Error state</th>
                              <th>Error</th>
                              <th>Acquirer message</th>
                              <th>Order text</th>
                              <th>Order amount</th>
                              <th>Dunning created</th>
                              <th>Invoice settled</th>
                              <th>Flow Count</th>
                              <th>Flow Start Date</th>
                              <th>Flow Status</th>
                              <th>Onhold Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {responeOnhold.map((row, index) => {
                              return (
                                <tr key={"onHold" + index + row?.first_name}>
                                  <td>{row?.first_name}</td>
                                  <td>{row?.last_name}</td>
                                  <td>{row.email}</td>
                                  <td>{row?.phone}</td>
                                  <td>{row?.handle}</td>
                                  <td>{row?.invoice_id}</td>
                                  <td>{row?.errorState}</td>
                                  <td>{row?.error}</td>
                                  <td>
                                    {row?.acquirer_message
                                      ? row?.acquirer_message
                                      : "No message"}
                                  </td>
                                  <td>{row?.ordertext}</td>
                                  <td>{Number(row?.amount) / 100 + "kr"}</td>
                                  <td>
                                    {new Date(row?.created).toDateString()}
                                  </td>
                                  <td>{row?.settled_invoices}</td>
                                  <td>
                                    {row?.flowCount
                                      ? row?.flowCount
                                      : "No count"}
                                  </td>
                                  <td>
                                    {row?.flowStartDate ? (
                                      new Date(
                                        row?.flowStartDate._seconds * 1000
                                      ).toDateString()
                                    ) : (
                                      <span>No date</span>
                                    )}
                                  </td>
                                  <td>
                                    {row?.activeFlow ? "Started" : "Endend"}
                                  </td>
                                  <td key={"ondholdDate" + index}>
                                    {new Date(
                                      row?.invoiceEndDate._seconds * 1000
                                    ).toDateString()}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      </Tab>
                      <Tab eventKey="redunning" title="Redunning" disabled>
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
                          </tbody>
                        </Table>
                      </Tab>
                      <Tab eventKey="dialog" title="Dialog" disabled>
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
                          </tbody>
                        </Table>
                      </Tab>
                      <Tab eventKey="monthlyReport" title="Månedsrapport">
                        <Table striped bordered hover variant="dark">
                          <thead>
                            <tr>
                              <th>Total dunning</th>
                              <th>Total fastholdte</th>
                              <th>Total onhold</th>
                              <th>Total ikke fastholdte</th>
                              <th>Total expired</th>
                              <th>totalGrossIncome</th>
                              <th>Retetention rate</th>
                              <th>Date</th>
                            </tr>
                          </thead>
                          <tbody>
                          <tr key={"monthlyReport" + monthlyReport?.totalDunning}>
                                  <td>{monthlyReport?.totalDunning}</td>
                                  <td>{monthlyReportRetained.length}</td>
                                  <td>{monthlyReportOnhold.length}</td>
                                  <td>{monthlyReportNotRetained.length}</td>
                                  <td>{monthlyReportExpired.length}</td>
                                  <td>{monthlyReport?.totalGrossIncome}</td>
                                  <td>{Math.round((monthlyReportRetained.length)/(monthlyReport?.totalDunning)*100)}%</td>
                                  <td>{monthlyReport?.date}</td>
                                </tr>
                          </tbody>
                        </Table>
                        <Table striped bordered hover variant="dark">
                          <thead>
                            <tr>
                              <th>Not retained</th>
                              <th>Name</th>
                              <th>Customer ID</th>
                              <th>Phone count</th>
                              <th>E-mail count</th>
                              <th>Flow status</th>
                            </tr>
                          </thead>
                          <tbody>
                          {monthlyReportNotRetained.map((row, index) => {
                              return (
                                <tr key={"NotRetained " + row?.firstName + row?.lastName}>
                                  <td >{index}</td>
                                  <td >{row?.firstName  +" "+ row?.lastName}</td>
                                  <td>{row?.customerId}</td>
                                  <td>{row?.phoneCount}</td>
                                  <td>{row?.emailCount}</td>
                                  <td>{row?.flowStatus}</td>
                                </tr>

                              )
                            })}
                          </tbody>
                        </Table>
                        <Table striped bordered hover variant="dark">
                          <thead>
                            <tr>
                              <th>Retained</th>
                              <th>Name</th>
                              <th>Customer ID</th>
                              <th>Value retained</th>
                              <th>Date retained</th>
                            </tr>
                          </thead>
                          <tbody> 
                            {monthlyReportRetained.map((row, index) => {
                              return (
                                <tr key={"monthlyReportRetained" + row?.firstName + row?.lastName}>
                                  <td >{index}</td>
                                  <td >{row?.firstName  +" "+ row?.lastName}</td>
                                  <td>{row?.customerId}</td>
                                  <td>{row?.invoiceValue}</td>
                                  <td> {new Date(
                                      row?.retainedDate._seconds * 1000
                                    ).toDateString()}</td>
                                </tr>

                              )
                            })}
                          </tbody>

                        </Table>
                        <Table striped bordered hover variant="dark">
                          <thead>
                            <tr>
                              <th>On hold</th>
                              <th>Name</th>
                              <th>Customer ID</th>
                              <th>Customer created</th>
                              <th>On hold date</th>
                            </tr>
                          </thead>
                          <tbody>
                          {monthlyReportOnhold.map((row, index) => {
                              return (
                                <tr key={"monthlyReportOnhold" + row?.firstName + row?.lastName}>
                                  <td >{index}</td>
                                  <td >{row?.firstName  +" "+ row?.lastName}</td>
                                  <td>{row?.customerId}</td>
                                  <td>{new Date(
                                      row?.customerCreated
                                    ).toDateString()}</td>
                                  <td> {new Date(
                                      row?.onHoldDate._seconds * 1000
                                    ).toDateString()}</td>
                                </tr>

                              )
                            })}
                          </tbody>
                        </Table>
                        <Table striped bordered hover variant="dark">
                          <thead>
                            <tr>
                              <th>Expired</th>
                              <th>Name</th>
                              <th>Customer ID</th>
                              <th>Customer created</th>
                              <th>Date of expiration</th>
                            </tr>
                          </thead>
                          <tbody>
                          {monthlyReportExpired.map((row, index) => {
                              return (
                                <tr key={"monthlyReportExpired" + row?.firstName + row?.lastName}>
                                  <td >{index}</td>
                                  <td >{row?.firstName +" "+ row?.lastName}</td>
                                  <td>{row?.customerId}</td>
                                  <td> {new Date(
                                      row?.customerCreated
                                    ).toDateString()}</td>
                                  <td> {new Date(
                                      row?.expiredDate._seconds * 1000
                                    ).toDateString()}</td>
                                 
                                </tr>

                              )
                            })}
                          </tbody>
                        </Table>

                      </Tab>
                    </Tabs>
                  </Tab.Pane>
                </Tab.Content>
              </div>
            </TabContainer></div>
        )}
      </div>
    </>
  );
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
