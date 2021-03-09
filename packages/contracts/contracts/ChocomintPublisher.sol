// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./ChocomintCreator.sol";
import "./ChocomintUtils.sol";

contract ChocomintPublisher is ERC1155, ChocomintUtils {
  using ECDSA for bytes32;
  using SafeMath for uint256;

  event Published(
    uint256 indexed tokenId,
    bytes32 indexed ipfsHash,
    address indexed creator,
    address operator,
    uint256 supplyLimit,
    uint256 virtualSupply,
    uint256 virtualReserve,
    uint256 weight,
    uint256 royalityRatio,
    bytes signature
  );

  event PrintMinted(
    uint256 indexed tokenId,
    address indexed operator,
    uint256 pricePaid,
    uint256 royality
  );

  event PrintBurned(uint256 indexed tokenId, address indexed operator, uint256 priceReceived);

  mapping(uint256 => bytes32) public ipfsHashes;
  mapping(uint256 => mapping(uint256 => uint256)) public priceKeeper;
  mapping(uint256 => uint256) public supplyLimits;
  mapping(uint256 => uint256) public totalSupplies;
  mapping(uint256 => uint256) public virtualSupplies;
  mapping(uint256 => uint256) public totalReserves;
  mapping(uint256 => uint256) public virtualReserves;
  mapping(uint256 => uint256) public crrs;
  mapping(uint256 => uint256) public royalityRatios;
  uint256 constant BASE_RATIO = 10000;
  address public chocomintCreator;

  constructor() ERC1155("") {}

  function initialize(address _chocomintCreator) public {
    require(chocomintCreator == address(0x0), "contract is already initialized");
    chocomintCreator = _chocomintCreator;
  }

  function publishAndMintPrint(
    bytes32 _ipfsHash,
    address payable _creator,
    uint256 _supplyLimit,
    uint256 _virtualSupply,
    uint256 _virtualReserve,
    uint256 _crr,
    uint256 _royalityRatio,
    bytes memory _signature
  ) public payable {
    require(_ipfsHash != "", "ipfs hash should not be empty");
    require(_creator != address(0x0), "creator should not be empty");
    require(_supplyLimit > 0, "supplyLimit must be more than 0");
    require(_virtualSupply > 0, "virtual supply must be more than 0");
    require(_virtualReserve > 0, "virtual reserve must be more than 0");
    require(_crr > 0, "weight must be more than 0");
    require(_crr <= BASE_RATIO, "weight must be less than base ratio");
    require(_royalityRatio <= BASE_RATIO, "royality ratio must be less than base ratio");
    bytes32 hash =
      keccak256(
        abi.encodePacked(
          _getChainId(),
          address(this),
          _creator,
          _ipfsHash,
          _supplyLimit,
          _virtualSupply,
          _virtualReserve,
          _crr,
          _royalityRatio
        )
      );
    uint256 tokenId = uint256(hash);
    if (ipfsHashes[tokenId] == "") {
      require(
        hash.toEthSignedMessageHash().recover(_signature) == _creator,
        "creator signature must be valid"
      );
      ChocomintCreator(chocomintCreator).mint(_creator, tokenId);
      ipfsHashes[tokenId] = _ipfsHash;
      supplyLimits[tokenId] = _supplyLimit;
      virtualSupplies[tokenId] = _virtualSupply;
      virtualReserves[tokenId] = _virtualReserve;
      crrs[tokenId] = _crr;
      royalityRatios[tokenId] = _royalityRatio;
      emit Published(
        tokenId,
        _ipfsHash,
        _creator,
        msg.sender,
        _supplyLimit,
        _virtualSupply,
        _virtualReserve,
        _crr,
        _royalityRatio,
        _signature
      );
    }
    mintPrint(tokenId);
  }

  function mintPrint(uint256 _tokenId) public payable {
    require(ipfsHashes[_tokenId] != "", "token is still not published");
    uint256 currentTotalSupply = totalSupplies[_tokenId];
    require(
      currentTotalSupply < supplyLimits[_tokenId],
      "total supply must be more than supply limit"
    );
    uint256 printPrice = getPrintPrice(_tokenId);
    require(msg.value >= printPrice, "msg value must be more than print price");
    totalSupplies[_tokenId] = currentTotalSupply.add(1);
    uint256 royality = getRoyality(printPrice, _tokenId);
    uint256 reserve = printPrice.sub(royality);
    totalReserves[_tokenId] = totalReserves[_tokenId].add(reserve);
    _mint(msg.sender, _tokenId, 1, "");
    if (royality > 0) {
      ChocomintCreator(chocomintCreator).deposit{ value: royality }(_tokenId);
    }
    if (msg.value.sub(printPrice) > 0) {
      payable(msg.sender).transfer(msg.value.sub(printPrice));
    }
    emit PrintMinted(_tokenId, msg.sender, printPrice, royality);
  }

  function burnPrint(uint256 _tokenId, uint256 minimumSupply) public {
    uint256 currentTotalSupply = totalSupplies[_tokenId];
    require(currentTotalSupply > 0, "total supply must be more 0");
    require(currentTotalSupply >= minimumSupply, "Min supply not met");
    uint256 burnPrice = getBurnPrice(currentTotalSupply);
    totalSupplies[_tokenId] = currentTotalSupply.sub(1);
    totalReserves[_tokenId] = totalReserves[_tokenId].sub(burnPrice);
    _burn(msg.sender, _tokenId, 1);
    payable(msg.sender).transfer(burnPrice);
    emit PrintBurned(_tokenId, msg.sender, burnPrice);
  }

  function getPrintPrice(uint256 _tokenId) public view returns (uint256 price) {
    uint256 reserve = totalReserves[_tokenId].add(virtualReserves[_tokenId]);
    uint256 supply = totalSupplies[_tokenId].add(virtualSupplies[_tokenId]);
    return calculatePrintPrice(reserve, supply, crrs[_tokenId]);
  }

  function getBurnPrice(uint256 _tokenId) public view returns (uint256) {
    uint256 lastPrintPrice = priceKeeper[_tokenId][totalSupplies[_tokenId].sub(1)];
    return calculateBurnPrice(lastPrintPrice, royalityRatios[_tokenId]);
  }

  function getRoyality(uint256 _price, uint256 _tokenId) public view returns (uint256) {
    uint256 royalityRatio = royalityRatios[_tokenId];
    return calculateRoyality(_price, royalityRatio);
  }

  function calculateRoyality(uint256 _price, uint256 _royalityRatio) public pure returns (uint256) {
    return _price.mul(_royalityRatio).div(BASE_RATIO);
  }

  function calculatePrintPrice(
    uint256 _reserve,
    uint256 _supply,
    uint256 _crr
  ) public pure returns (uint256) {
    return _reserve.div(_supply.mul(_crr).div(BASE_RATIO));
  }

  function calculateBurnPrice(uint256 _lastPrintPrice, uint256 _royalityRatio)
    public
    pure
    returns (uint256)
  {
    return _lastPrintPrice.mul(_royalityRatio).div(BASE_RATIO);
  }

  function uri(uint256 _tokenId) public view override returns (string memory) {
    bytes32 hash = ipfsHashes[_tokenId];
    return string(_addIpfsBaseUrlPrefix(_bytesToBase58(_addSha256FunctionCodePrefix(hash))));
  }
}
