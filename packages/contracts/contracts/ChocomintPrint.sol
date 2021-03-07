// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Code is copied from https://etherscan.io/address/0x8754F54074400CE745a7CEddC928FB1b7E985eD6#code
// modified by Taiju Sanagi (taijusanagi.eth)

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./ChocomintWallet.sol";
import "./ChocomintRegistry.sol";
import "./ChocomintUtils.sol";

contract ChocomintPrint is ERC1155, ChocomintUtils {
  using SafeMath for uint256;

  event PrintMinted(
    address indexed operator,
    uint256 indexed tokenId,
    uint256 pricePaid,
    uint256 nextPrintPrice,
    uint256 nextBurnPrice,
    uint256 currentPrintSupply,
    uint256 reserve,
    uint256 genesisRoyalityPaid,
    uint256 creatorRoyalityPaid,
    uint256 registererRoyalityPaid
  );

  event PrintBurned(
    address indexed operator,
    uint256 indexed tokenId,
    uint256 priceReceived,
    uint256 nextPrintPrice,
    uint256 nextBurnPrice,
    uint256 currentPrintSupply,
    uint256 reserve
  );

  mapping(uint256 => uint256) public totalSupply;

  address private chocomintRegistry;
  address private chocomintGenesis;
  address private chocomintCreator;
  address private chocomintRegisterer;

  uint256 constant GENESIS_RATIO = 910;
  uint256 constant CREATOR_RATIO = 80;
  uint256 constant REGISTERER_RATIO = 10;
  uint256 constant BASE_RATIO = 10000;

  // This curve pricing value is coped from Euler Beats
  uint256 public reserve = 0;
  uint256 constant MAX_PRINT_SUPPLY = 120;
  uint256 constant K = 1 ether;
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

  function mintPrint(uint256 _tokenId) public payable {
    require(
      ChocomintRegistry(chocomintRegistry).ipfsHashes(_tokenId) != "",
      "token is still not registered"
    );

    uint256 newSupply = totalSupply[_tokenId].add(1);
    uint256 printPrice = getPrintPrice(newSupply);
    require(msg.value >= printPrice, "insufficient funds");
    totalSupply[_tokenId] = newSupply;

    uint256 reserveCut = getReserveCut(printPrice);
    uint256 genesisRoyalty = getGenesisRoyality(printPrice);
    uint256 creatorRoyalty = getCreatorRoyality(printPrice);
    uint256 registererRoyalty = getRegistererRoyality(printPrice);

    reserve = reserve.add(reserveCut);
    _mint(msg.sender, _tokenId, 1, "");

    ChocomintWallet(chocomintGenesis).deposit{ value: genesisRoyalty }(_tokenId);
    ChocomintWallet(chocomintCreator).deposit{ value: creatorRoyalty }(_tokenId);
    ChocomintWallet(chocomintRegisterer).deposit{ value: registererRoyalty }(_tokenId);

    if (msg.value.sub(printPrice) > 0) {
      payable(msg.sender).transfer(msg.value.sub(printPrice));
    }

    emit PrintMinted(
      msg.sender,
      _tokenId,
      printPrice,
      getPrintPrice(newSupply.add(1)),
      reserveCut,
      newSupply,
      reserve,
      genesisRoyalty,
      creatorRoyalty,
      registererRoyalty
    );
  }

  function burnPrint(uint256 _tokenId, uint256 minimumSupply) public {
    require(
      ChocomintRegistry(chocomintRegistry).ipfsHashes(_tokenId) != "",
      "token is still not registered"
    );
    uint256 oldSupply = totalSupply[_tokenId];
    require(oldSupply >= minimumSupply, "Min supply not met");

    uint256 burnPrice = getBurnPrice(oldSupply);
    uint256 newSupply = totalSupply[_tokenId].sub(1);
    totalSupply[_tokenId] = newSupply;

    reserve = reserve.sub(burnPrice);

    _burn(msg.sender, _tokenId, 1);

    payable(msg.sender).transfer(burnPrice);

    emit PrintBurned(
      msg.sender,
      _tokenId,
      burnPrice,
      getPrintPrice(oldSupply),
      getBurnPrice(newSupply),
      newSupply,
      reserve
    );
  }

  // This curve pricing is coped from Euler Beats
  // Modified 1 ether -> K
  function getPrintPrice(uint256 printNumber) public pure returns (uint256 price) {
    require(printNumber <= MAX_PRINT_SUPPLY, "Maximum supply exceeded");
    uint256 decimals = 10**SIG_DIGITS;
    if (printNumber < B) {
      price = (10**(B.sub(printNumber))).mul(decimals).div(11**(B.sub(printNumber)));
    } else if (printNumber == B) {
      price = decimals;
    } else {
      price = (11**(printNumber.sub(B))).mul(decimals).div(10**(printNumber.sub(B)));
    }
    price = price.add(C.mul(printNumber));
    price = price.sub(D);
    price = price.mul(K).div(decimals);
  }

  // This curve pricing is coped from Euler Beats
  // Modified for fee distribution
  function getBurnPrice(uint256 supply) public pure returns (uint256) {
    uint256 printPrice = getPrintPrice(supply);
    return getReserveCut(printPrice);
  }

  // fee distribution

  // Get 90% cut for reserve
  function getReserveCut(uint256 fee) public pure returns (uint256) {
    uint256 reserveRatio = BASE_RATIO.sub(GENESIS_RATIO).sub(CREATOR_RATIO).sub(REGISTERER_RATIO);
    return fee.mul(reserveRatio).div(BASE_RATIO);
  }

  // Get 9.1% cut for genesis owner
  function getGenesisRoyality(uint256 fee) public pure returns (uint256) {
    return fee.mul(GENESIS_RATIO).div(BASE_RATIO);
  }

  // Get 0.8% cut for creator
  function getCreatorRoyality(uint256 fee) public pure returns (uint256) {
    return fee.mul(CREATOR_RATIO).div(BASE_RATIO);
  }

  // Get 0.1% cut for registerer
  function getRegistererRoyality(uint256 fee) public pure returns (uint256) {
    return fee.mul(REGISTERER_RATIO).div(BASE_RATIO);
  }

  function uri(uint256 tokenId) public view override returns (string memory) {
    bytes32 hash = ChocomintRegistry(chocomintRegistry).ipfsHashes(tokenId);
    return string(_addIpfsBaseUrlPrefix(_bytesToBase58(_addSha256FunctionCodePrefix(hash))));
  }
}
