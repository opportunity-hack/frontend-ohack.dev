import { useState, setState, useEffect } from "react"

export default function SubscriberList (props){
    const [main_email_list,setEmailList]=useState(props.subscribers[props.item_name])

    const value = props.subscribers != undefined ? 
                  props.subscribers[props.item_name]?.map((value) => {
                    return value.email
                    })
                : ""
    // useEffect(()=>{
    //   setEmailList(value)
    // })

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
          
         let final_list=[]
          let new_list = e.target.value.split(",").map((address)=>{
            return address
         })
         if(props.subscribers[props.item_name]){
          for(let item of props.subscribers[props.item_name]){
          for(let address of new_list){
            if(item.email == address){
              final_list.push(item)
            }
          }
          
         }
          props.subscribers_list(final_list)
         }
         
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
       onChange={
        (e)=>{
          props.subscribers_list(e.target.value)
        }
       }
    ></textarea>
    )
}