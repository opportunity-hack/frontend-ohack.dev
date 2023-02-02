import { useState, setState, useEffect } from "react"

export default function SubscriberList (props){
    

    const value = props.subscribers != undefined ? 
                  props.subscribers[props.item_name]?.map((value) => {
                    return value.email
                    })
                : ""

    const [email_list, addEmailAddress]= useState(value)
    return(
       props.is_editable? <textarea
       id="textarea"
       name="textarea"
       className="text_area_subs"
       rows="3"
       cols="50"
       placeholder={
        value == ""?"Email list is empty": value
       }
       onChange={
        (e)=>{
          console.log(e.target.value)
        }
       }

     ></textarea>
     :
     <textarea
      id="textarea"
      name="textarea"
      className="text_area_subs"
      rows="3"
      cols="50"
      readOnly
      value= {value}
      placeholder={
       "Email list is empty"
       }
    ></textarea>
    )
}