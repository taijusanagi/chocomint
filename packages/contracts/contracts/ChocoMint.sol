// SPDX-License-Identifier: MIT
pragma solidity ^0.7.3;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ChocoMint is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdTracker;

    constructor (string memory name, string memory symbol) ERC721(name, symbol) {
    }

    function mint(address to, string memory tokenURI) public {
        _mint(to, _tokenIdTracker.current());
        _setTokenURI(_tokenIdTracker.current(), tokenURI);
        _tokenIdTracker.increment();
    }
}