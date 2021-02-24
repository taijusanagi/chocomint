// SPDX-License-Identifier: MIT
pragma solidity ^0.5.17;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ChocomintOriginal is ERC721 {
  using ECDSA for bytes32;

  mapping(uint256 => bytes32) public nameMemory;
  mapping(uint256 => bytes32) public imageMemory;
  mapping(uint256 => address) public issMemory;

  string public name;
  string public symbol;

  constructor(string memory _name, string memory _symbol) public {
    name = _name;
    symbol = _symbol;
  }

  function mintByCreator(bytes32 _name, bytes32 _image) external payable {
    uint256 tokenId = _getTokenId(_name, _image, msg.sender);
    _setChoco(tokenId, _name, _image, msg.sender);
    _mint(msg.sender, tokenId);
  }

  function mintByPurchaser(
    bytes32 _name,
    bytes32 _image,
    bytes32 _r,
    bytes32 _s,
    uint256 _v,
    uint256 _price,
    address payable _iss
  ) external payable {
    uint256 tokenId = _getTokenId(_name, _image, _iss);
    bytes32 hash = keccak256(abi.encodePacked(tokenId, _price));
    require(
      hash.toEthSignedMessageHash().recover(
        abi.encodePacked(_r, _s, uint8(_v))
      ) == _iss,
      "signer must be equal to iss"
    );
    _setChoco(tokenId, _name, _image, _iss);
    _mint(msg.sender, tokenId);
    _iss.transfer(msg.value);
  }

  function _setChoco(
    uint256 tokenId,
    bytes32 _name,
    bytes32 _image,
    address _iss
  ) private {
    nameMemory[tokenId] = _name;
    imageMemory[tokenId] = _image;
    issMemory[tokenId] = _iss;
  }

  function tokenURI(uint256 tokenId) external view returns (string memory) {
    require(_exists(tokenId), "token must exist");
    return
      string(
        abi.encodePacked(
          ipfsDigestToIpfsUrl(
            bytesToIpfsDigest(
              abi.encodePacked(
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
                    string(ipfsDigestToIpfsUrl(imageMemory[tokenId])),
                    '","iss":"',
                    bytesToString(abi.encodePacked(issMemory[tokenId])),
                    '"}'
                  )
                )
              )
            )
          )
        )
      );
  }

  function bytesToIpfsDigest(bytes memory input)
    private
    view
    returns (bytes32)
  {
    bytes memory len = lengthEncode(input.length);
    bytes memory len2 = lengthEncode(input.length + 4 + 2 * len.length);
    return
      sha256(
        abi.encodePacked(hex"0a", len2, hex"080212", len, input, hex"18", len)
      );
  }

  function getChainId() private pure returns (uint256) {
    uint256 id;
    assembly {
      id := chainid()
    }
    return id;
  }

  function _getTokenId(
    bytes32 _name,
    bytes32 _image,
    address _iss
  ) private view returns (uint256) {
    return
      uint256(
        keccak256(
          abi.encodePacked(getChainId(), address(this), _name, _image, _iss)
        )
      );
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

  function addIpfsBaseUrlPrefix(bytes memory input)
    private
    pure
    returns (bytes memory)
  {
    return abi.encodePacked("ipfs://", input);
  }

  function addSha256FunctionCodePrefix(bytes32 input)
    private
    pure
    returns (bytes memory)
  {
    return abi.encodePacked(hex"1220", input);
  }

  function bytes32ToString(bytes32 _bytes32)
    private
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

  function bytesToBase58(bytes memory input)
    private
    pure
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

  function ipfsDigestToIpfsUrl(bytes32 input)
    private
    pure
    returns (bytes memory)
  {
    return
      addIpfsBaseUrlPrefix(bytesToBase58(addSha256FunctionCodePrefix(input)));
  }

  function uintToString(uint256 value) private pure returns (string memory) {
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
}
