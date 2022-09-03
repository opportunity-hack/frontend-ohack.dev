
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';


export const ProjectProgress = ({ state }) => {

    const stateMapping = {
        "concept": [1, 0, 0, 0, 0],
        "hackathon": [1, 1, 0, 0, 0],
        "post-hackathon": [1, 1, 1, 0, 0],
        "production": [1, 1, 1, 1, 0],
        "maintenance": [1, 1, 1, 1, 1]
    }

    const states = ["concept", "hackathon", "post-hackathon", "production", "maintenance"];

    const abbreviation = ["C", "H", "PH", "P", "M"];

    const progressToRender = () => {
        const statusList = stateMapping[state];
        
        return ( states.map( (name, index) => {

                if( statusList[index] === 1 )
                {
                    return (<Chip key="mine" color="primary" label={name} avatar={<Avatar>{abbreviation[index]}</Avatar>} />)
                }
                else{
                    return (<Chip key="mine" color="default" label={name} avatar={<Avatar>{abbreviation[index]}</Avatar>} />)
                }
                
            
            
            
        }))
    }

    return(
        <div>
        { progressToRender() }
        
        </div>
    )

}
