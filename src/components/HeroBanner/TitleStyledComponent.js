import React from 'react';

import {
  TitleStyled,
  SpanText,
  TitleContainer,
} from './styles';
import { Fragment } from 'react';

const TitleStyledComponent = () => (
    <Fragment>
    <TitleContainer container>
    <TitleStyled>
        The place where
        <div>
            <SpanText>Nonprofits, Hackers, Mentors, Volunteers</SpanText>
        </div>
        unite
    </TitleStyled>
    </TitleContainer>
    </Fragment>
);

export default TitleStyledComponent;
