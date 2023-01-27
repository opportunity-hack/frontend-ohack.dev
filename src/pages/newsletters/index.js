import useNewsLetterAPI from "../../hooks/use-newsletter";

import { useState, useEffect, useCallback } from "react";

import React from "react";

export default function newsletters() {
  const { subscribers, submit_email } = useNewsLetterAPI();
  const [is_HTML, setHtml] = React.useState(true);
 
  // hooks
  

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
  };

  return (
    <div class="parent">
      <div class="container">
        <div class="1a"> </div>
        <form id="newsletterForm" onSubmit={handle_submit}>
          <label class="title"> Subject </label>
          <br></br>
          <input class="header" name="header" type="text" />
          <br></br>
          <div class="1b">
            <div class="1b">
              <button
                type="button"
                class="button"
                style={{ background: !is_HTML ? "green" : "white" }}
                onClick={!is_HTML ? null : handleHtml }
                id="Markdown"
              >
                {" "}
                MarkDown{" "}
              </button>
              <button
                type="button"
                class="button"
                style={{ background: is_HTML ? "green" : "white" }}
                onClick={is_HTML ? null : handleHtml}
                id="HTML"
              >
                {" "}
                Html{" "}
              </button>
            </div>
          </div>
          <label class="contents">
            {" "}
            Contents <br></br>
          </label>
          <div class="1c"> </div>
          <textarea
            id="textarea"
            name="content"
            class="text_area"
            rows="4"
            cols="50"
          >
          </textarea>
          <div class="testing">
            <button class="button" type="submit">
              Send
            </button>
          </div>
        </form>
        <div> </div>
      </div>
      <div class="container2">
        <h2 class="users"> Subscribed Users </h2>

        <textarea
          id="textarea"
          name="textarea"
          class="text_area_subs"
          rows="4"
          cols="50"
          value={
            subscribers != undefined
              ? subscribers.map((value) => {
                  return value.email
                })
              : null
          }
        >
          {" "}
        </textarea>
      </div>
    </div>
  );
}
