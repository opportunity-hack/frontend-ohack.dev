import { Grid, Button, Typography } from "@mui/material";
import { styled as styling } from "@mui/material";

// Button
export const ButtonStyled = styling(Button)({
	borderRadius: "2rem",
	paddingLeft: "1.5rem",
	paddingRight: "1.5rem",
	fontWeight: 600,
	fontSize: "15px",
	textTransform: "unset !important",
	backgroundColor: "#003486",
	color: "#ffffff",

	"&:hover": {
		backgroundColor: `var(--blue)`,
	},
});

// Grid
export const GridStyled = styling(Grid)({
	paddingTop: "100px",
	height: "100%",
    width: "75%",
    margin: "auto"
});

export const BlankContainer = styling(Grid)({
	// width: "100%",
	height: "100%",
});

export const MainContainer = styling(Grid)((props) => ({
	display: "flex",
	justifyContent: "flex-start",
	alignItems: "center",
	padding: "100px 5% 0px 5%",

	[props.theme.breakpoints.down("md")]: {
		padding: props.right === "true" ? "15% 5% 5% 5%" : "100px 10px 0 10px",
		justifyContent: "center",
		textAlign: "center",
	},
}));

export const ButtonContainers = styling(Grid)((props) => ({
	display: "flex",
	flexDirection: "column",
	width: "auto",
	gap: "25px",

	[props.theme.breakpoints.down("md")]: {
		marginTop: "5%",
	},
}));

// Typography
export const TitleStyled = styling(Typography)({
	fontSize: "4rem",
	fontWeight: "bold",
});

export const TextStyled = styling(Typography)({
	fontSize: "1.5rem",
});

export const SpanText = styling("span")({
	color: `var(--blue)`,
});
