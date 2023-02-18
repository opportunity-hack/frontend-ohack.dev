import React, { useState, useEffect } from "react";
import { BlankContainer } from "../HeroBanner/styles";
import {
	GridStyled,
	InfoContainer,
	NormalTextStyled,
	OuterGrid,
	SectionTitle,
	TabContainer,
	TabsContainer,
	TabsStyled,
	TabStyled,
	TextContainer,
	TitleContainer,
	TitleStyled,
} from "./styles";
import { useTheme } from "@mui/material/styles";
import VolunteerActivismOutlinedIcon from "@mui/icons-material/VolunteerActivismOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import SwipeableViews from "react-swipeable-views";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import LibraryAddCheckOutlinedIcon from "@mui/icons-material/LibraryAddCheckOutlined";

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

function OHackFeatures() {
	const details = [
		{
			index: 0,
			title: "Make an impact",
			description:
				"Build things that change your community for the better. Nonprofits lack software engineering teams to help them reduce their time wasted on overhead, at a minimum you will allow them to scale their reach by the code you write.",
			icon: "https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/volunteer_activism/default/48px.svg",
		},
		{
			index: 1,
			title: "Keep track of your volunteerism",
			description:
				"Build a portfolio of the things you have worked on and the people you have helped. Be able to visually see your impact and how much time you have dedicated to a cause.  As a company, leverage us to manage and report social good effort from your employees as mentors and hackers.",
			icon: (
				<VolunteerActivismOutlinedIcon style={{ fontSize: "10rem" }} />
			),
		},
		{
			index: 2,
			title: "Build your experience",
			description:
				"Work in a traditional software development lifecycle, have standups, do peer reviews, get feedback. Not a software engineer? No problem! Build on your experience in: Product Management (PM), Program Management (PgM), and User Experience (UX). You can decide to share this with your current employer or potential employers which has a lot more weight than a resume and an interview.",
			icon: "https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/receipt_long/default/48px.svg",
		},
		{
			index: 3,
			title: "Engage with a community",
			description:
				"We're all taking time out of our lives to make the world a better place, you'll be with many similiar-minded people. Help your company with their Environmental, Social, and Governance (ESG) commiitment by donating a percentage of its profits to the local community and encourage employees to perform volunteer work. Use community service to validate a focus on diversity, inclusion, community-focus, and social justice.",
			icon: "https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/forum/default/48px.svg",
		},
	];

	const [value, setValue] = React.useState(0);
	const theme = useTheme();

	const handleChange = (event, newValue) => {
		setValue(newValue);
	};

	const handleChangeIndex = (index) => {
		setValue(index);
	};

	const [width, setWidth] = useState(window.screen.width);
	const functionName = () => {
		setInterval(() => {
			setWidth(window.screen.width);
		}, 500);
	};

	window.addEventListener("resize", functionName);

	useEffect(() => {
		setWidth(window.screen.width);
	}, []);

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
					<TabStyled
						label={
							width < 480
								? value == 0
									? "Impact"
									: ""
								: "Impact"
						}
						{...a11yProps(0)}
						icon={<LibraryAddCheckOutlinedIcon />}
					/>
					<TabStyled
						label={
							width < 480
								? value == 1
									? "Volunteerism"
									: ""
								: "Volunteerism"
						}
						{...a11yProps(1)}
						icon={<VolunteerActivismOutlinedIcon />}
					/>
					<TabStyled
						label={
							width < 480
								? value == 2
									? "Experience"
									: ""
								: "Experience"
						}
						{...a11yProps(2)}
						icon={<BuildOutlinedIcon />}
					/>
					<TabStyled
						label={
							width < 480
								? value == 3
									? "Community"
									: ""
								: "Community"
						}
						{...a11yProps(3)}
						icon={<PeopleAltOutlinedIcon />}
					/>
				</TabsStyled>

				<TabContainer
					container
					justifyContent="center"
					alignItems="center"
				>
					<SwipeableViews
						axis={theme.direction === "rtl" ? "x-reverse" : "x"}
						index={value}
						onChangeIndex={handleChangeIndex}
					>
						{details.map((detail) => {
							return (
								<TabPanel
									value={value}
									key={detail.title}
									index={detail.index}
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
												{detail.description}
											</NormalTextStyled>
										</InfoContainer>
									</GridStyled>
								</TabPanel>
							);
						})}
					</SwipeableViews>
				</TabContainer>
			</TabsContainer>
		</BlankContainer>
	);
}

export default OHackFeatures;
