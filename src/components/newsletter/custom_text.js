import {USER_TYPE_VALUES,USER_TYPE_DESCRIPTION}  from "../../modules/newsletters/text-module"
import toast, { Toaster } from 'react-hot-toast';
import { useState } from "react";


export default function CustomNewsletterText(){
    // copy to clipboard through here
    const [selected_text, selectText] = useState('')
   

    const notify = (value) => toast(value);

    function submitForm(e){
        e.preventDefault()
        const text_value = '${"type":"'+selected_text+'"}$'
        navigator.clipboard.writeText(text_value)
        notify("Text component copied to clipboard")
    }
    return (
        <div>
            <form  id="custom_text_form" onSubmit={submitForm}>
                <h3>Add Text</h3>
                <select
                name="selection"
                className="button full_width dark-text"
                onChange={
                    (e)=>{
                        selectText(e.target.value)
                    }
                }
                >
                    <option value="">select text</option>
                    {
                        USER_TYPE_VALUES
                        .map((value, index)=>{
                            return <option key={index} value={value}>{USER_TYPE_DESCRIPTION[index]}</option>
                        })
                    }
                </select>
                <button type="submit"  className="button full_width dark-text">Copy Text To clipboard</button>
            </form>
            <Toaster />
        </div>
    )
}