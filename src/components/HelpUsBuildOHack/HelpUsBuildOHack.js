// Import styles
import {
    HelpUsBuildOHackContainer,
    HelpUsBuildOHackTitle,
    HelpUsBuildOHackDescription,
    HelpUsBuildOHackLink
} from "./styles";


export default function HelpUsBuildOHack({ github_link, github_name }) {

    // Use the same look and feel as other components
    // Give the reader some motivation to help us build this
    // Provide a link to the Github issue
    return (
        <HelpUsBuildOHackContainer>
            <HelpUsBuildOHackTitle>Help Us Build OHack.dev</HelpUsBuildOHackTitle>
            <HelpUsBuildOHackDescription>This portion is a work in progress and, more importantly, this site is open source and we welcome your contributions.          <HelpUsBuildOHackLink href={github_link} target="_blank">Please see {github_name} for more information</HelpUsBuildOHackLink>
            </HelpUsBuildOHackDescription>
        </HelpUsBuildOHackContainer>
    );
}

