// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Code is copied from https://etherscan.io/address/0x8754F54074400CE745a7CEddC928FB1b7E985eD6#code
// modified by Taiju Sanagi (taijusanagi.eth)

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./ChocomintGenesis.sol";
import "./ChocomintRightsManager.sol";
import "./ChocomintRegistry.sol";
import "./ChocomintUtils.sol";

contract ChocomintPrint is ERC1155, ChocomintUtils {
  using SafeMath for uint256;

  mapping(uint256 => uint256) public totalSupply;

  address public chocomintRegistry;
  address public chocomintGenesis;
  address public chocomintCreator;
  address public chocomintRegisterer;

  uint256 public reserve = 0;

  uint256 constant MAX_PRINT_SUPPLY = 120;

  uint256 constant B = 50;
  uint256 constant C = 26;
  uint256 constant D = 8;
  uint256 constant SIG_DIGITS = 3;

  constructor() ERC1155("") {}

  function initialize(
    address _chocomintRegistry,
    address _chocomintGenesis,
    address _chocomintCreator,
    address _chocomintRegisterer
  ) public {
    require(
      chocomintRegistry == address(0x0) ||
        chocomintGenesis == address(0x0) ||
        chocomintCreator == address(0x0) ||
        chocomintRegisterer == address(0x0),
      "ChocomintGenesis: contract is already initialized"
    );
    chocomintRegistry = _chocomintRegistry;
    chocomintGenesis = _chocomintGenesis;
    chocomintCreator = _chocomintCreator;
    chocomintRegisterer = _chocomintRegisterer;
  }

  function mintPrint(uint256 nftId) public payable {
    require(
      ChocomintRegistry(chocomintRegistry).ipfsHashes(nftId) != "",
      "ChocomintPrint: metadata is still not registered"
    );
    uint256 oldSupply = totalSupply[nftId];

    uint256 printPrice = getPrintPrice(oldSupply + 1);
    require(msg.value >= printPrice, "ChocomintPrint: insufficient funds");

    uint256 newSupply = totalSupply[nftId].add(1);
    totalSupply[nftId] = newSupply;

    uint256 reserveCut = getBurnPrice(newSupply);
    reserve = reserve.add(reserveCut);

    uint256 nftIdOwnerRoyalty = _getNftOwnerCut(printPrice.sub(reserveCut));

    // uint256 nftCreatorRoyalty = 10;
    // uint256 nftRegistererRoyalty = 10;
    _mint(msg.sender, nftId, 1, "");

    ChocomintGenesis(chocomintGenesis).deposit{ value: nftIdOwnerRoyalty }(nftId);
    // ChocomintRightsManager(chocomintCreator).deposit{ value: nftCreatorRoyalty }(nftId);
    // ChocomintRightsManager(chocomintRegisterer).deposit{ value: nftRegistererRoyalty }(nftId);
    _refundSender(printPrice);
  }

  function getPrintPrice(uint256 printNumber) public pure returns (uint256 price) {
    require(printNumber <= MAX_PRINT_SUPPLY, "Maximum supply exceeded");
    uint256 decimals = 10**SIG_DIGITS;
    if (printNumber < B) {
      price = (10**(B.sub(printNumber))).mul(decimals).div(11**(B.sub(printNumber)));
    } else if (printNumber == B) {
      price = decimals; // price = decimals * (A ^ 0)
    } else {
      price = (11**(printNumber.sub(B))).mul(decimals).div(10**(printNumber.sub(B)));
    }
    price = price.add(C.mul(printNumber));
    price = price.sub(D);
    price = price.mul(1 ether).div(decimals);
  }

  function getBurnPrice(uint256 supply) public pure returns (uint256 price) {
    uint256 printPrice = getPrintPrice(supply);
    price = (printPrice * 90) / 100; // 90 % of print price
  }

  function uri(uint256 tokenId) public view override returns (string memory) {
    bytes32 hash = ChocomintRegistry(chocomintRegistry).ipfsHashes(tokenId);
    return string(_addIpfsBaseUrlPrefix(_bytesToBase58(_addSha256FunctionCodePrefix(hash))));
  }

  function _getNftOwnerCut(uint256 fee) internal pure returns (uint256) {
    return fee.mul(8).div(10);
  }

  function _refundSender(uint256 printPrice) internal {
    if (msg.value.sub(printPrice) > 0) {
      (bool success, ) = msg.sender.call{ value: msg.value.sub(printPrice) }("");
      require(success, "Refund failed");
    }
  }
}
