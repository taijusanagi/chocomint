// SPDX-License-Identifier: MIT
pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

contract Chocomint is ERC721 {
  using ECDSA for bytes32;
  uint256 public totalSupply;

  mapping(uint256 => bytes32) public nameMemory;
  mapping(uint256 => bytes32) public imageMemory;
  mapping(uint256 => bytes32) public sMemory;
  mapping(uint256 => bytes32) public rMemory;
  mapping(uint256 => uint256) public vMemory;
  mapping(uint256 => uint256) public feeMemory;
  mapping(uint256 => address) public issMemory;

  string public name;
  string public symbol;

  constructor(string memory _name, string memory _symbol) public {
    name = _name;
    symbol = _symbol;
  }

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
      ecrecover(hash.toEthSignedMessageHash(), uint8(_v), _r, _s) == _iss,
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
    totalSupply++;
  }

  function bytes32ToString(bytes32 _bytes32)
    public
    pure
    returns (string memory)
  {
    uint8 i = 0;
    while (i < 32 && _bytes32[i] != 0) {
      i++;
    }
    bytes memory bytesArray = new bytes(i);
    for (i = 0; i < 32 && _bytes32[i] != 0; i++) {
      bytesArray[i] = _bytes32[i];
    }
    return string(bytesArray);
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
          bytes32ToString((nameMemory[tokenId])),
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

  function tokenURI(uint256 tokenId) external view returns (string memory) {
    require(_exists(tokenId), "token must exist");
    string memory metadata = getMetadata(tokenId);
    console.log(metadata);
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

  function getChainId() private pure returns (uint256) {
    uint256 id;
    assembly {
      id := chainid()
    }
    return id;
  }

  function addIpfsBaseUrlPrefix(bytes memory input)
    private
    view
    returns (bytes memory)
  {
    return abi.encodePacked("ipfs://", input);
  }

  function addSha256FunctionCodePrefix(bytes32 input)
    private
    view
    returns (bytes memory)
  {
    return abi.encodePacked(hex"1220", input);
  }

  function digetIpfsContent(bytes memory input) private view returns (bytes32) {
    bytes memory len = lengthEncode(input.length);
    bytes memory len2 = lengthEncode(input.length + 4 + 2 * len.length);
    return
      sha256(
        abi.encodePacked(hex"0a", len2, hex"080212", len, input, hex"18", len)
      );
  }

  function bytesToBase58(bytes memory input)
    private
    view
    returns (bytes memory)
  {
    bytes memory alphabet =
      "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    uint8[] memory digits = new uint8[](46);
    bytes memory output = new bytes(46);
    digits[0] = 0;
    uint8 digitlength = 1;
    for (uint256 i = 0; i < input.length; ++i) {
      uint256 carry = uint8(input[i]);
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
