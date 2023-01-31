import { useRouter } from "next/router";
import NewsletterSubscriptionButton from "./buttons/newsletter-button";

export default function NewsletterResponses(props) {
  const router = useRouter();
  const { user_Id } = router.query;

  return (
    <div>
      <span>{props.message}</span>
      <NewsletterSubscriptionButton text={props.type} user_id={user_Id}></NewsletterSubscriptionButton>
    </div>
  );
}