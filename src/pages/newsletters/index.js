import useNewsLetterAPI from "../../hooks/use-newsletter";

import { useState } from "react";

import React from "react";


import CustomNewsletterButton from '../../components/newsletter/custom_button'
import CustomNewsletterText from '../../components/newsletter/custom_text'
import SubscriberList from '../../components/newsletter/selected_users'
import HTMLPreview from '../../components/newsletter/preview'

import { CUSTOM_TYPE_CUMULATIVE, CUSTOM_TYPE_VALUES, CUSTOM_TYPE_DESCRIPTION } from "../../modules/newsletters/custom-modules"
import toast, { Toaster } from 'react-hot-toast';

export default function newsletters() {
 const { subscribers, submit_email,Preview, } = useNewsLetterAPI();
  const [is_HTML, setHtml] = useState(false);
  const [item_name, selectRole] = useState(undefined)
  const [selected_component, selectCustomComponentType ] = useState('')
  const [edit_email_list, selectEditEmail] = useState(false)
  const [email_count, countEmails] = useState(0)
  const [email_List, listEmails] = useState([])
 const [is_preview, changeView]= useState(false);
 const [prev, setPreview]= useState("")
 const [is_subscribed, setSubscribed] = useState("true")

  const error = (value) => toast.error(value);

  function handleHtml() {
    setHtml(!is_HTML);
  }[is_HTML]
  function handleHtmlChange(val) {
    setPreview(val);

  }[prev]

  const handle_submit = async (event) => {
    event.preventDefault();
    if(event.target.header.value == "" || event.target.content.value == ""){
      error(event.target.header.value == "" && event.target.content.value == ""?"Subject and content are empty":event.target.content.value == ""?"Subject is empty":"content is empty")
    }
  
    else{
       let send_email_result =  !is_preview?
        submit_email(
          event.target.header.value,
           event.target.content.value,
           email_List,
           item_name
          ):
         prev(
            event.target.content.value,
            is_HTML
          ).then((val)=>{
            handleHtmlChange(val)
          });

          toast.promise(send_email_result, {
            loading: 'Loading',
            success: 'email successfully sent !!',
            error: 'Error when sending data',
          });
        
    }
   
  };

  return (
   
    <div className="parent">
      <div className="container">
        <form className="full_width" onSubmit={handle_submit}>
          <div className=" flex_center_center flex_row title_row">
            <h3>Subject </h3>
            <input className="header full_width border_padding" name="header" type="text" placeholder="type you email subject here"/>
          </div>

         <br></br>
          <textarea
            id="textarea"
            name="content"
            className="text_area border_padding"
            rows="4"
            cols="50"
            placeholder="Type email here ..."
          ></textarea>
          <div className=" flex_center_center flex_row title_row flex_align_end">
            <button className="button dark-text locked light-text"  onClick={(event)=>{
                changeView(false)
              }} type="submit">
              Send
            </button>
         </div>
       
        </form>
        <div> </div>
      </div>      
      <div  className="container">
        <h3>Add Custom Component</h3>
        <select
        className="button dark-text full_width border_padding"
        onChange={(e)=>{
          selectCustomComponentType(e.target.value)
        }}>
          <option>Select</option>
         {
              CUSTOM_TYPE_CUMULATIVE.map((value,index)=>{
                return <option key={index} value={CUSTOM_TYPE_VALUES[index]}>{CUSTOM_TYPE_DESCRIPTION[index]}</option>
              })
         }
        </select>
        {
          selected_component === "text"
          ?
          <CustomNewsletterText></CustomNewsletterText>
          :selected_component === "component"?
          <CustomNewsletterButton></CustomNewsletterButton>:<br></br>

        }
         <div>
          <h3>Subscription status</h3>
            <select
            className="button dark-text full_width border_padding"
             onChange={
              (e)=>{
                setSubscribed(e.target.value)
                let new_list = []
                subscribers && item_name
                ?subscribers[item_name]?.forEach((value)=>{
                  if(String(value["subscribe"])==e.target.value){
                    new_list.push(value) 
                    }
              }):undefined
              
                listEmails(new_list.length < 1?undefined:new_list)
                countEmails(new_list.length)
           
              }
            } 
            >
              <option value={true}>Subscribers</option>
              <option  value={false}>Non Subscribers</option>
            </select>
        </div>

         <div>
          <h3>Select group</h3>
            <select
            className="button dark-text full_width border_padding"
             onChange={
              (e)=>{
                const group_form_value = e.target.value
                if(group_form_value){

                  let new_list = []
                  subscribers && group_form_value
                  ?subscribers[group_form_value]?.forEach((value)=>{
                    if(String(value["subscribe"])==is_subscribed){
                      new_list.push(value) 
                      }
                }):undefined;
                  listEmails(new_list.length < 1?undefined:new_list)
                  countEmails(new_list.length)
                  selectRole(group_form_value)
                }

              }
            } 
            >
              <option>Select Group</option>
              {
                 subscribers != undefined? Object.keys(subscribers).map((role)=>{
                    return (<option key={role} value={role}>{role}s</option>)
                  }):<option>loading</option>
                 
              }
            </select>
        </div>
        <div className="flex_space_between align_center">
          <div>
            <h3> Selected Group:  {item_name?item_name+"s":"None"} </h3>
          </div>
         {
          edit_email_list?<div className="padlock flex_center align_center" onClick={(e)=>{
            selectEditEmail(false)
          }}>
          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
          width="50" height="50"
          viewBox="0 0 50 50">
          <path d="M 22.78125 0 C 21.605469 -0.00390625 20.40625 0.164063 19.21875 0.53125 C 12.902344 2.492188 9.289063 9.269531 11.25 15.59375 L 11.25 15.65625 C 11.507813 16.367188 12.199219 18.617188 12.625 20 L 9 20 C 7.355469 20 6 21.355469 6 23 L 6 47 C 6 48.644531 7.355469 50 9 50 L 41 50 C 42.644531 50 44 48.644531 44 47 L 44 23 C 44 21.355469 42.644531 20 41 20 L 14.75 20 C 14.441406 19.007813 13.511719 16.074219 13.125 15 L 13.15625 15 C 11.519531 9.722656 14.5 4.109375 19.78125 2.46875 C 25.050781 0.832031 30.695313 3.796875 32.34375 9.0625 C 32.34375 9.066406 32.34375 9.089844 32.34375 9.09375 C 32.570313 9.886719 33.65625 13.40625 33.65625 13.40625 C 33.746094 13.765625 34.027344 14.050781 34.386719 14.136719 C 34.75 14.226563 35.128906 14.109375 35.375 13.832031 C 35.621094 13.550781 35.695313 13.160156 35.5625 12.8125 C 35.5625 12.8125 34.433594 9.171875 34.25 8.53125 L 34.25 8.5 C 32.78125 3.761719 28.601563 0.542969 23.9375 0.0625 C 23.550781 0.0234375 23.171875 0 22.78125 0 Z M 9 22 L 41 22 C 41.554688 22 42 22.445313 42 23 L 42 47 C 42 47.554688 41.554688 48 41 48 L 9 48 C 8.445313 48 8 47.554688 8 47 L 8 23 C 8 22.445313 8.445313 22 9 22 Z M 25 30 C 23.300781 30 22 31.300781 22 33 C 22 33.898438 22.398438 34.6875 23 35.1875 L 23 38 C 23 39.101563 23.898438 40 25 40 C 26.101563 40 27 39.101563 27 38 L 27 35.1875 C 27.601563 34.6875 28 33.898438 28 33 C 28 31.300781 26.699219 30 25 30 Z"></path>
        </svg>
        </div>:
        <div className="padlock locked flex_center align_center"  onClick={(e)=>{
          selectEditEmail(true)
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
          width="50" height="50" fill="#ffffff"
          viewBox="0 0 50 50">
          <path d="M 25 3 C 18.363281 3 13 8.363281 13 15 L 13 20 L 9 20 C 7.355469 20 6 21.355469 6 23 L 6 47 C 6 48.644531 7.355469 50 9 50 L 41 50 C 42.644531 50 44 48.644531 44 47 L 44 23 C 44 21.355469 42.644531 20 41 20 L 37 20 L 37 15 C 37 8.363281 31.636719 3 25 3 Z M 25 5 C 30.566406 5 35 9.433594 35 15 L 35 20 L 15 20 L 15 15 C 15 9.433594 19.433594 5 25 5 Z M 9 22 L 41 22 C 41.554688 22 42 22.445313 42 23 L 42 47 C 42 47.554688 41.554688 48 41 48 L 9 48 C 8.445313 48 8 47.554688 8 47 L 8 23 C 8 22.445313 8.445313 22 9 22 Z M 25 30 C 23.300781 30 22 31.300781 22 33 C 22 33.898438 22.398438 34.6875 23 35.1875 L 23 38 C 23 39.101563 23.898438 40 25 40 C 26.101563 40 27 39.101563 27 38 L 27 35.1875 C 27.601563 34.6875 28 33.898438 28 33 C 28 31.300781 26.699219 30 25 30 Z"></path>
          </svg>
          </div>       }           
        </div>
        <h4>Email Count: {email_count}</h4>
        <SubscriberList is_editable={edit_email_list}  subscribers={subscribers} item_name={item_name==undefined?"":item_name} subscribers_list={listEmails} is_subscribed={is_subscribed}></SubscriberList>
      </div>
      <Toaster />
    </div>
  );
}
