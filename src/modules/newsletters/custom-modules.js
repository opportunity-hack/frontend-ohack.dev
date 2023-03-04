export const CUSTOM_TYPE_CUMULATIVE = ["text_text", "component_button"]
export const CUSTOM_TYPE_DESCRIPTION = CUSTOM_TYPE_CUMULATIVE.map((value)=>{
    return value.split("_")[1]
})
export const CUSTOM_TYPE_VALUES = CUSTOM_TYPE_CUMULATIVE.map((value)=>{
    return value.split("_")[0]
})