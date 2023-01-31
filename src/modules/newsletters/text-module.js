export const USER_TYPE_VALUES = ["user_name","user_id","user_email","user_role"];
export const USER_TYPE_DESCRIPTION = USER_TYPE_VALUES.map((value)=>{
    return value.split('_')[1]
})
