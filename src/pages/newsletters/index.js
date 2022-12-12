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
                <input class= "header" type="text" /><br></br>
                <div class = "1b"> 
                <button class = 'button'> HTML </button>
                <button class = 'button'> Markup </button>
               </div>
                <label class="contents"> Contents <br></br></label>
                <div class = "1c"> </div>
                <textarea id="textarea" name="textarea" class="text_area" rows="4" cols="50"> </textarea>
                <div class = 'testing'> 
                <button class='button'> Send </button>  
                </div>
          
            </form> 
            <div>  </div>
            
       </div>
       <div class="continer2"> 
                <h2 class = "users"> Subscribed Users </h2>
                
                    <textarea id="textarea" name="textarea" class="text_area_subs" rows="4" cols="50"> </textarea>
                
            </div>
       </div>
   )
   }