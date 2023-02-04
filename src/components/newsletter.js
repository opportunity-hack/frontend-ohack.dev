import { useRouter } from "next/router";
import NewsletterSubscriptionButton from "./buttons/newsletter-button";

export default function NewsletterResponses(props) {
  const router = useRouter();
  const { user_Id } = router.query;

  return (
    <div className="full_height full_width grid_auto_auto flex_center flex_center_center">
      <h2>{props.message}</h2>
      <NewsletterSubscriptionButton text={props.type} user_id={user_Id}></NewsletterSubscriptionButton>
    </div>
  );
}