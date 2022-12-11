import Chip from '@mui/material/Chip';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import Tooltip from '@mui/material/Tooltip';

export default function SkillSet({Skills}) {
    
    return (
        <div>
            <Tooltip title={<span style={{ fontSize: "14px" }}>Skills</span>}>
                <Chip key="mine" color="default" label="Skills"  />
            </Tooltip >
            <Tooltip title={<span style={{ fontSize: "14px" }}></span>}>
                <span>:</span>
            </Tooltip >
            { 
                Skills &&
                    Skills.map((skill) => {
                        return (
                            <Tooltip title={<span style={{ fontSize: "14px" }}>{skill}</span>}>
                                <Chip key="mine" color="success" label={skill} icon={<CheckCircleOutlineOutlinedIcon/>} />
                            </Tooltip >
                        )
                    })
            }

            {
                !Skills && 
                    <Tooltip title={<span style={{ fontSize: "14px" }}>None</span>}>
                        <Chip key="mine" color="danger" label="None" icon={<CheckCircleOutlineOutlinedIcon/>} />
                    </Tooltip >
            }    
        </div>    
    )
}