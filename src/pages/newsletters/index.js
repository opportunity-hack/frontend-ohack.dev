import useNewsLetterAPI from "../../hooks/use-newsletter";

import { useState, useEffect, useCallback } from "react";

import React from "react";


class Users{
  constructor(users){
    this.users  = users
  }
  get_list(item_name){
    console.log(item_name)
    return this.users[item_name]
  }
}
export default function newsletters() {
  const { subscribers, submit_email } = useNewsLetterAPI();
  const [is_HTML, setHtml] = React.useState(true);
  const [item_name, selectRole] = React.useState('hacker')
  // hooks
  useEffect(()=>{
    // get_subscriber_list()
  })

  function handleHtml() {
    setHtml(!is_HTML);
    console.log("is Html", is_HTML)
  }[is_HTML]

  const handle_submit = (event) => {
    console.log(is_HTML);
    event.preventDefault();
    submit_email(
      event.target.header.value,
      event.target.content.value,
      is_HTML
    );
    console.log(subscribers)
  };

  return (
    <div className="parent">
      <div className="container">
        <div className="1a"> </div>
        <form id="newsletterForm" onSubmit={handle_submit}>
          <label className="title"> Subject </label>
          <br></br>
          <input className="header" name="header" type="text" />
          <br></br>
          <div className="1b">
            <div className="1b">
              <button
                type="button"
                className="button"
                style={{ background: !is_HTML ? "green" : "white" }}
                onClick={!is_HTML ? null : handleHtml}
                id="Markdown"
              >
                {" "}
                MarkDown{" "}
              </button>
              <button
                type="button"
                className="button"
                style={{ background: is_HTML ? "green" : "white" }}
                onClick={is_HTML ? null : handleHtml}
                id="HTML"
              >
                {" "}
                Html{" "}
              </button>
            </div>
          </div>
          <label className="contents">
            {" "}
            Contents <br></br>
          </label>
          <div className="1c"> </div>
          <textarea
            id="textarea"
            name="content"
            className="text_area"
            rows="4"
            cols="50"
          ></textarea>
          <div className="testing">
            <button className="button" type="submit">
              Send
            </button>
          </div>
        </form>
        <div> </div>
      </div>
      
      <div className="container2">
        <h2 className="users"> Subscribed Users </h2>

        <textarea
          id="textarea"
          name="textarea"
          className="text_area_subs"
          rows="3"
          cols="50"
          readOnly
          value={
            subscribers != undefined
              ? subscribers[item_name]?.map((value) => {
                console.log(value.email)
                  return value.email
                })
              : ""
          }
        >
          {" "}
        </textarea>
        <div>
          <h2>Select group</h2>
            <select
             onChange={
              (e)=>{
                selectRole(e.target.value)
              }
            } 
            >
              {
                 subscribers != undefined? Object.keys(subscribers).map((role)=>{
                    return (<option value={role}>{role}{subscribers[role].length}</option>)
                  }):<option>loading</option>
                 
              }
            </select>

          
        </div>
      </div>
    </div>
  );
}
