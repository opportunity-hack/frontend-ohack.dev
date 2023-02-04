// import { useRouter } from "next/router";
import NewsletterResponses from "../../../components/newsletter";
export default function Subscribe_to_newsletter() {
  // const router = useRouter();
  // const { user_Id } = router.query;
 
  return (
    <NewsletterResponses type="subscribe" message="We're happy you'd like to subscribe :) Click the button below to proceed"></NewsletterResponses>
  );

}


