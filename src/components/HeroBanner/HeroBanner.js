import React, { useEffect, useState } from "react";
import {
	MainContainer,
	ButtonStyled,
	GridStyled,
	TextStyled,
	TitleStyled,
	TitleContainer,
	CaptionContainer,
	ButtonContainers,
	SpanText,
	BlankContainer,
} from "./styles";
import Typewriter from "typewriter-effect";
import { Player } from "@lottiefiles/react-lottie-player";

function HeroBanner() {
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

	const [width, setWidth] = useState();
	const functionName = () => {
		setInterval(() => {
			setWidth(screen.width);
		}, 500);
	};

	window.addEventListener("resize", functionName);

	useEffect(() => {
		setWidth(screen.width);
	}, []);


	return (
		<GridStyled
			container
			direction="row"
			justifyContent="center"
			alignItem="center"
		>
			{/* Left Container */}
			<BlankContainer container xs={12} md={6} lg={6}>
				<TitleContainer container>
					<TitleStyled>
						The place where
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
						unite
					</TitleStyled>
				</TitleContainer>

				<CaptionContainer right={"true"} container>
					<TextStyled>
						Interested in joining? Clicks these to find out more!
					</TextStyled>
					<ButtonContainers container>
						<ButtonStyled>Find a problem to work on </ButtonStyled>
						<ButtonStyled>
							Join us on slack to get involved
						</ButtonStyled>
					</ButtonContainers>
				</CaptionContainer>
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
				<Player
					src="https://assets1.lottiefiles.com/packages/lf20_vnikrcia.json"
					className="player"
					loop
					autoplay
					speed={1}
					style={{
						width: "100%",
						height: "100%",
						padding: "0 0",
					}}
				/>
			</BlankContainer>
		</GridStyled>
	);
}

export default HeroBanner;
