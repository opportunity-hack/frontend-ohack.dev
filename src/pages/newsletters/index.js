import useNewsLetterAPI from "../../hooks/use-newsletter";

import { useState, useEffect, useCallback } from "react";
export default function newsletters(){
    const { subscribers,submit_email } = useNewsLetterAPI();
    const handle_submit  = () => {
                    submit_email("Hello Leon testing here","#leon making random tests",false)
    }
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
                {
                    subscribers != undefined?subscribers.map((value)=>{
                           return( 
                           <li> {value.email}</li>
                           ) 
                    }
                    ):null
                }             
                </ol>
                <button style={{background: "red"}} onClick={handle_submit}>TESTING</button>
            </div>
       </div>
       
   )
}