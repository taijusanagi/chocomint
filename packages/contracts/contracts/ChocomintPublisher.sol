// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import { IWETHGateway } from "@aave/protocol-v2/contracts/misc/interfaces/IWETHGateway.sol";

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./ChocomintOwnership.sol";
import "./ChocomintUtils.sol";

import "hardhat/console.sol";

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
  address public chocomintOwnership;
  address public aaveEthGateway;
  string public name;
  string public symbol;

  constructor(string memory _name, string memory _symbol) public ERC1155("") {
    name = _name;
    symbol = _symbol;
  }

  function initialize(address _chocomintOwnership, address _aaveEthGateway) public {
    require(chocomintOwnership == address(0x0), "contract is already initialized");
    chocomintOwnership = _chocomintOwnership;
    aaveEthGateway = _aaveEthGateway;
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
    require(_creator != address(0x0), "creator should not be empty"); // this is checked by ECDSA as well, but intentionally tested here
    require(_supplyLimit > 0, "supplyLimit must be more than 0"); // if supply limit is 0, it can not be printed
    require(_virtualSupply > 0, "virtual supply must be more than 0"); // if virtual supply is 0, it makes price calculation fail

    // this check is just for data simplicity
    if (_crr == 0 || _crr.add(_royalityRatio) == BASE_RATIO) {
      require(_virtualSupply == 1, "virtual supply must be 1"); // if crr is 0 or crr and royality sum is 100%, virtual supply makes no difference
    }

    // if reserve is 0, it is 0 price sale, it seems like airdrop, so this case is intentinally allowed
    // require(_virtualReserve > 0, "virtual reserve must be more than 0");

    // if reserve is crr, get print price returns current reserve
    // this can be used for fixed price sale: crr 0% & royality 100%
    // this can be used for double price sale: crr 0% & royality 0%
    // require(_crr > 0, "weight must be more than 0");

    // if crr is more than base ratio it is ^100% crr and it is valid
    // require(_crr <= BASE_RATIO, "weight must be less than base ratio");

    require(_royalityRatio <= BASE_RATIO, "royality ratio must be less than base ratio"); // if royality ratio is more than 100% it will cause minus reserve

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
      ChocomintOwnership(chocomintOwnership).mint(_creator, tokenId);
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

    // this is aave integration
    IWETHGateway(aaveEthGateway).depositETH{ value: reserve }(msg.sender, 0);

    if (priceKeeper[_tokenId][currentTotalSupply] == 0) {
      priceKeeper[_tokenId][currentTotalSupply] = printPrice;
    }
    if (royality > 0) {
      // this is aave integration
      IWETHGateway(aaveEthGateway).depositETH{ value: reserve }(chocomintOwnership, 0);
      // ChocomintOwnership(chocomintOwnership).deposit{ value: royality }(_tokenId);
    }
    if (msg.value.sub(printPrice) > 0) {
      payable(msg.sender).transfer(msg.value.sub(printPrice));
    }
    uint256 nextPrintPrice = getPrintPrice(_tokenId);
    uint256 nextBurnPrice = getBurnPrice(_tokenId);
    emit PrintMinted(_tokenId, msg.sender, printPrice, royality, nextPrintPrice, nextBurnPrice);
  }

  function burnPrint(uint256 _tokenId, uint256 _minimumSupply) public {
    uint256 currentTotalSupply = totalSupplies[_tokenId];
    require(currentTotalSupply > 0, "total supply must be more than 0");
    require(currentTotalSupply >= _minimumSupply, "Min supply not met");
    uint256 burnPrice = getBurnPrice(_tokenId);
    totalSupplies[_tokenId] = currentTotalSupply.sub(1);
    totalReserves[_tokenId] = totalReserves[_tokenId].sub(burnPrice);
    _burn(msg.sender, _tokenId, 1);

    // this is aave integration
    IWETHGateway(aaveEthGateway).withdrawETH(burnPrice, msg.sender);
    // payable(msg.sender).transfer(burnPrice);

    uint256 nextPrintPrice = getPrintPrice(_tokenId);
    uint256 nextBurnPrice = getBurnPrice(_tokenId);
    emit PrintBurned(_tokenId, msg.sender, burnPrice, nextPrintPrice, nextBurnPrice);
  }

  function getPrintPrice(uint256 _tokenId) public view returns (uint256 price) {
    uint256 supply = totalSupplies[_tokenId].add(virtualSupplies[_tokenId]);
    uint256 reserve = totalReserves[_tokenId].add(virtualReserves[_tokenId]);
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
    // if crr is 0, it just returns reserve
    if (_crr == 0) {
      return _reserve;
    } else {
      return _reserve.div(_supply.mul(_crr)).mul(BASE_RATIO);
    }
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
