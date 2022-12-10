import React from "react";
import {
	MainContainer,
	ButtonStyled,
	GridStyled,
	TextStyled,
	TitleStyled,
	ButtonContainers,
	SpanText,
	BlankContainer,
} from "./styles";
import Typewriter from "typewriter-effect";
import { motion } from "framer-motion";

function HeroBanner() {
	const logo = "https://i.imgur.com/Ih0mbYx.png";

	const JOIN_SLACK_LINK =
		"https://join.slack.com/t/opportunity-hack/shared_invite/zt-1db1ehglc-2tR6zpmszc5898MhiSxHig";
	const openCodeSample = () => {
		gaButton("open_code_sample");
		window.open(JOIN_SLACK_LINK, "_blank", "noopener noreferrer");
	};

	const gaButton = (actionName) => {
		ga.event({
			action: "button",
			params: {
				action_name: actionName,
			},
		});
	};

	return (
		<GridStyled container direction="row">
			{/* Left Container */}
			<BlankContainer container xs={12} md={6} lg={6}>
				<MainContainer container>
					<TitleStyled>
						Welcome to the place where
						<SpanText>
							<Typewriter
								options={{
									strings: [
										"Nonprofits",
										"Hackers",
										"Mentors",
										"Volunteers",
									],
									autoStart: true,
									loop: true,
								}}
							/>
						</SpanText>
						unite!
					</TitleStyled>
				</MainContainer>

				<MainContainer right={"true"} container>
					<TextStyled>
						Welcome to the place where Nonprofits, Hackers, Mentors,
						and Volunteer unite!
					</TextStyled>
					<ButtonContainers container>
						<ButtonStyled
							component={motion.div}
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.9 }}
						>
							Step 1: Find a problem to work on
						</ButtonStyled>
						<ButtonStyled
							component={motion.div}
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.9 }}
						>
							Step 2: Join us on slack to get involved
						</ButtonStyled>
					</ButtonContainers>
				</MainContainer>
			</BlankContainer>
			{/* Right Container */}
			<BlankContainer
				container
				item
				xs={12}
				md={6}
				lg={6}
				justifyContent="center"
				alignItem="center"
			>
				Image
			</BlankContainer>
		</GridStyled>
	);
}

export default HeroBanner;
