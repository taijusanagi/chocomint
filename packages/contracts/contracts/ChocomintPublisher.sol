// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

// @openzeppelin/contracts@4.0.0-rc.0
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./interfaces/ILendingPool.sol";
import "./interfaces/IWETHGateway.sol";

import "./ChocomintOwnership.sol";
import "./ChocomintUtils.sol";

import "hardhat/console.sol";

contract ChocomintPublisher is ERC1155, ChocomintUtils {
  using ECDSA for bytes32;
  using SafeMath for uint256;

  event OwnershipClaimed(address indexed operator, uint256 indexed tokenId);
  event RoyaltyWithdrawed(address indexed operato, uint256 indexed tokenId, uint256 amount);

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
    uint256 royaltyRatio,
    bytes signature
  );

  event PrintMinted(
    address indexed operator,
    uint256 indexed tokenId,
    uint256 currentSupply,
    uint256 currentReserve,
    uint256 printPrice,
    uint256 royalty
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
  mapping(uint256 => uint256) public royaltyRatios;
  mapping(uint256 => mapping(uint256 => uint256)) public priceKeeper;
  mapping(uint256 => uint256) public reserveBalances;
  mapping(uint256 => uint256) public royaltyBalances;

  uint256 constant BASE_RATIO = 10000;
  uint256 constant MAX_INT = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;
  address public chocomintOwnership;
  address payable public aaveLendingPool;
  address payable public aaveWETHGateway;
  string public name;
  string public symbol;

  // owner operation

  constructor(string memory _name, string memory _symbol) ERC1155("") {
    name = _name;
    symbol = _symbol;
  }

  receive() external payable {}

  function initialize(
    address _chocomintOwnership,
    address payable _aaveLendingPool,
    address payable _aaveWETHGateway
  ) public {
    require(
      chocomintOwnership == address(0x0) ||
        aaveLendingPool == address(0x0) ||
        aaveWETHGateway == address(0x0),
      "contract is already initialized"
    );
    chocomintOwnership = _chocomintOwnership;
    aaveLendingPool = _aaveLendingPool;
    aaveWETHGateway = _aaveWETHGateway;

    // TODO: approve
    // address[] memory getReservesList = ILendingPool(aaveLendingPool).getReservesList();

    // for (uint256 i = 0; i < getReservesList.length; i++) {
    //   console.log(getReservesList[i]);
    // }

    // ここもう少しきれいに書きたい
    // aaveからトークンリストを取得する、もろもろapproveするっていう感じのロジックを書くのがいいと思っている
    ERC20(0x030bA81f1c18d280636F32af80b9AAd02Cf0854e).approve(aaveWETHGateway, MAX_INT);
  }

  // nft owner operation

  function claimOwnership(uint256 _tokenId) public {
    require(!ownershipClaimed[_tokenId], "ownership is already claimed");
    address to = creators[_tokenId];
    require(msg.sender == to, "msg sender must be eligible");
    ChocomintOwnership(chocomintOwnership).mint(to, _tokenId);
    emit OwnershipClaimed(to, _tokenId);
  }

  function withdrawRoyalty(uint256 _tokenId) public {
    address tempTo;
    if (ownershipClaimed[_tokenId]) {
      tempTo = ChocomintOwnership(chocomintOwnership).ownerOf(_tokenId);
    } else {
      tempTo = creators[_tokenId];
    }
    address payable to = payable(tempTo);
    require(msg.sender == to, "msg sender must be eligible");
    address currency = currencies[_tokenId];
    uint256 royalty = royaltyBalances[_tokenId];
    royaltyBalances[_tokenId] = 0;
    _withdraw(to, currency, royalty);
    emit RoyaltyWithdrawed(to, _tokenId, royalty);
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
    uint256 _royaltyRatio,
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
      _crr.add(_royaltyRatio) <= BASE_RATIO,
      "crr and royalty ratio sum must be less than base ratio"
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
          _royaltyRatio
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
      royaltyRatios[tokenId] = _royaltyRatio;
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
        _royaltyRatio,
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
    (uint256 printPrice, uint256 reserve, uint256 royalty) = getPrintPrice(_tokenId); // this should be done before update storage
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
    royaltyBalances[_tokenId] = royaltyBalances[royalty].add(royalty);
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
    uint256 burnPrice = getBurnPrice(_tokenId); // this should be done before update storage
    // update storage
    totalSupplies[_tokenId] = currentTotalSupply.sub(1);
    reserveBalances[_tokenId] = currentReserveBalance.sub(burnPrice);
    _burn(msg.sender, _tokenId, 1);

    address currency = currencies[_tokenId];
    // this is aave integration
    _withdraw(payable(msg.sender), currency, burnPrice);

    emit PrintBurned(
      msg.sender,
      _tokenId,
      totalSupplies[_tokenId],
      reserveBalances[_tokenId],
      burnPrice
    );
  }

  function getPrintPrice(uint256 _tokenId)
    public
    view
    returns (
      uint256,
      uint256,
      uint256
    )
  {
    uint256 currentTotalSupply = totalSupplies[_tokenId];
    uint256 currentReserveBalance = reserveBalances[_tokenId];
    uint256 diluter = diluters[_tokenId];
    uint256 supply = currentTotalSupply.add(diluter);
    uint256 initialPrice = initialPrices[_tokenId];
    uint256 crr = crrs[_tokenId];
    uint256 virtualReserve = calculateVirtualReserve(initialPrice, diluter, crr);
    uint256 printPrice =
      calculatePrintPrice(currentReserveBalance.add(virtualReserve), supply, crr);
    uint256 royaltyRatio = royaltyRatios[_tokenId];
    uint256 royalty = calculateRoyalty(printPrice, royaltyRatio);
    uint256 reserve = printPrice.sub(royalty);
    return (printPrice, reserve, royalty);
  }

  function getBurnPrice(uint256 _tokenId) public view returns (uint256) {
    uint256 currentTotalSupply = totalSupplies[_tokenId];
    if (currentTotalSupply == 0) {
      return 0;
    } else {
      uint256 lastTotalSupply = currentTotalSupply.sub(1);
      uint256 lastPrintPrice = priceKeeper[_tokenId][lastTotalSupply];
      uint256 royaltyRatio = royaltyRatios[_tokenId];
      uint256 lastRoyalty = calculateRoyalty(lastPrintPrice, royaltyRatio);
      return lastPrintPrice.sub(lastRoyalty);
    }
  }

  function _deposit(
    address _currency,
    uint256 _price,
    uint16 _referralCode
  ) internal {
    if (_currency == address(0x0)) {
      IWETHGateway(aaveWETHGateway).depositETH{ value: _price }(address(this), _referralCode);
    } else {
      ERC20(_currency).transferFrom(msg.sender, address(this), _price);
      ILendingPool(aaveLendingPool).deposit(_currency, _price, address(this), _referralCode);
    }
  }

  function _withdraw(
    address payable _to,
    address _currency,
    uint256 _price
  ) internal {
    if (_currency == address(0x0)) {
      IWETHGateway(aaveWETHGateway).withdrawETH(_price, address(this));
      _to.transfer(_price);
    } else {
      ILendingPool(aaveLendingPool).withdraw(_currency, _price, address(this));
      IERC20(_currency).transferFrom(address(this), _to, _price);
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

  function calculateBurnPrice(
    uint256 _reserve,
    uint256 _supply,
    uint256 _crr
  ) public pure returns (uint256) {
    uint256 temp3 = (_reserve / (_supply.sub(1) * _crr)).mul(BASE_RATIO);
    uint256 royalityFee = (temp3 * _crr) / BASE_RATIO;
    uint256 addedToDeposit = temp3 - royalityFee;
    return addedToDeposit;
  }

  function calculateRoyalty(uint256 _price, uint256 _royaltyRatio) public pure returns (uint256) {
    return _price.mul(_royaltyRatio).div(BASE_RATIO);
  }

  function uri(uint256 _tokenId) public view override returns (string memory) {
    bytes32 hash = ipfsHashes[_tokenId];
    return string(_addIpfsBaseUrlPrefix(_bytesToBase58(_addSha256FunctionCodePrefix(hash))));
  }
}
