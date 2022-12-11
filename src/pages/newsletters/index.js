import { textAlign } from "@mui/system";
import React from "react";
import reactDom from "react-dom";

export default function newsletters(){
    const print_data = (event)=>{
        // event.preventDefault();
        console.log(event.target.header.value)
        console.log(event.target.content.value)

    }
   return(
           <form id="newsletterForm" onSubmit={print_data}>
               <img src="ohack.png" alt="Opportunity Hack"/> 
               <label class="title"> Enter your title:</label><br></br>
                <input type= "Header" name='header'/><br></br>
                <label class="contents" id = 'getContent'>Enter your contents:<br></br></label>
                <textarea id="txtArea" name="content" rows="4" cols="50">
                    At w3schools.com you will learn how to make a website. They offer free tutorials in all web development technologies.
                    </textarea>
                <button type="submit"> "Send" </button>
           </form>
   )
}