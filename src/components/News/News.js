import Grid from '@mui/material/Grid';
import {  
  NewsLinkButton,
  SlackButton,  
  TitleStyled,
  TitleContainer,
  CaptionContainer,
  MoreNewsStyle,
  ButtonContainersSmall,
  TextMuted,  
  EventCards,
  BlankContainer,
} from './styles';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { CalendarToday } from '@mui/icons-material';
import Link from 'next/link';

function News( {newsData, frontPage} ) {

  return (
    <EventCards container direction='row' frontPage={frontPage} style={{ margin: '1px', padding: '10px' }}>      
      { frontPage && <Link href="/blog">        
        <MoreNewsStyle>
          More news
          <ArrowForwardIcon/>
        </MoreNewsStyle>        
      </Link>
      }
      {/* Render news items */}
      {newsData?.map((newsItem) => (
        <BlankContainer xs={12} md={12} lg={12} key={newsItem.id}>
          <TitleContainer container>
            <Grid item xs={12} md={12} lg={12}>
              <TitleStyled variant="h1">{newsItem.title}

              
                <SlackButton target="_blank" variant="outlined" >
                  <Link href={newsItem.slack_permalink} target='_blank'>
                Slack post
                </Link>
              </SlackButton>
              
              </TitleStyled>
              
            </Grid>
            <Grid item xs={12} md={12} lg={12}>
              <TextMuted>
                <CalendarToday style={{ marginRight: '5px' }} />
                {newsItem.slack_ts_human_readable}
              </TextMuted>
            </Grid>
          </TitleContainer>
          <CaptionContainer>
            {newsItem.description}
          </CaptionContainer>
          {
            // If there are newsItem.links, render them as a button where name is the title, and url is the <Link> href attribute
            // Filter for links where name starts with #
            // 

          } 
          
          <ButtonContainersSmall style={{ justifyContent: 'center', justifyItems: 'center', textAlign: 'center' }}>
          {            
            newsItem.links && newsItem.links.filter((link) => !link.url.startsWith('#')).map((link) => (            
              <NewsLinkButton key={link.name} variant="contained" href={link.url} target="_blank">
                {link.name}
              </NewsLinkButton>
            
          ))}
          </ButtonContainersSmall>

          <ButtonContainersSmall style={{ marginTop: '10px', justifyContent: 'center', justifyItems: 'center', textAlign: 'center' }}>
          {            
            newsItem.links && newsItem.links.filter((link) => link.url.startsWith('#')).map((link) => (            
              <SlackButton key={link.name} variant="outlined" size="small" href={link.url} target="_blank">
                #{link.name}
              </SlackButton>
            
          ))}
          </ButtonContainersSmall>         
        </BlankContainer>
         
      ))}

      { frontPage && <Link href="/blog">        
        <MoreNewsStyle>
          More news
          <ArrowForwardIcon/>
        </MoreNewsStyle>        
      </Link>
      }
    </EventCards>
  );

}
export default News;
