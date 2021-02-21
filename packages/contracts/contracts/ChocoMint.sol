// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/cryptography/MerkleProof.sol";
import "./ERC721.sol";

import "hardhat/console.sol";

contract Chocomint is ERC721 {
  using ECDSA for bytes32;

  uint256 public totalSupply;

  struct Choco {
    bytes32 name;
    bytes32 image;
    bytes32 animation_url;
    bytes32 external_url;
    // address payable creator;
    // address minter;
    // bytes32 root;
    // bytes32[] proof;
  }

  mapping(uint256 => Choco) public chocos;

  string public name = "NFT";
  string public symbol = "NFT";

  function testSet2(Choco memory choco) public payable {
    chocos[1] = choco;
  }

  function testGet() public view returns (string memory) {
    return string(abi.encodePacked(chocos[1].name));
  }

  function mint() public payable {
    // require(msg.value == choco.initial_price, "Must pay initial_price");
    // require(
    //   choco.fees.length <= choco.recipients.length,
    //   "Must be same length"
    // );
    // for (uint256 i = 0; i < choco.fees.length; i++) {
    //   require(choco.fees[i] != 0, "Must not be zero");
    //   require(choco.recipients[i] != address(0x0), "Must not be null address");
    // }
    // if (choco.sub != address(0x0)) {
    //   require(msg.sender == choco.sub, "Must be minted by sub");
    // }
    // bytes32 hash =
    //   keccak256(
    //     abi.encodePacked(
    //       uint256(31337), //chainId
    //       address(this),
    //       choco.name,
    //       choco.description,
    //       choco.image,
    //       choco.animation_url,
    //       choco.initial_price,
    //       choco.fees,
    //       choco.recipients,
    //       choco.iss,
    //       choco.sub
    //     )
    //   );
    // bool hashVerified = MerkleProof.verify(choco.proof, choco.root, hash);
    // require(hashVerified, "Must be included in merkle tree");
    // bytes32 messageHash = choco.root.toEthSignedMessageHash();
    // address signer = messageHash.recover(choco.signature);
    // require(signer == choco.iss, "Must be signed by iss");
    // uint256 tokenId = uint256(keccak256(abi.encodePacked(hash, choco.root)));
    // chocos[1] = choco;
    // bytesMemory[1] = test;
    // bytes32Memory[1] = tes2;
    _mint(msg.sender, 1);
    // choco.iss.transfer(choco.initial_price);
    // totalSupply++;
  }

  function tokenURI(uint256 tokenId) public view returns (string memory) {
    require(_exists(tokenId), "Must exist");
    console.log(getMetadata(tokenId));
    return
      string(
        abi.encodePacked(
          "ipfs://",
          getCid(abi.encodePacked(getMetadata(tokenId)))
        )
      );
  }

  function getMetadata(uint256 tokenId) public view returns (string memory) {
    return "test";
    // Choco memory choco = chocos[tokenId];
    // bytes memory anchor;
    // bytes memory strings;
    // bytes memory uints;
    // bytes memory addresses;
    // bytes memory verification;
    // {
    //   anchor = abi.encodePacked(
    //     '{"chainId":"',
    //     uintToString(getChainId()),
    //     '","contractAddress":"',
    //     bytesToString(abi.encodePacked(address(this))),
    //     '","tokenId":"',
    //     uintToString(tokenId)
    //   );
    // }
    // {
    //   strings = abi.encodePacked(
    //     '","name":"',
    //     choco.name,
    //     '","description":"',
    //     choco.description,
    //     '","image":"',
    //     choco.image,
    //     '","animation_url":"',
    //     choco.animation_url
    //   );
    // }
    // {
    //   uints = abi.encodePacked(
    //     '","initial_price":"',
    //     uintToString(choco.initial_price),
    //     '","fees":[',
    //     uintArrayToString(choco.fees)
    //   );
    // }
    // {
    //   addresses = abi.encodePacked(
    //     '],"recipients":[',
    //     addressArrayToString(choco.recipients),
    //     '],"iss":"',
    //     bytesToString(abi.encodePacked(choco.iss)),
    //     '","sub":"',
    //     bytesToString(abi.encodePacked(choco.sub))
    //   );
    // }
    // {
    //   verification = abi.encodePacked(
    //     '","root":"',
    //     bytesToString(abi.encodePacked(choco.root)),
    //     '","proof":[',
    //     bytes32ArrayToString(choco.proof),
    //     '],"signature":"',
    //     bytesToString(choco.signature),
    //     '"}'
    //   );
    // }
    // return
    //   string(abi.encodePacked(anchor, strings, uints, addresses, verification));
  }

  function getChainId() public pure returns (uint256) {
    uint256 id;
    assembly {
      id := chainid()
    }
    return id;
  }

  function getCid(bytes memory input) private view returns (bytes memory) {
    bytes memory alphabet =
      "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    bytes memory len = lengthEncode(input.length);
    bytes memory len2 = lengthEncode(input.length + 4 + 2 * len.length);
    bytes memory source =
      abi.encodePacked(
        hex"1220",
        abi.encodePacked(
          sha256(
            abi.encodePacked(
              hex"0a",
              len2,
              hex"080212",
              len,
              input,
              hex"18",
              len
            )
          )
        )
      );
    uint8[] memory digits = new uint8[](46);
    bytes memory output = new bytes(46);
    digits[0] = 0;
    uint8 digitlength = 1;
    for (uint256 i = 0; i < source.length; ++i) {
      uint256 carry = uint8(source[i]);
      for (uint256 j = 0; j < digitlength; ++j) {
        carry += uint256(digits[j]) * 256;
        digits[j] = uint8(carry % 58);
        carry = carry / 58;
      }
      while (carry > 0) {
        digits[digitlength] = uint8(carry % 58);
        digitlength++;
        carry = carry / 58;
      }
    }
    for (uint256 k = 0; k < digitlength; k++) {
      output[k] = alphabet[digits[digitlength - 1 - k]];
    }
    return output;
  }

  function lengthEncode(uint256 length) private view returns (bytes memory) {
    if (length < 128) {
      return uintToBinary(length);
    } else {
      return
        abi.encodePacked(
          uintToBinary((length % 128) + 128),
          uintToBinary(length / 128)
        );
    }
  }

  function uintToBinary(uint256 x) private view returns (bytes memory) {
    if (x == 0) {
      return new bytes(0);
    } else {
      bytes1 s = bytes1(uint8(x % 256));
      bytes memory r = new bytes(1);
      r[0] = s;
      return abi.encodePacked(uintToBinary(x / 256), r);
    }
  }

  function uintToString(uint256 value) internal pure returns (string memory) {
    if (value == 0) {
      return "0";
    }
    uint256 temp = value;
    uint256 digits;
    while (temp != 0) {
      digits++;
      temp /= 10;
    }
    bytes memory buffer = new bytes(digits);
    while (value != 0) {
      digits -= 1;
      buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
      value /= 10;
    }
    return string(buffer);
  }

  function uintArrayToString(uint256[] memory input)
    private
    pure
    returns (string memory)
  {
    bytes memory output;
    for (uint256 i; i < input.length; i++) {
      output = abi.encodePacked(
        output,
        i > 0 ? "," : "",
        '"',
        uintToString(input[i]),
        '"'
      );
    }
    return string(output);
  }

  function addressArrayToString(address[] memory input)
    private
    pure
    returns (string memory)
  {
    bytes memory output;
    for (uint256 i; i < input.length; i++) {
      output = abi.encodePacked(
        output,
        i > 0 ? "," : "",
        '"',
        bytesToString(abi.encodePacked(input[i])),
        '"'
      );
    }
    return string(output);
  }

  function bytes32ArrayToString(bytes32[] memory input)
    private
    pure
    returns (string memory)
  {
    bytes memory output;
    for (uint256 i; i < input.length; i++) {
      output = abi.encodePacked(
        output,
        i > 0 ? "," : "",
        '"',
        bytesToString(abi.encodePacked(input[i])),
        '"'
      );
    }
    return string(output);
  }

  function bytesToString(bytes memory input)
    private
    pure
    returns (string memory)
  {
    bytes memory alphabet = "0123456789abcdef";
    bytes memory output = new bytes(2 + input.length * 2);
    output[0] = "0";
    output[1] = "x";
    for (uint256 i = 0; i < input.length; i++) {
      output[2 + i * 2] = alphabet[uint256(uint8(input[i] >> 4))];
      output[3 + i * 2] = alphabet[uint256(uint8(input[i] & 0x0f))];
    }
    return string(output);
  }
}
