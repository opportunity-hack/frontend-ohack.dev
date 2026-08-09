import React, { useState } from "react";
import LiteVideoThumbnail from "../../VideoDisplay/LiteVideoThumbnail";
import VideoDisplay from "../../VideoDisplay/VideoDisplay";

const RAW_VIDEO_REGEX = /\.(mp4|webm|mov)(\?|#|$)/i;

/**
 * Bio video with a CWV-safe facade: a 16:9 box is always reserved, nothing
 * loads until the visitor clicks play. Raw CDN mp4s mount a native <video>;
 * provider links (YouTube/Vimeo/Loom) mount VideoDisplay's iframe.
 */
export default function BioVideoSection({ url, name }) {
  const [playing, setPlaying] = useState(false);

  if (!url) return null;
  const isRawFile = RAW_VIDEO_REGEX.test(url);

  if (playing) {
    return (
      <div style={{ marginTop: 18, maxWidth: 600 }}>
        {isRawFile ? (
          <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", background: "#000", borderRadius: 6 }}>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              src={url}
              controls
              autoPlay
              playsInline
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
            />
          </div>
        ) : (
          <VideoDisplay url={url} title={`Meet ${name || "this member"}`} />
        )}
      </div>
    );
  }

  return (
    <div style={{ marginTop: 18 }}>
      <LiteVideoThumbnail
        url={url}
        onClick={() => setPlaying(true)}
        width={600}
        height={338}
        label={`Meet ${name || "this member"}`}
      />
    </div>
  );
}
