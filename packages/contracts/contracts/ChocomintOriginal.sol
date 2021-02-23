// SPDX-License-Identifier: MIT
pragma solidity ^0.7.4;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./ChocomintLibrary.sol";

contract ChocomintOriginal is ERC721, ChocomintLibrary {
  using ECDSA for bytes32;

  mapping(uint256 => bytes32) public nameMemory;
  mapping(uint256 => bytes32) public imageMemory;
  mapping(uint256 => bytes32) public sMemory;
  mapping(uint256 => bytes32) public rMemory;
  mapping(uint256 => uint256) public vMemory;
  mapping(uint256 => uint256) public feeMemory;
  mapping(uint256 => address) public issMemory;
  mapping(uint256 => bytes) public signatureMemory;

  constructor(string memory _name, string memory _symbol)
    ERC721(_name, _symbol)
  {}

  function mint(
    bytes32 _name,
    bytes32 _image,
    bytes32 _r,
    bytes32 _s,
    uint256 _v,
    address payable _iss
  ) external payable {
    bytes32 hash =
      keccak256(
        abi.encodePacked(
          getChainId(),
          address(this),
          msg.value,
          _name,
          _image,
          _iss
        )
      );
    require(
      hash.toEthSignedMessageHash().recover(
        abi.encodePacked(_r, _s, uint8(_v))
      ) == _iss,
      "signer must be equal to iss"
    );
    uint256 tokenId = uint256(hash);
    nameMemory[tokenId] = _name;
    imageMemory[tokenId] = _image;
    sMemory[tokenId] = _s;
    rMemory[tokenId] = _r;
    vMemory[tokenId] = _v;
    feeMemory[tokenId] = msg.value;
    issMemory[tokenId] = _iss;
    _mint(msg.sender, tokenId);
    _iss.transfer(msg.value);
  }

  function getMetadata(uint256 tokenId) public view returns (string memory) {
    return
      string(
        abi.encodePacked(
          '{"chainId":"',
          uintToString(getChainId()),
          '","contractAddress":"',
          bytesToString(abi.encodePacked(address(this))),
          '","tokenId":"',
          uintToString(tokenId),
          '","name":"',
          bytes32ToString(nameMemory[tokenId]),
          '","image":"',
          string(
            addIpfsBaseUrlPrefix(
              bytesToBase58(addSha256FunctionCodePrefix(imageMemory[tokenId]))
            )
          ),
          '","signature":"',
          bytesToString(
            abi.encodePacked(
              rMemory[tokenId],
              sMemory[tokenId],
              uint8(vMemory[tokenId])
            )
          ),
          '","iss":"',
          bytesToString(abi.encodePacked(issMemory[tokenId])),
          '"}'
        )
      );
  }

  function tokenURI(uint256 tokenId)
    public
    view
    override
    returns (string memory)
  {
    require(_exists(tokenId), "token must exist");
    string memory metadata = getMetadata(tokenId);
    bytes32 digest = digetIpfsContent(abi.encodePacked(metadata));

    return
      string(
        abi.encodePacked(
          addIpfsBaseUrlPrefix(
            bytesToBase58(addSha256FunctionCodePrefix(digest))
          )
        )
      );
  }
}
