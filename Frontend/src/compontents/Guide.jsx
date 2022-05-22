/* eslint-disable jsx-a11y/alt-text */
import React  from 'react'

// import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar.js'



export default function Guide() {

return (    
  <>
{/* <button onClick={handleSubmit}>click me</button> */}
  
<div style={{minHeight: "100vh"}}>
<Navbar/>
<div className="guideText">
  <h3>Slack commands:</h3>
  <p>1: Inde i slack kan man køre forskellige commands til at aktivere et flow og oprette et firma til churnr.<br/>
    For at aktivere et flow går man ind på churnrs slack herefter skal man indsætte churnr cystem appen.<br/><br/>2: Tryk derfor på plus knappen vist på billedet nedenunder</p>
  <img className="imageGuide" src={require('../images/appAdd.PNG')} />
  <p>3: Der vil nu komme et nyt vindue hvor man kan browse, der skal man søge efter Churnr System og klikke på den</p>
  <img className="imageGuide" src={require('../images/browseAdd.PNG')} />
  <p>4: Efter man har klikken på appen, åbner appen, og man kan derefter trykke på about</p>
  <img className="imageGuide" src={require('../images/Capture.PNG')} />
  <p>5: Her har man så de slack commands der er på appen, ved at klikke på en af dem skrives commandoen ned i textfeltet, her trykker man på Enter/sender beskeden.</p>
  <img className="imageGuide" src={require('../images/activateFlow.PNG')} />
  <p>6: Der åbner nu et vindue op, som du kan udfylde med den nødvendige tekst.</p>
  <p>7: Hvis der kommer en fejlmeddelse frem, men du kan se du har fået en besked fra appen som vist på billedet under, så tryk bare cancel, så snart du har fået besked er processen klaret.</p>
  <img className="imageGuide" src={require('../images/besked.PNG')} />
  <p>Fejlbeskeden i vinduet ser sådan her ud:</p>
  <img className="imageGuide" src={require('../images/fejlbesked.PNG')} />
  <p>8: Hvis beskeden i chatten ikke ligner den der er på billedet længere oppe og ikke er beskrivende om hvad er gået galt, så kontant support.</p>
  <p> Eksempelvis som den her:</p>
  <img className="imageGuide" src={require('../images/fejlbeskedchat.PNG')} />
</div>

</div>
    </>
  )
}
