import React from "react";
import { TwitterShareButton, TwitterIcon } from "react-share";

import { analytics } from "../../modules/firebase";

export interface SharesProps {
  title?: string;
  url?: string;
}

export const Shares: React.FC<SharesProps> = ({ url, title }) => {
  const _title = title ? title : "#DeFi powered #NFTs at";
  const _url = url ? url : window.location.href;

  const onClickShare = () => {
    analytics.logEvent("click", {
      type: "button",
      name: "share_with_twitter",
    });
  };

  return (
    <div onClick={onClickShare}>
      <TwitterShareButton className="solidity" title={_title} via="chocomintapp" url={_url}>
        <TwitterIcon size={24} className="rounded-lg"></TwitterIcon>
      </TwitterShareButton>
    </div>
  );
};
