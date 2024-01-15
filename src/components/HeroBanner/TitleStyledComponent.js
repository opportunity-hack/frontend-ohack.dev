import React from 'react';

import {
    
    GridStyledSmaller,
  TitleStyled,
  SpanText,
  TitleContainerSmaller,
} from './styles';


const TitleStyledComponent = () => (
    <GridStyledSmaller
      container
      direction='row'
      justifyContent='center'      
    >
    <TitleContainerSmaller container>
    <TitleStyled>
        The place where
        <div>
            <SpanText>Nonprofits, Hackers, Mentors, Volunteers</SpanText>
        </div>
        unite
    </TitleStyled>
    </TitleContainerSmaller>
    </GridStyledSmaller>
);

export default TitleStyledComponent;
