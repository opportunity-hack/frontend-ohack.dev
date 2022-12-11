import { textAlign } from "@mui/system";
import React from "react";
import reactDom from "react-dom";

export default function newsletters() {

    // hooks
    const [is_HTML, setHtml] = React.useState(true)

    // boolean called is_html
    const print_data = (event) => {
        // event.preventDefault();
        console.log(event.target.header.value)
        console.log(event.target.content.value)

    }
    function handleHtml() {
        setHtml(!is_HTML);
        console.log(is_HTML);
    }

    return (
        <div class="parent">
            <div class="container">

                <div class="1a"> </div>
                <form id="newsletterForm">
                    <label class="title"> Subject </label><br></br>
                    <input class="header" type="text" /><br></br>
                    <div class="1b">
                        <div class="1b">
                            <button class='button' style={{ background: !is_HTML ? 'green' : 'red' }} onClick={is_HTML ? handleHtml : null} id='HTML'> HTML </button>
                            <button class='button' style={{ background: is_HTML ? 'green' : 'red' }} onClick={is_HTML ? null : handleHtml} id='Markup'>  Markup </button>
                        </div>
                    </div>
                        <label class="contents"> Contents <br></br></label>
                        <div class="1c"> </div>
                        <textarea id="textarea" name="textarea" class="text_area" rows="4" cols="50"> </textarea>
                        <div class='testing'>
                            <button class='button'> Send </button>
                        </div>

                </form>
                <div>  </div>

            </div>
            <div class="continer2">
                <h2 class="users"> Subscribed Users </h2>

                <textarea id="textarea" name="textarea" class="text_area_subs" rows="4" cols="50"> </textarea>

            </div>
        </div>
    )
}