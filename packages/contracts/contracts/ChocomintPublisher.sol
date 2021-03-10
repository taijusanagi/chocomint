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

import "hardhat/console.sol";

contract ChocomintPublisher is ERC1155, ChocomintUtils {
  using ECDSA for bytes32;
  using SafeMath for uint256;

  event OwnershipClaimed(address indexed operator, uint256 indexed tokenId);
  event RoyalityWithdrawed(address indexed operato, uint256 indexed tokenId, uint256 amount);

  event Published(
    address operator,
    uint256 tokenId,
    bytes32 indexed ipfsHash,
    address indexed creator,
    address indexed currency,
    uint256 supplyLimit,
    uint256 initialPrice,
    uint256 diluter,
    uint256 crr,
    uint256 royalityRatio,
    bytes signature
  );

  event PrintMinted(
    address indexed operator,
    uint256 indexed tokenId,
    uint256 currentSupply,
    uint256 currentReserve,
    uint256 printPrice,
    uint256 royality
  );

  event PrintBurned(
    address indexed operator,
    uint256 indexed tokenId,
    uint256 currentSupply,
    uint256 currentReserve,
    uint256 burnPrice
  );

  mapping(uint256 => bool) public ownershipClaimed;
  mapping(uint256 => address) public currencies;
  mapping(uint256 => address) public creators;
  mapping(uint256 => bytes32) public ipfsHashes;
  mapping(uint256 => uint256) public supplyLimits;
  mapping(uint256 => uint256) public totalSupplies;
  mapping(uint256 => uint256) public initialPrices;
  mapping(uint256 => uint256) public diluters;
  mapping(uint256 => uint256) public crrs;
  mapping(uint256 => uint256) public royalityRatios;
  mapping(uint256 => mapping(uint256 => uint256)) public priceKeeper;
  mapping(uint256 => uint256) public reserveBalances;
  mapping(uint256 => uint256) public royaltyBalances;

  uint256 constant BASE_RATIO = 10000;

  address public chocomintOwnership;
  address payable public aaveGateway;
  address payable public aaveEthGateway;
  string public name;
  string public symbol;

  // owner operation

  constructor(string memory _name, string memory _symbol) ERC1155("") {
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

  // nft owner operation

  function claimOwnership(uint256 _tokenId) public {
    require(!ownershipClaimed[_tokenId], "ownership is already claimed");
    address to = creators[_tokenId];
    require(msg.sender == to, "msg sender must be eligible");
    ChocomintOwnership(chocomintOwnership).mint(to, _tokenId);
    emit OwnershipClaimed(to, _tokenId);
  }

  function withdraw(uint256 _tokenId) public {
    address tempTo;
    if (ownershipClaimed[_tokenId]) {
      tempTo = ChocomintOwnership(chocomintOwnership).ownerOf(_tokenId);
    } else {
      tempTo = creators[_tokenId];
    }
    address payable to = payable(tempTo);
    require(msg.sender == to, "msg sender must be eligible");
    address currency = currencies[_tokenId];
    uint256 royality = royaltyBalances[_tokenId];
    royaltyBalances[_tokenId] = 0;
    if (currency == address(0x0)) {
      IWETHGateway(aaveEthGateway).withdrawETH(royality, address(this));
      to.transfer(royality);
    } else {
      ILendingPool(aaveGateway).withdraw(currency, royality, address(this));
      IERC20(currency).transferFrom(address(this), to, royality);
    }
    RoyalityWithdrawed(to, _tokenId, royality);
  }

  // user operation

  function publishAndMintPrint(
    address _currency,
    address payable _creator,
    bytes32 _ipfsHash,
    uint256 _supplyLimit,
    uint256 _initialPrice,
    uint256 _diluter,
    uint256 _crr,
    uint256 _royalityRatio,
    bytes memory _signature,
    uint256 _price, // to mint print, this is not included for signature
    uint16 _referralCode // to mint print, this is not included for signature
  ) public payable {
    require(_creator != address(0x0), "creator should not be empty");
    require(_ipfsHash != "", "ipfs hash should not be empty");
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
          _currency,
          _creator,
          _ipfsHash,
          _supplyLimit,
          _initialPrice,
          _diluter,
          _crr,
          _royalityRatio
        )
      );
    uint256 tokenId = uint256(hash);

    // this is used for check nft is already published
    if (creators[tokenId] == address(0x0)) {
      require(
        hash.toEthSignedMessageHash().recover(_signature) == _creator,
        "creator signature must be valid"
      );
      currencies[tokenId] = _currency;
      creators[tokenId] = _creator;
      ipfsHashes[tokenId] = _ipfsHash;
      supplyLimits[tokenId] = _supplyLimit;
      initialPrices[tokenId] = _initialPrice;
      diluters[tokenId] = _diluter;
      crrs[tokenId] = _crr;
      royalityRatios[tokenId] = _royalityRatio;
      emit Published(
        msg.sender,
        tokenId,
        _ipfsHash,
        _creator,
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
    // this is used for check nft is already published
    require(creators[_tokenId] != address(0x0), "token is still not published");
    // keep current info befor update and validate
    uint256 currentTotalSupply = totalSupplies[_tokenId];
    uint256 currentReserveBalance = reserveBalances[_tokenId];
    require(
      currentTotalSupply < supplyLimits[_tokenId],
      "total supply must be more than supply limit"
    );

    // get prices and validate
    (uint256 printPrice, uint256 reserve, uint256 royalty) =
      _getPrintPrices(_tokenId, currentTotalSupply, currentReserveBalance);
    require(_price >= printPrice, "msg value must be more than print price");
    address currency = currencies[_tokenId];
    if (currency == address(0x0)) {
      require(msg.value == _price, "msg value must be same as input price");
    }
    if (priceKeeper[_tokenId][currentTotalSupply] == 0) {
      priceKeeper[_tokenId][currentTotalSupply] = printPrice;
    }

    // update storage
    totalSupplies[_tokenId] = currentTotalSupply.add(1);
    reserveBalances[_tokenId] = currentReserveBalance.add(reserve);
    royaltyBalances[royalty] = royaltyBalances[royalty].add(royalty);

    // mint token
    _mint(msg.sender, _tokenId, 1, "");

    // deposit to aave
    _deposit(currency, printPrice, _referralCode);

    // refund if user paid more than print price (slippage)
    if (_price.sub(printPrice) > 0 && currency == address(0x0)) {
      payable(msg.sender).transfer(_price.sub(printPrice));
    }

    // event submission
    emit PrintMinted(
      msg.sender,
      _tokenId,
      totalSupplies[_tokenId],
      reserveBalances[_tokenId],
      printPrice,
      royalty
    );
  }

  function burnPrint(uint256 _tokenId, uint256 _minimumSupply) public {
    // this is used for check nft is already published
    require(creators[_tokenId] != address(0x0), "token is still not published");

    // keep current info befor update and validate
    uint256 currentTotalSupply = totalSupplies[_tokenId];
    uint256 currentReserveBalance = reserveBalances[_tokenId];
    require(currentTotalSupply > 0, "total supply must be more than 0");
    require(currentTotalSupply >= _minimumSupply, "Min supply not met");
    uint256 burnPrice = 0; //getBurnPrice(_tokenId);

    // update storage
    totalSupplies[_tokenId] = currentTotalSupply.sub(1);
    reserveBalances[_tokenId] = currentReserveBalance.sub(burnPrice);
    _burn(msg.sender, _tokenId, 1);

    // this is aave integration
    IWETHGateway(aaveEthGateway).withdrawETH(burnPrice, msg.sender);
    // payable(msg.sender).transfer(burnPrice);

    uint256 nextPrintPrice = 0; //getPrintPrice(_tokenId);
    uint256 nextBurnPrice = 0; //getBurnPrice(_tokenId);
    emit PrintBurned(msg.sender, _tokenId, burnPrice, nextPrintPrice, nextBurnPrice);
  }

  function _getPrintPrices(
    uint256 _tokenId,
    uint256 _currentTotalSupply,
    uint256 _currentReserveBalance
  )
    internal
    view
    returns (
      uint256,
      uint256,
      uint256
    )
  {
    uint256 supply = _currentTotalSupply.add(diluters[_tokenId]);
    uint256 initialPrice = initialPrices[_tokenId];
    uint256 diluter = diluters[_tokenId];
    uint256 crr = crrs[_tokenId];
    uint256 virtualReserve = calculateVirtualReserve(initialPrice, diluter, crr);
    uint256 printPrice =
      calculatePrintPrice(_currentReserveBalance.add(virtualReserve), supply, crr);
    uint256 royalityRatio = royalityRatios[_tokenId];
    uint256 royalty = calculateRoyality(printPrice, royalityRatio);
    uint256 reserve = printPrice.sub(royalty);
    return (printPrice, reserve, royalty);
  }

  function _getBurnPrices(uint256 _tokenId, uint256 _currentTotalSupply)
    internal
    view
    returns (uint256)
  {
    if (_currentTotalSupply == 0) {
      return 0;
    } else {
      uint256 lastTotalSupply = _currentTotalSupply.sub(1);
      uint256 lastPrintPrice = priceKeeper[_tokenId][lastTotalSupply];
      uint256 royalityRatio = royalityRatios[_tokenId];
      uint256 lastRoyality = calculateRoyality(lastPrintPrice, royalityRatio);
      return lastPrintPrice.sub(lastRoyality);
    }
  }

  function _deposit(
    address currency,
    uint256 _price,
    uint16 _referralCode
  ) internal {
    if (currency == address(0x0)) {
      IWETHGateway(aaveEthGateway).depositETH{ value: _price }(address(this), _referralCode);
    } else {
      ERC20(currency).transferFrom(msg.sender, address(this), _price);
      ILendingPool(aaveGateway).deposit(currency, _price, address(this), _referralCode);
    }
  }

  // public view

  function calculateVirtualReserve(
    uint256 _initialPrice,
    uint256 _diluter,
    uint256 _crr
  ) public pure returns (uint256) {
    return _initialPrice.mul(_diluter).mul(_crr).div(BASE_RATIO);
  }

  function calculatePrintPrice(
    uint256 _reserve,
    uint256 _supply,
    uint256 _crr
  ) public pure returns (uint256) {
    return _reserve.mul(BASE_RATIO).div(_crr).div(_supply);
  }

  function calculateRoyality(uint256 _price, uint256 _royalityRatio) public pure returns (uint256) {
    return _price.mul(_royalityRatio).div(BASE_RATIO);
  }

  function uri(uint256 _tokenId) public view override returns (string memory) {
    bytes32 hash = ipfsHashes[_tokenId];
    return string(_addIpfsBaseUrlPrefix(_bytesToBase58(_addSha256FunctionCodePrefix(hash))));
  }
}
