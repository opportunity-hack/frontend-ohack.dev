import React from "react";
import {
	BlankContainer,
	ButtonContainer,
	EventButton,
	EventCards,
	EventGreyText,
	EventText,
	EventTitle,
	OuterGrid,
	ProgressBarHolder,
	ProgressContainer,
	ThankYouContainer,
	TypographyStyled,
} from "./styles";
import Link from "next/link";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Typography } from "@mui/material";

function EventFeature(props) {
	const {
		title,
		type,
		nonprofits,
		start_date,
		end_date,
		location,
		devpostUrl,
		eventLinks,
		donationUrl,
		donationGoals,
		donationCurrent,
		icon,
	} = props;

	return (
		<EventCards container direction="column">
			<EventTitle variant="h3">{type}</EventTitle>
			<EventGreyText variant="button">
				{start_date} - {end_date}
			</EventGreyText>
			<EventGreyText variant="button">{location}</EventGreyText>

			<EventText variant="h3">{title}</EventText>

			<ProgressContainer
				container
				justifyContent="space-around"
				direction="column"
			>
				<BlankContainer
					container
					justifyContent="space-around"
					direction="row"
				>
					<ProgressBarHolder container justifyContent="center">
						<Typography
							variant="h5"
							marginBottom="12%"
							fontWeight="bold"
						>
							Food
						</Typography>
						<CircularProgressbar
							styles={{
								path: {
									stroke: "#003486",
								},
								trail: {
									stroke: "#ffffff",
								},
								text: {
									fill: "#003486",
								},
							}}
							value={
								(donationCurrent.food / donationGoals.food) *
								100
							}
							text={`${(
								(donationCurrent.food / donationGoals.food) *
								100
							).toFixed(0)}%`}
						/>
					</ProgressBarHolder>

					<ProgressBarHolder container justifyContent="center">
						<Typography
							variant="h5"
							marginBottom="12%"
							fontWeight="bold"
						>
							Prize
						</Typography>
						<CircularProgressbar
							styles={{
								path: {
									stroke: "#003486",
								},
								trail: {
									stroke: "#ffffff",
								},
								text: {
									fill: "#003486",
								},
							}}
							value={
								(donationCurrent.prize / donationGoals.prize) *
								100
							}
							text={`${(
								(donationCurrent.prize / donationGoals.prize) *
								100
							).toFixed(0)}%`}
						/>
					</ProgressBarHolder>

					<ProgressBarHolder container justifyContent="center">
						<Typography
							variant="h5"
							marginBottom="12%"
							fontWeight="bold"
						>
							Swag
						</Typography>
						<CircularProgressbar
							styles={{
								path: {
									stroke: "#003486",
								},
								trail: {
									stroke: "#ffffff",
								},
								text: {
									fill: "#003486",
								},
							}}
							value={
								(donationCurrent.swag / donationGoals.swag) *
								100
							}
							text={`${(
								(donationCurrent.swag / donationGoals.swag) *
								100
							).toFixed(0)}%`}
						/>
					</ProgressBarHolder>
				</BlankContainer>

				<ThankYouContainer>
					<TypographyStyled variant="h6">
						Special Thanks to: {donationCurrent.thank_you} for
						donating!
					</TypographyStyled>
				</ThankYouContainer>
			</ProgressContainer>

			<ButtonContainer
				container
				direction="row"
				justifyContent="space-around"
			>
				{eventLinks.map((Link) => {
					return (
						<EventButton href={Link.link}>{Link.name}</EventButton>
					);
				})}
			</ButtonContainer>
		</EventCards>
	);
}

export default EventFeature;
