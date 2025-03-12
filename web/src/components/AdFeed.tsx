/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

interface AddFeedProps {
  adSlot: string;
  adClient: string;
  adFormat: string;
  adLayoutKey: string;
}

const AddFeed = ({
  adSlot,
  adClient,
  adFormat,
  adLayoutKey,
}: AddFeedProps): JSX.Element => {
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
      data-ad-format={adFormat}
      data-ad-client={adClient}
      style={{ display: "block" }}
      data-ad-layout-key={adLayoutKey}
    >
    </ins>
  );
};

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default AddFeed;