// SPDX-License-Identifier: MIT
pragma solidity 0.7.4;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/cryptography/MerkleProof.sol";

import "hardhat/console.sol";

contract ChocoMint is ERC721 {
  using ECDSA for bytes32;
  using Strings for uint256;

  struct Choco {
    string name;
    string description;
    string image;
    string blankSpace;
    uint256 exp;
    uint256 initialPrice;
    uint256[] fees;
    address[] recipients;
    address payable iss;
    address sub;
    bytes32 root;
    bytes32[] proof;
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

  function time() public view returns (uint256) {
    return block.timestamp;
  }

  function mint(Choco memory choco) public payable {
    require(block.timestamp <= choco.exp, "Must not be expired");
    require(msg.value == choco.initialPrice, "Must pay initial_price");
    require(
      choco.fees.length <= choco.recipients.length,
      "Must be same length"
    );
    for (uint256 i = 0; i < choco.fees.length; i++) {
      require(choco.fees[i] != 0, "Must not be zero");
      require(choco.recipients[i] != address(0x0), "Must not be null address");
    }
    if (choco.sub != address(0x0)) {
      require(msg.sender == choco.sub, "Must be minted by sub");
    }

    bytes32 hash =
      keccak256(
        abi.encodePacked(
          getChainID(),
          address(this),
          choco.name,
          choco.description,
          choco.image,
          choco.blankSpace,
          choco.exp,
          choco.initialPrice,
          choco.fees,
          choco.recipients,
          choco.iss,
          choco.sub
        )
      );
    bool hashVerified = MerkleProof.verify(choco.proof, choco.root, hash);
    require(hashVerified, "Must be included in merkle tree");
    bytes32 messageHash = choco.root.toEthSignedMessageHash();
    address signer = messageHash.recover(choco.signature);
    require(signer == choco.iss, "Must be signed by iss");
    uint256 tokenId = uint256(hash);
    chocos[tokenId] = choco;
    _mint(msg.sender, tokenId);
    choco.iss.transfer(choco.initialPrice);
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
        '{"chainId":"',
        getChainID().toString(),
        '","address":"',
        bytesToString(abi.encodePacked(address(this))),
        '","name":"',
        choco.name,
        '","description":"',
        choco.description,
        '","image":"',
        choco.image,
        '","blankSpace":"',
        choco.blankSpace,
        '","exp":"',
        choco.exp.toString(),
        '","initialPrice":"',
        choco.initialPrice.toString(),
        '","fees":"',
        uintArrayToString(choco.fees),
        '","recipients":"',
        addressArrayToString(choco.recipients),
        '","iss":"',
        bytesToString(abi.encodePacked(choco.iss)),
        '","sub":"',
        bytesToString(abi.encodePacked(choco.sub)),
        '","root":"',
        bytesToString(abi.encodePacked(choco.root)),
        '","proof":[',
        bytes32ArrayToString(choco.proof),
        '],"signature":"',
        bytesToString(choco.signature),
        '"}'
      );

    console.log(string(metadata));
    bytes memory cid = getCid(metadata);
    return string(abi.encodePacked(baseTokenUri, cid));
  }

  function getChainID() public pure returns (uint256) {
    uint256 id;
    assembly {
      id := chainid()
    }
    return id;
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
        input[i].toString(),
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
