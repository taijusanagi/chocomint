// SPDX-License-Identifier: MIT
pragma solidity 0.7.4;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract ChocoMint_V1 is ERC721 {
  using ECDSA for bytes32;
  using Strings for uint256;

  struct Choco {
    string name;
    string description;
    string image;
    uint256 initial_price;
    uint256 creator_fee;
    address payable creator;
    bytes signature;
  }

  mapping(uint256 => Choco) public chocos;

  string public baseTokenUri = "https://ipfs.io/ipfs/";
  bytes public prefix1 = hex"0a";
  bytes public prefix2 = hex"080212";
  bytes public postfix = hex"18";
  bytes public sha256MultiHash = hex"1220";
  bytes public ALPHABET =
    "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

  constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

  function mint(Choco memory choco) public payable {
    require(msg.value == choco.initial_price, "Must pay initial_price");
    bytes32 hash =
      keccak256(
        abi.encodePacked(
          choco.name,
          choco.description,
          choco.image,
          choco.initial_price,
          choco.creator_fee,
          choco.creator
        )
      );
    bytes32 messageHash = hash.toEthSignedMessageHash();
    address signer = messageHash.recover(choco.signature);
    require(signer == choco.creator, "Must be signed by creator");
    uint256 tokenId = uint256(hash);
    chocos[tokenId] = choco;
    _mint(msg.sender, tokenId);
    choco.creator.transfer(choco.creator_fee);
  }

  function tokenURI(uint256 tokenId)
    public
    view
    override
    returns (string memory)
  {
    Choco memory choco = chocos[tokenId];
    bytes memory metadata =
      abi.encodePacked(
        '{"name":"',
        choco.name,
        '","description":"',
        choco.description,
        '","image":"',
        choco.image,
        '","initial_price":"',
        choco.initial_price.toString(),
        '","creator_fee":"',
        choco.creator_fee.toString(),
        '","creator":"',
        bytesToUTF8String(abi.encodePacked(choco.creator)),
        '","signature":"',
        bytesToUTF8String(choco.signature),
        '"}'
      );
    bytes memory cid = getCid(metadata);
    return string(abi.encodePacked(baseTokenUri, cid));
  }

  function getCid(bytes memory input) private view returns (bytes memory) {
    bytes memory len = lengthEncode(input.length);
    bytes memory len2 = lengthEncode(input.length + 4 + 2 * len.length);
    bytes memory source =
      abi.encodePacked(
        sha256MultiHash,
        abi.encodePacked(
          sha256(
            abi.encodePacked(prefix1, len2, prefix2, len, input, postfix, len)
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
      output[k] = ALPHABET[digits[digitlength - 1 - k]];
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

  function bytesToUTF8String(bytes memory data)
    private
    pure
    returns (string memory)
  {
    bytes memory alphabet = "0123456789abcdef";
    bytes memory str = new bytes(2 + data.length * 2);
    str[0] = "0";
    str[1] = "x";
    for (uint256 i = 0; i < data.length; i++) {
      str[2 + i * 2] = alphabet[uint256(uint8(data[i] >> 4))];
      str[3 + i * 2] = alphabet[uint256(uint8(data[i] & 0x0f))];
    }
    return string(str);
  }
}
