import React, { useEffect, useRef, useState } from "react";
import { register } from 'swiper/element/bundle';
import { BlankContainer } from "../HeroBanner/styles";
import {
	GridStyled,
	InfoContainer,
	NormalTextStyled,
	// OuterGrid,
	SectionTitle,
	TabContainer,
	TabsContainer,
	TabsStyled,
	TabStyled,
	//TextContainer,
	TitleContainer,
	//TitleStyled,
} from "./styles";
// import { useTheme } from "@mui/material/styles";
import VolunteerActivismOutlinedIcon from "@mui/icons-material/VolunteerActivismOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import LibraryAddCheckOutlinedIcon from "@mui/icons-material/LibraryAddCheckOutlined";

register(); // since this declares vars, do this after all imports

function TabPanel(props) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`full-width-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}
		>
			{value === index && <div sx={{ p: 1 }}>{children}</div>}
		</div>
	);
}

function a11yProps(index) {
	return {
		id: `simple-tab-${index}`,
		"aria-controls": `simple-tabpanel-${index}`,
	};
}

const CAROUSEL_SELECTOR = '#ohack-feature-carousel';

const OHackFeatures = () => {
	// TODO: Move to the database. Have an admin form to edit these.
	const details = [
		{
			index: 0,
			shortName: "Impact",
			title: "Make an impact",
			description:
				"Build things that change your community for the better. Nonprofits lack software engineering teams to help them reduce their time wasted on overhead, at a minimum you will allow them to scale their reach by the code you write.",
		},
		{
			index: 1,
			shortName: "Volunteerism",
			title: "Keep track of your volunteerism",
			description:
				"Build a portfolio of the things you have worked on and the people you have helped. Be able to visually see your impact and how much time you have dedicated to a cause.  As a company, leverage us to manage and report social good effort from your employees as mentors and hackers.",
		},
		{
			index: 2,
			shortName: "Experience",
			title: "Build your experience",
			description:
				"Work in a traditional software development lifecycle, have standups, do peer reviews, get feedback. Not a software engineer? No problem! Build on your experience in: Product Management (PM), Program Management (PgM), and User Experience (UX). You can decide to share this with your current employer or potential employers which has a lot more weight than a resume and an interview.",
		},
		{
			index: 3,
			shortName: "Community",
			title: "Engage with a community",
			description:
				"We're all taking time out of our lives to make the world a better place, you'll be with many similiar-minded people. Help your company with their Environmental, Social, and Governance (ESG) commiitment by donating a percentage of its profits to the local community and encourage employees to perform volunteer work. Use community service to validate a focus on diversity, inclusion, community-focus, and social justice.",
		},
	];

	const swiperElRef = useRef(null);

	const [value, setValue] = React.useState(0);
	
	// TODO: Should be be using the theme here?
	// const theme = useTheme();

	const handleChange = (event, newValue) => {
		setValue(newValue);
	};

	const [width, setWidth] = useState(window.screen.width);
	const functionName = () => {
		setInterval(() => {
			setWidth(window.screen.width);
		}, 500);
	};

	window.addEventListener("resize", functionName);

	// TODO: Replace width comparisons with media queries
	useEffect(() => {
		setWidth(window.screen.width);
	}, []);

	useEffect(() => {
		// listen for Swiper events using addEventListener
		swiperElRef.current.addEventListener('progress', (e) => {
		  const progress = e.detail[1];
		  
		});
	
		swiperElRef.current.addEventListener('slidechange', (e) => {
		  console.log('slide changed');
		  const swiper = document.querySelector(CAROUSEL_SELECTOR)?.swiper;
		  const index = swiper?.activeSlide;
		  if (typeof index === 'number') {
			setValue(index);
		  }
		});

		return () => {
			// Unsubscribe?
		}
	  }, []);

	  useEffect(() => {
		const swiper = document.querySelector(CAROUSEL_SELECTOR)?.swiper;

		if (swiper?.activeSlide !== value) {
			swiper?.slideTo(value, 300, false);
		}

	  }, [value]);

	  const getIcon = (shortName) => {
		switch(shortName.toLowerCase()) {
			case "impact": return <LibraryAddCheckOutlinedIcon/>;
			case "volunteerism": return <VolunteerActivismOutlinedIcon/>;
			case "experience": return <BuildOutlinedIcon />;
			case "community": return <PeopleAltOutlinedIcon/>;
			default: return <div></div>;
		}
	  }

	  // TODO: Add media query to hide label if screen size is less than 480
	  const getTab = (feature) => {
		return (<TabStyled
			label={
				width < 480
					? value === feature.index
						? feature.shortName
						: ""
					: feature.shortName
			}
			{...a11yProps(feature.index)}
			icon={getIcon(feature.shortName)}
			key={feature.shortName}
		/>);
	};

	const getTabPanel = (feature) => {
		return (
			<swiper-slide>
				<TabPanel
					value={value}
					key={feature.index}
					index={feature.index}
				>
					<GridStyled
						container
						justifyContent="center"
					>
						<InfoContainer
							item
							// lg={12}
							container
							justifyContent="center"
							alignItems="center"
						>
							<NormalTextStyled>
								{feature.description}
							</NormalTextStyled>
						</InfoContainer>
					</GridStyled>
				</TabPanel>
			</swiper-slide>
		);
	};
	

	return (
		<BlankContainer container>
			<TitleContainer>
				<SectionTitle variant="h2">What do we do?</SectionTitle>
			</TitleContainer>

			<TabsContainer
				container
				justifyContent="center"
				alignItems="center"
				direction="column"
				variant="scrollable"
				scrollButtons
				allowScrollButtonsMobile
			>
				<TabsStyled
					key={value}
					value={value}
					onChange={handleChange}
					TabIndicatorProps={{
						style: {
							background: "#003486",
							height: "100%",
							zIndex: "0",
							borderRadius: "22px",
						},
					}}
				>
					{details.map((detail) => {
						return (getTab(detail));
					})}
				</TabsStyled>

				<TabContainer
					container
					justifyContent="center"
					alignItems="center"
				>
					<swiper-container
						id="ohack-feature-carousel"
						ref={swiperElRef}
						slides-per-view="1"
    >
						{details.map((detail) => {
							return (getTabPanel(detail));
						})}
					</swiper-container>
				</TabContainer>
			</TabsContainer>
		</BlankContainer>
	);
}

export default OHackFeatures;
