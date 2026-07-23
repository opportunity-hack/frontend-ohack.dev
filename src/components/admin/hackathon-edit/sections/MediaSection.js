import React from "react";
import dynamic from "next/dynamic";
import SectionContainer from "../SectionContainer";

const EventMediaManagement = dynamic(
  () => import("../../EventMediaManagement"),
  { ssr: false },
);

const MediaSection = ({ admin, accessToken, orgId }) => {
  const { hackathon, setField } = admin;
  return (
    <SectionContainer
      title="Media"
      description="Photos shown in the gallery on /hack/[event_id]/media and social posts (LinkedIn, Instagram, Threads) plus news article links displayed alongside them. Changes autosave."
    >
      <EventMediaManagement
        eventId={hackathon.event_id}
        accessToken={accessToken}
        orgId={orgId}
        photos={hackathon.event_photos || []}
        onPhotosChange={(p) => setField("event_photos", p)}
        socialPosts={hackathon.social_posts || []}
        onSocialPostsChange={(s) => setField("social_posts", s)}
      />
    </SectionContainer>
  );
};

export default MediaSection;
