import { useEffect } from 'react';
import { useRouter } from 'next/router';

// This is a redirect component that preserves backward compatibility
const TeamRedirect = () => {
  const router = useRouter();
  const { event_id } = router.query;

  useEffect(() => {
    if (event_id) {
      // Redirect to the new manageteam page
      router.replace(`/hack/${event_id}/manageteam`);
    }
  }, [event_id, router]);

  // Return null while redirecting
  return null;
};

export default TeamRedirect;