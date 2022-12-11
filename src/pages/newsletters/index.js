import { textAlign } from "@mui/system";
import React from "react";
import reactDom from "react-dom";

export default function newsletters(){
    // hooks
    const [is_HTML, setHtml] = React.useState(true)

    // boolean called is_html
    const print_data = (event)=>{
        // event.preventDefault();
        console.log(event.target.header.value)
        console.log(event.target.content.value)
        
    }
    function handleHtml () {
            setHtml(!is_HTML) ;
            console.log(is_HTML);
    }
    
    return (
    <div class="parent">
                <div class="container">

                    <div class="1a"> </div>
                    <div class="1b">
                            <button class='button' style={{background: !is_HTML ? 'green' : 'red'}} onClick={is_HTML?handleHtml:null} id='HTML'> HTML </button>
                            <button class='button' style={{background: is_HTML ? 'green' : 'red'}} onClick={is_HTML?null:handleHtml} id='Markup'>  Markup </button>
                        </div>
                    <form id="newsletterForm">
                        <label class="title"> Subject </label><br></br>
                        <input type="Header" name='header' /><br></br>
                        
                <label class="contents" id='getContent'>Enter your contents:<br></br></label>
                <div class="1c"> </div>
                <textarea id="txtArea" name="content" rows="4" cols="50">
                    At w3schools.com you will learn how to make a website. They offer free tutorials in all web development technologies.
                </textarea>                <div class='testing'>
                    <button type="submit"> "Send" </button>
                </div>
            
        </form>
        <div class="continer2">
                <ol>
                    <li>dfgdf</li>
                    <li>dfgdf</li>
                    <li>dfgdf</li>
                    <li>dfgdf</li>
                    <li>dfgdf</li>
                    <li>dfgdf</li>
                    <li>dfgdf</li>
                    <li>dfgdf</li>
                    <li>dfgdf</li>
                    <li>dfgdf</li>
                </ol>

            </div>
       </div>
    </div>
   );
   }