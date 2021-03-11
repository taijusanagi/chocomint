export const shortenAddress = (rawAddress: string) => {
  const pre = rawAddress.substring(0, 5);
  const post = rawAddress.substring(38);
  return `${pre}...${post}`;
};

export const middlenAddress = (rawAddress: string) => {
  const pre = rawAddress.substring(0, 10);
  const post = rawAddress.substring(33);
  return `${pre}...${post}`;
};

// this should return text-size class acording to name length
export const shortenName = (rawName: string) => {
  if (rawName.length > 20) {
    const name = rawName.substring(0, 20);
    return `${name}...`;
  }
  return rawName;
};
