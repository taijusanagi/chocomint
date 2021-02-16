// SPDX-License-Identifier: MIT
pragma solidity ^0.7.3;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ChocoMint721 is ERC721 {
    constructor (string memory name, string memory symbol) ERC721(name, symbol) {
    }

    function mint(address to, string memory tokenURI) public {
        uint256 tokenId = uint256(keccak256(abi.encodePacked(tokenURI)));
        _mint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
    }
}