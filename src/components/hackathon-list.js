import React from "react";

// https://www.npmjs.com/package/react-loading-icons
import { Puff } from 'react-loading-icons'

import DownloadCertificateButton from "./buttons/download-certificate-button"
import { useTable } from 'react-table'
import NonProfitList from "./non-profit-list";


export default function HackathonList ({hackathons}){    
    const hackathonInfo = ({ hackathons }) => {
        if (hackathons === null) {
            // We want to show the loading icons while we are waiting for the data to load
            // https://codeflarelimited.com/blog/react-js-show-and-hide-loading-animation-on-button-click/
            return(<p>Loading... <Puff stroke="#0000FF" /> <Puff stroke="#0000FF" /></p>);
        }
        else if (hackathons.length === 0) {
            return (<p><i>Nothing yet!</i></p>);
        }
        else{
            return null;
        }
    };

    var data = [{
        col1: "",
        col2: "",
        col3: "",
        col4: "",
        col5: ""
    }];
    if( hackathons != null )
    {
        data = hackathons.map(hackathon => {
            return {
                col1: hackathon.start_date,
                col2: hackathon.location,
                col3: <a href={hackathon.devpost_url}>Link</a>,
                col4: <DownloadCertificateButton />,
                col5: <NonProfitList nonprofits={hackathon.nonprofits} />
            };
        });
    }
   
    

    // I don't think this is needed:
    // const data = React.useMemo( () => ahist, [] )

    const columns = React.useMemo(
        () => [
            {
                Header: 'Start Date',
                accessor: 'col1', // accessor is the "key" in the data
            },
            {
                Header: 'Location',
                accessor: 'col2', // accessor is the "key" in the data
            },
            {
                Header: 'DevPost',
                accessor: 'col3',
            },
            {
                Header: 'Certificate',
                accessor: 'col4',
            },
            {
                Header: 'Nonprofit',
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


    return(
        <div>  
         {hackathonInfo({hackathons})}             
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
        </div> 
    );
    };
