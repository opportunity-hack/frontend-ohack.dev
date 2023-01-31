import {USER_TYPE_VALUES,USER_TYPE_DESCRIPTION}  from "../../modules/newsletters/text-module"
export default function CustomNewsletterText(){
    // send data from child to parent
    return (
        <div>
            <form>
                <h2>What do you want it to say?</h2>
                <input>Type here</input>
                <select>
                    {
                        USER_TYPE_VALUES
                        .map((value, index)=>{
                            return <option value={value}>{USER_TYPE_DESCRIPTION[index]}</option>
                        })
                    }
                </select>
                <button>Add Text</button>
            </form>
        </div>
    )
}