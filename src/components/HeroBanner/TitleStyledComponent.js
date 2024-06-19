import React from 'react';

import {
  TitleStyled,
  SpanText
} from './styles';

const TitleStyledComponent = () => (
    <TitleStyled>
      <div class="headline">
        The place where 
            <SpanText> Nonprofits, Hackers, Mentors, Volunteers </SpanText>
        
        unite
        </div>
    </TitleStyled>
);

export default TitleStyledComponent;
