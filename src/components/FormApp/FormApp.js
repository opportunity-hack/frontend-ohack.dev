import React,{useState} from 'react'

const FormApp = () => {







    const [email, setEmail] = useState('');
    const [understand, setUnderstand] = useState(false);
    const [charity, setCharity] = useState('');
    const [selectedAreas, setSelectedAreas] = useState([]);
    const [populations, setPopulations] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [phoneNumbers, setPhoneNumbers] = useState([]);
    const [summary, setSummary] = useState('');
    const [techProblem, setTechProblem] = useState('')
    const [mission, setMission] = useState('')
    const [isFamiliar, setIsFamiliar] = useState(null);
    const [availability, setAvailability] = useState([]);
    

  
    const handleEmailChange = (e) => {
      setEmail(e.target.value);
    };
  
    const handleUnderstandChange = (e) => {
      setUnderstand(e.target.checked);
    };
  
    const handleCharityChange = (e) => {
      setCharity(e.target.value);
    };
  
    const handleAreaSelection = (e) => {
      const value = e.target.value;
      if (selectedAreas.includes(value)) {
        setSelectedAreas(selectedAreas.filter((f) => f !== value));
      } else {
        setSelectedAreas([...selectedAreas, value]);
      }
    };
  
    const handlePopulationsChange = (e) => {
      const value = e.target.value;
      if (populations.includes(value)) {
        setPopulations(populations.filter((p) => p !== value));
      } else {
        setPopulations([...populations, value]);
      }
    };
  
    const handleContactsChange = (e, i) => {
      const value = e.target.value;
      const updatedContacts = [...contacts];
      updatedContacts[i] = value;
      setContacts(updatedContacts);
    };
  
    const handlePhoneNumbersChange = (e, i) => {
      const value = e.target.value;
      const updatedPhoneNumbers = [...phoneNumbers];
      updatedPhoneNumbers[i] = value;
      setPhoneNumbers(updatedPhoneNumbers);
    };
  
    const handleSummaryChange = (e) => {
      setSummary(e.target.value);
    };

    const handleTechProblemChange = (e) => {
        setTechProblem(e.target.value);
    };

    const handleMissionChange = (e) => {
        setMission(e.target.value);
    };

    const handleYesClick = () => setIsFamiliar(true);
    const handleNoClick = () => setIsFamiliar(false);

    const handleAvailability = (e) => {
        const value = e.target.value;
        if (availability.includes(value)) {
          setAvailability(availability.filter((f) => f !== value));
        } else {
            setAvailability([...availability, value]);
        }
      };
  
    const handleSubmit = (e) => {
      e.preventDefault();
      console.log({
        email,
        understand,
        charity,
        focus,
        populations,
        contacts,
        phoneNumbers,
        summary
      });
    };








  return (
    <div className="App">
      <header className="App-header">
        <h1>Nonprofit Application - Opportunity Hack 2021</h1>
        <p>Last day for submissions: September 30th</p>
      </header>
      <form onSubmit={handleSubmit}>
        {/* Email */}
        <h2>Email</h2>
        <label>
          Email <span>*</span>
        </label>
        <input type="email" value={email} onChange={handleEmailChange} required />
        {/* Project transparency */}
        <h2>Terms</h2>
        <label>
          Complete transparency: Not all projects will be completed after the hackathon
        </label>
        <div className="checkbox">
          <input type="checkbox" checked={understand} onChange={handleUnderstandChange} required />
          <span>I understand that my project may not be completed during this hackathon</span>
        </div>
        {/* Name of Charity */}
        <h2>Charity</h2>
        <label>
          Name of Charity Organization <span>*</span>
        </label>
        <input type="text" value={charity} onChange={handleCharityChange} required />
        {/* Area of Non-profit */}
        <div>
            <h2>Areas of focus for your non-profit?</h2>
            <label>
                <input
                type="checkbox"
                name="area"
                value="Economic Empowerment"
                onChange={handleAreaSelection}
                />
                Economic Empowerment
            </label>
            <br />
            <label>
                <input
                type="checkbox"
                name="area"
                value="Education"
                onChange={handleAreaSelection}
                />
                Education
            </label>
            <br />
            <label>
                <input
                type="checkbox"
                name="area"
                value="Environmental Sustainability"
                onChange={handleAreaSelection}
                />
                Environmental Sustainability
            </label>
            <br />
            <label>
                <input
                type="checkbox"
                name="area"
                value="Career Mentoring"
                onChange={handleAreaSelection}
                />
                Career Mentoring
            </label>
            <br />
            <label>
                <input
                type="checkbox"
                name="area"
                value="Hunger & Homelessness"
                onChange={handleAreaSelection}
                />
                Hunger & Homelessness
            </label>
            <br />
            <label>
                <input
                type="checkbox"
                name="area"
                value="Arts & Culture"
                onChange={handleAreaSelection}
                />
                Arts & Culture
            </label>
            <br />
            <label>
                <input
                type="checkbox"
                name="area"
                value="Health and Human Services"
                onChange={handleAreaSelection}
                />
                Health and Human Services
            </label>
            <br />
            <label>
                <input
                type="checkbox"
                name="area"
                value="Animals"
                onChange={handleAreaSelection}
                />
                Animals
            </label>
            <br />
            <label>
                <input
                type="checkbox"
                name="area"
                value="Other areas"
                onChange={handleAreaSelection}
                />
                Other areas
            </label>
            <br />
            <p>Selected areas: {selectedAreas.join(", ")}</p>
        </div>
        {/* Serving population */}
        <div>
        <h2>Does your organization or program serve a majority (51% or more) of any of the following populations?</h2>
      <label>
        Women
        <input
          type="checkbox"
          name="women"
          checked={populations.women}
          onChange={handlePopulationsChange}
          />
      </label>
      <label>
        Black
        <input
          type="checkbox"
          name="black"
          checked={populations.black}
          onChange={handlePopulationsChange}
        />
      </label>
      <label>
        Indigenous
        <input
          type="checkbox"
          name="indigenous"
          checked={populations.indigenous}
          onChange={handlePopulationsChange}
        />
      </label>
      <label>
        Asian
        <input
          type="checkbox"
          name="asian"
          checked={populations.asian}
          onChange={handlePopulationsChange}
        />
      </label>
      <label>
        LatinX
        <input
          type="checkbox"
          name="latinX"
          checked={populations.latinX}
          onChange={handlePopulationsChange}
        />
      </label>
      <label>
        Disabled
        <input
          type="checkbox"
          name="disabled"
          checked={populations.disabled}
          onChange={handlePopulationsChange}
        />
      </label>
      <label>
        LGBTQIA+
        <input
          type="checkbox"
          name="lgbtqia"
          checked={populations.lgbtqia}
          onChange={handlePopulationsChange}
        />
      </label>
      <label>
        Veterans
        <input
          type="checkbox"
          name="veterans"
          checked={populations.veterans}
          onChange={handlePopulationsChange}
        />
      </label>
      <label>
        Immigrants/Refugees
        <input
          type="checkbox"
          name="immigrants"
          checked={populations.immigrants}
          onChange={handlePopulationsChange}
        />
      </label>
      <label>
        Other
        <input
          type="checkbox"
          name="other"
          checked={populations.other}
          onChange={handlePopulationsChange}
        />
      </label>
        </div>
        {/* Contact People */}
        <div>
            <h2>
            Contact People <span>*</span>
            </h2>   
            Who is the best person we can contact to better understand your problem statements?  
            Feel free to include as many people as possible.
            <input type="text" value={contacts} onChange={handleContactsChange} required />
        </div>
        {/* Contact Numbers */}
        <div>
            <h2>
            Contact phone numbers(s)<span>*</span>
            </h2>   
            We'd like to ensure our hackers (the people writing the code) have your contact information for 
            any questions they have, we'd also like to have this number so that we can reach out to you 
            before you are able to join us on Slack. Feel free to include as many phone numbers as possible.
            <input type="text" value={phoneNumbers} onChange={handlePhoneNumbersChange} required />
        </div>
        {/* Summary */}
        <div>
            <h2>
                Summary
            </h2>
            <label>
            Please provide a brief summary or your organization’s purpose and history.<span>*</span>
            </label>
            Feel free to include a link to this if it's easier for us to read it on your website or social media account   
            <input type="textbox" value={summary} onChange={handleSummaryChange} required style={{ height: '50px', width: '300px' }}/>
        </div>
        {/* Technical Problem */}
        <div>
            <h2>
                Technical Problem
            </h2>
            <label>
            Describe what technical problem would you like hackathon participants to solve?<span>*</span>
            </label>
            Try to think only about the problem you are trying to solve, and not how you want to solve it.  The more specific you can get with your problem(s), the better scoped your project will be.
            <input type="textbox" value={summary} onChange={handleSummaryChange} required style={{ height: '50px', width: '300px' }}/>
        </div>
        {/* Mission */}
        <div>
            <h2>
                Mission
            </h2>
            <label>
            How would a solution to these challenges help further your work, mission, strategy, or growth?<span>*</span>
            </label>
            Given that this problem is solved, how can it help you and your non-profit?
            <input type="textbox" value={mission} onChange={handleMissionChange} required style={{ height: '50px', width: '300px' }}/>
        </div>
        {/* Know Slack */}
        <div>
            <h2>
                Slack
            </h2>
            <p>
                We use Slack as our only mechanism for communication for Opportunity
                Hack, we ask this question to better understand your knowledge of using
                Slack (see Slack.com for more info)
            </p>
            <img
            src="https://example.com/image.jpg"
            alt="Slack question"
            width="400"
            height="300"
            />
            <p>Are you familiar with Slack?</p>
            <button onClick={handleYesClick}>Yes - I am familiar with Slack</button>
            <button onClick={handleNoClick}>No - I am not familiar with Slack</button>
            {isFamiliar !== null && (
            <p>You answered: {isFamiliar ? 'Yes' : 'No'}</p>
            )}
        </div>
        {/* Staff Availability */}
        <div>
            <h2>
                Availability
            </h2>
            <p>
            Is at least one key staff person who is knowledgeable about the project and your needs available to attend the event? This would include providing an email and phone number for questions during times when the staff isn't physically available.*We use Slack.com as our primary communication platform both before the hackathon starts and during the hackathon.  We'll send you a link with additional details a few months leading up to the hackathon.
            </p>
            <label>
                <input
                type="checkbox"
                name="area"
                value="phone"
                onChange={handleAvailability}
                />
                They will be available remotely throughout the entire period by phone
            </label>
            <br />
            <label>
                <input
                type="checkbox"
                name="area"
                value="emailSlack"
                onChange={handleAvailability}
                />
                They will be available remotely throughout the entire period by email and Slack
            </label>
            <br />
            <label>
                <input
                type="checkbox"
                name="area"
                value="Attend"
                onChange={handleAvailability}
                />
                Yes, they will be able to attend the final presentations and judging on Monday October 25th
            </label>
        </div>

      </form>
    </div>
  )
}

export default FormApp