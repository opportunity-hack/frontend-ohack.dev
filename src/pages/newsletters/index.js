import { textAlign } from "@mui/system";
import React from "react";
import reactDom from "react-dom";

export default function newsletters(){
   return(
       <div class="parent">
<div class = "container">
       
       <div class = "1a"> </div>
           <form id="newsletterForm">
               <label class="title"> Subject </label><br></br>
                <input type= "Header" /><br></br>
                <div class = "1b"> 
                <button class = 'button'> HTML </button>
                <button class = 'button'> Markup </button>
                </div>
                <label class="contents"> Contents <br></br></label>
                <div class = "1c"> </div>
                <textarea id="w3review" name="w3review" rows="4" cols="50"> </textarea>
                <div class = 'testing'> 
                <button> Send </button>  
                </div>
          
            </form> 
            </div>
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
       
   )
}