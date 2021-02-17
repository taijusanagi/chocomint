// SPDX-License-Identifier: MIT
pragma solidity 0.7.4;
pragma experimental ABIEncoderV2;

contract ChocoMint_V1 {
  struct Choco {
    string name;
    string description;
    string image;
    // uint256 initial_price;
    // uint256 creater_fee;
    // uint256 minter_fee;
    // address creator;
    // address minter;
    // bytes signature;
  }

  mapping(uint256 => Choco) public chocos;

  uint256 public mintedTokenIndex = 0;
  string public name = "EthereumChocoMint_v1";
  string public symbol = "ETHCM1";
  string public baseTokenUri = "https://ipfs.io/ipfs/";
  bytes public prefix1 = hex"0a";
  bytes public prefix2 = hex"080212";
  bytes public postfix = hex"18";
  bytes public sha256MultiHash = hex"1220";
  bytes public ALPHABET =
    "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

  function mint(Choco memory choco) public {
    mintedTokenIndex++;
    chocos[mintedTokenIndex] = choco;
  }

  function tokenURI(uint256 tokenId) public view returns (string memory) {
    Choco memory choco = chocos[tokenId];

    bytes memory cid =
      getCid(
        abi.encodePacked(
          '{"name":"',
          choco.name,
          '","description":"',
          choco.description,
          '","image":"',
          choco.image,
          '"}'
        )
      );

    return string(abi.encodePacked(baseTokenUri, cid));
  }

  function getCid(bytes memory input) public view returns (bytes memory) {
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
    uint8[] memory digits = new uint8[](255);
    bytes memory output = new bytes(255);
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
      return to_binary(length);
    } else {
      return
        abi.encodePacked(
          to_binary((length % 128) + 128),
          to_binary(length / 128)
        );
    }
  }

  function to_binary(uint256 x) public view returns (bytes memory) {
    if (x == 0) {
      return new bytes(0);
    } else {
      bytes1 s = bytes1(uint8(x % 256));
      bytes memory r = new bytes(1);
      r[0] = s;
      return abi.encodePacked(to_binary(x / 256), r);
    }
  }
}
