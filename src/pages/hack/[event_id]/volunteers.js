// pages/hack/[event_id]/volunteers.js
import { useRouter } from "next/router";
import VolunteerAutoScroll from "../../../components/Hackathon/VolunteerAutoScroll";

const VolunteersPage = () => {
  const router = useRouter();
  const { event_id } = router.query;

  if (!event_id) {
    return null; // or a loading indicator
  }

  return <VolunteerAutoScroll event_id={event_id} />;
};

export default VolunteersPage;
