/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

interface AdBannerProps {
  adSlot: string;
  adClient: string;
}

const AdBanner = ({
  adSlot,
  adClient,
}: AdBannerProps): JSX.Element => {
  React.useEffect(() => {
    try {
      ((window.adsbygoogle = window.adsbygoogle || []).push({}));
    } catch (err) {
      console.error(err);
    }
  }, []);

  return (
    <ins
      data-ad-slot={adSlot}
      className="adsbygoogle"
      data-ad-client={adClient}
      style={{ display: "inline-block", width: "100%", height: "25vh" }}
    >
    </ins>
  );
};

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default AdBanner;