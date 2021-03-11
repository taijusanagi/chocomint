import React from "react";
import { TwitterShareButton, TwitterIcon } from "react-share";

export interface SharesProps {
  title?: string;
  url?: string;
}

export const Shares: React.FC<SharesProps> = ({ url, title }) => {
  const _title = title ? title : "#DeFi powered #NFTs at";
  const _url = url ? url : window.location.href;
  return (
    <div>
      <TwitterShareButton className="solidity" title={_title} via="chocomintapp" url={_url}>
        <TwitterIcon size={24} className="rounded-lg"></TwitterIcon>
      </TwitterShareButton>
    </div>
  );
};
