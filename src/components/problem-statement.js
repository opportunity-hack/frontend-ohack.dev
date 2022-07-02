import React from "react";

export const ProblemStatement = ({ title, description, github, status, first_thought_of, references}) => (    
    <div className="ohack-feature">    
        <h3 className="ohack-feature__headline">           
            {title}
        </h3>
        <p>
            {status}
        </p>
        
        <p className="ohack-feature__description">
            Since {first_thought_of}
            <br/>
            {description}
            <br />                        
        </p>        
        <ul>
            <li><a href={github}>GitHub</a></li>
            <li><a href={references}>More details</a>    </li>
        </ul>

    </div>
    
);
