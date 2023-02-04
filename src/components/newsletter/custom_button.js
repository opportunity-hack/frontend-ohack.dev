
import {BUTTON_TYPE_VALUES,BUTTON_TYPE_DESCRIPTION}  from "../../modules/newsletters/button-module"
import {useState} from 'react'

import toast, { Toaster } from 'react-hot-toast';

export default function CustomNewsletterButton(){
// once subtype is selected here 
    const [button_type,selectType] = useState(undefined)
    const notify = (value) => toast(value);

    function valueOrUndefined(value){
        return value != undefined?value:undefined
    }

    const submitType=(e)=>{
        e.preventDefault()
        const new_values={
            'button_type': valueOrUndefined(button_type),
            'url_link': valueOrUndefined(e.target.button_link.value),
            'button_text': valueOrUndefined(e.target.button_text.value)
        }
        console.log(new_values)
        for(let [key,value] of Object.entries(new_values)){
            if(value === undefined){
                notify(key.split("_").join(" "), "is empty")
            }
        }
        const final_text = '${"type":"'+new_values.button_type+'", "link":"'+new_values.url_link+'", "text":"'+new_values.button_text+'"}$'
        navigator.clipboard.writeText(final_text)
        notify(new_values.button_type.split("_").join(" ")+" copied to clipboard")

    }
return(
    <div>
        <form  id="custom_button_form" onSubmit={(e)=>{
              submitType(e)
            }}>
            <h3>Add Custom Button</h3>
            <select 
             className="button dark-text full_width border_padding"
            onChange={
                (e)=>{
                    selectType(valueOrUndefined(e.target.value))
                }
            }
            >
                <option value="">select type</option>
                {
                    BUTTON_TYPE_VALUES.map((value, index)=>{
                        return <option value={value} key={index}>{BUTTON_TYPE_DESCRIPTION[index]}</option>
                    })
                }
            </select>
            <input className="button dark-text full_width border_padding" name="button_text" type="text" placeholder="text"/>
            <input className="button dark-text full_width border_padding" name="button_link" type="link" placeholder="link"/>
            <button type="submit"  className="button full_width dark-text" >Copy Button To clipboard</button>
        </form>
        <Toaster />
    </div>

)

}