import { useAuth0 } from "@auth0/auth0-react";
import React from "react";
import { CodeSnippet } from "../components/code-snippet";
import { LinkedInButton } from "../components/buttons/linkedin-button";
import { DownloadCertificateButton } from "../components/buttons/download-certificate-button"

import { useTable } from 'react-table'
import { useState } from "react";
// https://reactjs.org/docs/hooks-state.html

import { useProfileApi } from "../hooks/use-profile-api.js";

export const Profile = () => {

    
  const { user } = useAuth0();  

  const { getUserInfo } = useProfileApi();

  const user1 = {
    "updated_at": "2022-02-02 00:00:00",
    "email":"something@something.com",
    "picture": "http://localhost:4040/ohack.png",
    "badges": [
      {
        "name": "Badge 1",
        "link": "http://localhost:4040/ohack.png",
        "description": "This badge is for X"
      },
      {
        "name": "Badge 2",
        "link": "http://localhost:4040/ohack.png",
        "description": "This badge is for Y"
      }
    ],
    "feedback": [
      {
        "feedback_id": 23,
        "from": "Annie Developer",
      },
      {
        "feedback_id": 24,
        "from": "Pam Eveloper"
      }
    ],
    "history": [
      {
        "event_id": 123,
        "date_start": "07-Nov-2018",
        "date_end": "08-Nov-2018",
        "role": "Hacker",
        "nonprofit": [
          {
            "name": "NMTSA",
            "problem_id": 2,
            "problem_title": "Effective Scheduling of Music Therapists"
          },
          {
            "name": "Southwest Kidney",
            "problem_id": 42,
            "problem_title": "Digitize Paper Forms"
          }
        ],
        "contributions": {
          "standups": 2,
          "pull_requests_submitted": 5,
          "lines_added": 100,
          "lines_removed": 100,
          "builds_initiated": 2,
          "pull_requests_reviewed": 2,
          "average_pull_request_comment_length": 4,
          "github_url": "https://github.com/OpportunityHack2018/Team2.git",
          "project_submisson_url": "https://devpost.com/opportunity-hack-2018/projects/2"
        }
      },
      {
        "event_id": 124,
        "date_start": "10-Nov-2019",
        "date_end": "11-Nov-2019",
        "role": "Hacker"
      },
      {
        "event_id": 125,
        "date_start": "11-Nov-2020",
        "date_end": "12-Nov-2020",
        "role": "Mentor",
        "contributions": {
          "teams_mentored": 2,
          "builds_initiated": 2,
          "pull_requests_reviewed": 2,
          "average_pull_request_comment_length": 4,
          "total_slack_calls": 4,
          "total_slack_messages": 4
        }
      }
    ]
  };



  let userProfile = "";
  
  const [badges, setBadges] = useState(
    [{
      "name": "Cool Thing",
      link:"https://i.imgur.com/XP6l7wf.jpeg"
    },
    {
      "name": "Cool Thing",
      link: "https://i.imgur.com/XP6l7wf.jpeg"
    }
  ]
    )


  const data = [{
      col1: "Test",
      col2: "Test",
      col3: "Test",
      col4: <DownloadCertificateButton />,
      col5: "sdad"
    }];
  


  const data1 = user1.history.map(history => {
    return {
      col1: history.date_start,
      col2: history.date_end,
      col3: history.role,
      col4: <DownloadCertificateButton />,
      col5: "sdad"
    };
  });


  // I don't think this is needed:
  // const data = React.useMemo( () => ahist, [] )

  const columns = React.useMemo(
    () => [
      {
        Header: 'Start',
        accessor: 'col1', // accessor is the "key" in the data
      },
      {
        Header: 'End',
        accessor: 'col2', // accessor is the "key" in the data
      },
      {
        Header: 'Type',
        accessor: 'col3',
      },
      {
        Header: 'Certificate',
        accessor: 'col4',
      },
      {
        Header: 'Stats',
        accessor: 'col5',
      },
    ],
    []
  )

  

  const tableInstance = useTable({ columns, data })
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = tableInstance

  if (!user) {
    return null;
  }

  console.log("----");
  getUserInfo();
  console.log("----");
  
  /*
    1. Make call to get app_metadata for a given user
    2. Populate State for user details
  */

  return (
    <div className="content-layout">
      <h1 className="content__title">Profile</h1>
      <div className="content__body">        
        <div className="profile-grid">
          <div className="profile__header">
            <img src={user.picture} alt="Profile" className="profile__avatar" />
            
            <div className="profile__headline">
              <h2 className="profile__title">{user.name}</h2>
              <span className="profile__description">{userProfile}</span>
              <span className="profile__description">{user.email}</span>
              <span className="profile__last_updated">Last Login: {user.updated_at}</span>              
            </div>
          </div>

          <div className="profile__details">
            <h2 className="profile__title">Badges</h2>            
            <p>
            {
              user1.badges.map(badge => {
                return <div>{badge.name}<img alt="Badge" src={badge.link} className="profile__avatar" /></div>;
              })
            }
            
            </p>
            <LinkedInButton />
            <br /><br />

            <h1 className="profile__title">Volunteer History</h1>
            <br/>

            <h2 className="profile__title">Hackathons</h2>
            <p>
              We've tried our best to keep track of each time you've volunteered, mentored, judged a hackathon.  If not, please send us a Slack!
            </p>
            
            <table {...getTableProps()} style={{ border: 'solid 1px blue' }}>
              <thead>
                {headerGroups.map(headerGroup => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map(column => (
                      <th
                        {...column.getHeaderProps()}
                        style={{
                          borderBottom: 'solid 3px red',
                          background: 'aliceblue',
                          color: 'black',
                          fontWeight: 'bold',
                        }}
                      >
                        {column.render('Header')}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {rows.map(row => {
                  prepareRow(row)
                  return (
                    <tr {...row.getRowProps()}>
                      {row.cells.map(cell => {
                        return (
                          <td
                            {...cell.getCellProps()}
                            style={{
                              padding: '10px',
                              border: 'solid 1px gray',
                              background: 'papayawhip',
                            }}
                          >
                            {cell.render('Cell')}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
            
            <br />

            <h2 className="profile__title">Summer Internships</h2>
            <p>
              These are distinctly different than hackathons as they span over a couple months.
            </p>

            <h2 className="profile__title">Feedback</h2>
            <p>
              Feedback gathered from your mentors, peers, team members, nonprofits
            </p>

            <div className="profile__details">
              <CodeSnippet
                title="Decoded ID Token"
                code={JSON.stringify(user, null, 2)}
              />
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};
