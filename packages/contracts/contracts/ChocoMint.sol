// SPDX-License-Identifier: MIT
pragma solidity 0.7.4;
pragma experimental ABIEncoderV2;

import "./VerifyIPFS.sol";

contract ChocoMint_V1 {
  struct Choco {
    string name;
    string description;
    string image;
    uint256 initial_price;
    uint256 creater_fee;
    uint256 minter_fee;
    address creator;
    address minter;
    bytes signature;
  }

  mapping(uint256 => Choco) public chocos;

  string public name = "EthereumChocoMint_v1";
  string public symbol = "ETHCM1";
  uint256 public mintedTokenIndex = 0;

  function mint(Choco memory choco) public {
    mintedTokenIndex++;
    chocos[mintedTokenIndex] = choco;
  }

  // function tokenURI() public view returns (string memory) {
  //   return
  //     string(
  //       Base64.encode(
  //         '{"name":"111","description":"111","image":"ipfs://ipfs/QmZ8NsEKRzivgcw4p9CEkUqU8Mo5ZBNiFN2wf33oTtnvvq/nft.png"}'
  //       )
  //     );
  // }
}
