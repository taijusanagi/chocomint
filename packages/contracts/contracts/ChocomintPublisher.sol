// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

// @openzeppelin/contracts@4.0.0-rc.0
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

// @aave/protocol-v2@1.0.1
import "./ILendingPool.sol";
import "./IWETHGateway.sol";

import "./ChocomintOwnership.sol";
import "./ChocomintUtils.sol";

contract ChocomintPublisher is ERC1155, ChocomintUtils {
  using ECDSA for bytes32;
  using SafeMath for uint256;

  event Published(
    uint256 tokenId,
    bytes32 indexed ipfsHash,
    address indexed creator,
    address operator,
    address indexed currency,
    uint256 supplyLimit,
    uint256 initialPrice,
    uint256 diluter,
    uint256 weight,
    uint256 royalityRatio,
    bytes signature
  );

  event PrintMinted(
    uint256 indexed tokenId,
    address indexed operator,
    uint256 pricePaid,
    uint256 nextPrintPrice,
    uint256 nextBurnPrice,
    uint256 royality
  );

  event PrintBurned(
    uint256 indexed tokenId,
    address indexed operator,
    uint256 priceReceived,
    uint256 nextPrintPrice,
    uint256 nextBurnPrice
  );

  mapping(uint256 => address) public currencies;
  mapping(uint256 => bytes32) public ipfsHashes;
  mapping(uint256 => uint256) public supplyLimits;
  mapping(uint256 => uint256) public totalSupplies;
  mapping(uint256 => uint256) public initialPrices;
  mapping(uint256 => uint256) public diluters;
  mapping(uint256 => uint256) public crrs;
  mapping(uint256 => uint256) public royalityRatios;
  mapping(uint256 => mapping(uint256 => uint256)) public priceKeeper;
  mapping(uint256 => uint256) public reserveBalance;
  mapping(uint256 => uint256) public royalityBalance;

  uint256 constant BASE_RATIO = 10000;

  address public chocomintOwnership;
  address payable public aaveGateway;
  address payable public aaveEthGateway;
  string public name;
  string public symbol;

  constructor(string memory _name, string memory _symbol) public ERC1155("") {
    name = _name;
    symbol = _symbol;
  }

  function initialize(
    address _chocomintOwnership,
    address payable _aaveGateway,
    address payable _aaveEthGateway
  ) public {
    require(
      chocomintOwnership == address(0x0) ||
        aaveGateway == address(0x0) ||
        aaveEthGateway == address(0x0),
      "contract is already initialized"
    );
    chocomintOwnership = _chocomintOwnership;
    aaveGateway = _aaveGateway;
    aaveEthGateway = _aaveEthGateway;
  }

  function publishAndMintPrint(
    bytes32 _ipfsHash,
    address payable _creator,
    address _currency,
    uint256 _supplyLimit,
    uint256 _initialPrice,
    uint256 _diluter,
    uint256 _crr,
    uint256 _royalityRatio,
    bytes memory _signature,
    uint256 _price, // to mint print, this is not included for signature
    uint16 _referralCode // to mint print, this is not included for signature
  ) public payable {
    require(_ipfsHash != "", "ipfs hash should not be empty");
    require(_creator != address(0x0), "creator should not be empty");
    require(_supplyLimit > 0, "supplyLimit must be more than 0");
    require(_initialPrice > 0, "initialPrice must be more than 0");
    require(_diluter > 0, "virtual supply must be more than 0");
    require(_crr > 0, "crr must be more than 0");
    require(
      _crr.add(_royalityRatio) <= BASE_RATIO,
      "crr and royality ratio sum must be less than base ratio"
    );
    bytes32 hash =
      keccak256(
        abi.encodePacked(
          _getChainId(),
          address(this),
          _creator,
          _currency,
          _ipfsHash,
          _supplyLimit,
          _initialPrice,
          _diluter,
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
      ipfsHashes[tokenId] = _ipfsHash;
      currencies[tokenId] = _currency;
      supplyLimits[tokenId] = _supplyLimit;
      initialPrices[tokenId] = _initialPrice;
      diluters[tokenId] = _diluter;
      crrs[tokenId] = _crr;
      royalityRatios[tokenId] = _royalityRatio;
      emit Published(
        tokenId,
        _ipfsHash,
        _creator,
        msg.sender,
        _currency,
        _supplyLimit,
        _initialPrice,
        _diluter,
        _crr,
        _royalityRatio,
        _signature
      );
    }
    mintPrint(tokenId, _price, _referralCode);
  }

  function mintPrint(
    uint256 _tokenId,
    uint256 _price,
    uint16 _referralCode
  ) public payable {
    require(ipfsHashes[_tokenId] != "", "token is still not published");
    uint256 currentTotalSupply = totalSupplies[_tokenId];
    require(
      currentTotalSupply < supplyLimits[_tokenId],
      "total supply must be more than supply limit"
    );

    uint256 printPrice = getPrintPrice(_tokenId);
    require(_price >= printPrice, "msg value must be more than print price");
    address currency = currencies[_tokenId];
    if (currency == address(0x0)) {
      require(msg.value == _price, "msg value must be same as input price");
    }

    totalSupplies[_tokenId] = currentTotalSupply.add(1);
    uint256 royality = getRoyality(printPrice, _tokenId);
    uint256 reserve = printPrice.sub(royality);
    reserveBalance[_tokenId] = reserveBalance[_tokenId].add(reserve);
    if (priceKeeper[_tokenId][currentTotalSupply] == 0) {
      priceKeeper[_tokenId][currentTotalSupply] = printPrice;
    }
    royalityBalance[royality] = royalityBalance[royality].add(royality);
    _mint(msg.sender, _tokenId, 1, "");

    if (currency == address(0x0)) {
      IWETHGateway(aaveEthGateway).depositETH{ value: printPrice }(address(this), _referralCode);
    } else {
      ERC20(currency).transferFrom(msg.sender, address(this), _price);
      ILendingPool(aaveGateway).deposit(currency, printPrice, address(this), _referralCode);
    }

    uint256 nextPrintPrice = getPrintPrice(_tokenId);
    uint256 nextBurnPrice = getBurnPrice(_tokenId);

    if (_price.sub(printPrice) > 0 && currency == address(0x0)) {
      payable(msg.sender).transfer(_price.sub(printPrice));
    }
    emit PrintMinted(_tokenId, msg.sender, printPrice, royality, nextPrintPrice, nextBurnPrice);
  }

  function burnPrint(uint256 _tokenId, uint256 _minimumSupply) public {
    uint256 currentTotalSupply = totalSupplies[_tokenId];
    require(currentTotalSupply > 0, "total supply must be more than 0");
    require(currentTotalSupply >= _minimumSupply, "Min supply not met");
    uint256 burnPrice = getBurnPrice(_tokenId);
    totalSupplies[_tokenId] = currentTotalSupply.sub(1);
    reserveBalance[_tokenId] = reserveBalance[_tokenId].sub(burnPrice);
    _burn(msg.sender, _tokenId, 1);

    // this is aave integration
    IWETHGateway(aaveEthGateway).withdrawETH(burnPrice, msg.sender);
    // payable(msg.sender).transfer(burnPrice);

    uint256 nextPrintPrice = getPrintPrice(_tokenId);
    uint256 nextBurnPrice = getBurnPrice(_tokenId);
    emit PrintBurned(_tokenId, msg.sender, burnPrice, nextPrintPrice, nextBurnPrice);
  }

  function getPrintPrice(uint256 _tokenId) public view returns (uint256 price) {
    // uint256 supply = totalSupplies[_tokenId].add(virtualSupplies[_tokenId]);
    // uint256 reserve = reserveBalance[_tokenId].add(virtualReserves[_tokenId]);
    uint256 supply = 0;
    uint256 reserve = 0;
    return calculatePrintPrice(reserve, supply, crrs[_tokenId]);
  }

  function getBurnPrice(uint256 _tokenId) public view returns (uint256) {
    if (totalSupplies[_tokenId] == 0) {
      return 0;
    } else {
      uint256 lastPrintPrice = priceKeeper[_tokenId][totalSupplies[_tokenId].sub(1)];
      return calculateBurnPrice(lastPrintPrice, royalityRatios[_tokenId]);
    }
  }

  function getRoyality(uint256 _price, uint256 _tokenId) public view returns (uint256) {
    uint256 royalityRatio = royalityRatios[_tokenId];
    return calculateRoyality(_price, royalityRatio);
  }

  function calculatePrintPrice(
    uint256 _reserve,
    uint256 _supply,
    uint256 _crr
  ) public pure returns (uint256) {
    return _reserve.div(_supply.mul(_crr)).mul(BASE_RATIO);
  }

  function calculateBurnPrice(uint256 _lastPrintPrice, uint256 _royalityRatio)
    public
    pure
    returns (uint256)
  {
    return _lastPrintPrice.sub(calculateRoyality(_lastPrintPrice, _royalityRatio));
  }

  function calculateRoyality(uint256 _price, uint256 _royalityRatio) public pure returns (uint256) {
    return _price.mul(_royalityRatio).div(BASE_RATIO);
  }

  function uri(uint256 _tokenId) public view override returns (string memory) {
    bytes32 hash = ipfsHashes[_tokenId];
    return string(_addIpfsBaseUrlPrefix(_bytesToBase58(_addSha256FunctionCodePrefix(hash))));
  }
}
