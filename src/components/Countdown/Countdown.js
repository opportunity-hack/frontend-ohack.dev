import Moment from 'moment';
import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import {  
  SectionTitle,  
  TypographyStyled,  
} from "../HackathonList/styles";
import { Grid } from "@mui/material";
import ReactMarkdown from 'react-markdown'


export default function Countdown({ details })
{
    const _name = details.name;
    const _time = details.time;
    const _description = details.description;

    const minuteSeconds = 60;
    const hourSeconds = 3600;
    const daySeconds = 86400;

    const timerProps = {
        isPlaying: true,
        size: 120,
        strokeWidth: 6
    };

    const renderTime = (dimension, time) => {
    return (
      <div className="time-wrapper">
        <div className="time">{time}</div>
        <div>{dimension}</div>
      </div>
    );
    };

    const countdownSize = 70;

    const getTimeSeconds = (time) => (minuteSeconds - time) | 0;
    const getTimeMinutes = (time) => ((time % hourSeconds) / minuteSeconds) | 0;
    const getTimeHours = (time) => ((time % daySeconds) / hourSeconds) | 0;
    const getTimeDays = (time) => (time / daySeconds) | 0;

    const startTime = Date.now() / 1000; // use UNIX timestamp in seconds

    const remainingTime = Moment(_time) /1000- startTime;
    const days = Math.ceil(remainingTime / daySeconds);
    const daysDuration = days * daySeconds;

    return(
    <Grid container direction="row" alignContent="center" alignItems="center" marginTop={"4px"}>
        <Grid item xs={12} md={4} lg={3}>
            <div style={{ display: 'flex', fontFamily: 'sans-serif', textAlign: 'center', paddingTop: '10px'}}>
                <CountdownCircleTimer
                    {...timerProps}
                    colors="#7E2E84"
                    size={countdownSize}
                    duration={daysDuration}
                    initialRemainingTime={remainingTime}
                >
                    {({ elapsedTime, color }) => (
                    <span style={{ color }}>
                        {renderTime("days", getTimeDays(daysDuration - elapsedTime))}
                    </span>
                    )}
                </CountdownCircleTimer>
                <CountdownCircleTimer
                    {...timerProps}
                    colors="#D14081"
                    size={countdownSize}
                    duration={daySeconds}
                    initialRemainingTime={remainingTime % daySeconds}
                    onComplete={(totalElapsedTime) => ({
                    shouldRepeat: remainingTime - totalElapsedTime > hourSeconds
                    })}
                >
                    {({ elapsedTime, color }) => (
                    <span style={{ color }}>
                        {renderTime("hours", getTimeHours(daySeconds - elapsedTime))}
                    </span>
                    )}
                </CountdownCircleTimer>
                <CountdownCircleTimer
                    {...timerProps}
                    colors="#EF798A"
                    duration={hourSeconds}
                    size={countdownSize}
                    initialRemainingTime={remainingTime % hourSeconds}
                    onComplete={(totalElapsedTime) => ({
                    shouldRepeat: remainingTime - totalElapsedTime > minuteSeconds
                    })}
                >
                {({ elapsedTime, color }) => (
                <span style={{ color }}>
                    {renderTime("minutes", getTimeMinutes(hourSeconds - elapsedTime))}
                </span>
                )}
            </CountdownCircleTimer>
            <CountdownCircleTimer
                {...timerProps}
                colors="#218380"
                size={countdownSize}
                duration={minuteSeconds}
                initialRemainingTime={remainingTime % minuteSeconds}
                onComplete={(totalElapsedTime) => ({
                shouldRepeat: remainingTime - totalElapsedTime > 0
                })}
            >
                {({ elapsedTime, color }) => (
                <span style={{ color }}>
                    {renderTime("seconds", getTimeSeconds(elapsedTime))}
                </span>
                )}
            </CountdownCircleTimer>
            </div>          
        </Grid>

        <Grid item xs={12} md={8} lg={9}>
            <SectionTitle>{_name} 
            {
                Moment(_time).isAfter(Moment()) && 
                <span> 🟢 </span>
            }
            {
                Moment(_time).isBefore(Moment()) &&           
                <span style={{color: "gray"}}> 🏁 completed </span>          
            }
            {
                // Print time if it is not in the past
                Moment(_time).isAfter(Moment()) &&
                <span style={{color: "gray"}}> {Moment(_time).format('ddd MMM Do, h:mm a')}</span>

            }
            </SectionTitle>        
            <TypographyStyled variant="body1" sx={{ marginTop: "0%" }}>
                <ReactMarkdown>{_description}</ReactMarkdown>
            </TypographyStyled>
        </Grid>
        
            
    </Grid>  
    )
}
