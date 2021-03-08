// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./ChocomintWallet.sol";
import "./ChocomintUtils.sol";

contract ChocomintPublisher is ERC1155, ChocomintUtils {
  using ECDSA for bytes32;
  using SafeMath for uint256;

  event Published(
    uint256 pricing,
    uint256 duration,
    bytes32 indexed ipfsHash,
    address indexed creator,
    bytes signature,
    uint256 tokenId
  );

  event PrintMinted(
    address indexed operator,
    uint256 indexed tokenId,
    uint256 pricePaid,
    uint256 currentPrintSupply,
    uint256 reserve,
    uint256 creatorRoyality,
    uint256 ownerRoyality
  );

  event PrintBurned(
    address indexed operator,
    uint256 indexed tokenId,
    uint256 priceReceived,
    uint256 currentPrintSupply,
    uint256 reserve
  );

  mapping(uint256 => uint256) public totalSupply;
  mapping(uint256 => uint256) public durations;
  mapping(uint256 => uint256) public pricings;
  mapping(uint256 => bytes32) public ipfsHashes;

  mapping(uint256 => bool) public ownershipClaimed;
  mapping(uint256 => uint256) public beforeOwnershipClaimedHighestSupply;
  mapping(uint256 => uint256) public beforeOwnershipClaimedHighestSupplyAt;
  mapping(uint256 => address) public beforeOwnershipClaimedHighestSupplyBy;

  address private chocomintCreator;
  address private chocomintOwner;

  // This curve pricing value is coped from Euler Beats
  uint256 public reserve = 0;
  uint256 constant MAX_PRINT_SUPPLY = 120;
  uint256 constant K = 1 ether;
  uint256 constant B = 50;
  uint256 constant C = 26;
  uint256 constant D = 8;
  uint256 constant SIG_DIGITS = 3;

  uint256 constant CREATOR_RATIO = 1000;
  uint256 constant BASE_RATIO = 10000;

  constructor() ERC1155("") {}

  function initialize(address _chocomintCreator, address _chocomintOwner) public {
    require(
      chocomintCreator == address(0x0) && chocomintOwner == address(0x0),
      "contract is already initialized"
    );
    chocomintCreator = _chocomintCreator;
    chocomintOwner = _chocomintOwner;
  }

  function claimOwnership(uint256 _tokenId) public {
    require(!ownershipClaimed[_tokenId], "ownership is already claimed");
    if (beforeOwnershipClaimedHighestSupply[_tokenId] != MAX_PRINT_SUPPLY) {
      require(
        beforeOwnershipClaimedHighestSupplyAt[_tokenId] + durations[_tokenId] < block.timestamp,
        "ownership is already claimed"
      );
    }
    require(beforeOwnershipClaimedHighestSupplyBy[_tokenId] != msg.sender, "sender is invalid");
    ownershipClaimed[_tokenId] = true;
    ChocomintWallet(chocomintOwner).mint(msg.sender, _tokenId);
  }

  function mintPrint(
    uint256 _duration,
    uint256 _pricing,
    bytes32 _ipfsHash,
    address payable _creator,
    bytes memory _signature
  ) public payable {
    require(_duration > 0, "pricing should between 0 and BASE_RATIO");
    require(_pricing > 0 && _pricing < BASE_RATIO, "pricing should between 0 and BASE_RATIO");
    require(_ipfsHash != "", "ipfs hash should not be empty");
    bytes32 hash =
      keccak256(
        abi.encodePacked(_getChainId(), address(this), _duration, _pricing, _ipfsHash, _creator)
      );
    uint256 tokenId = uint256(hash);
    if (ipfsHashes[tokenId] == "") {
      require(
        hash.toEthSignedMessageHash().recover(_signature) == _creator,
        "creator signature must be valid"
      );
      ChocomintWallet(chocomintCreator).mint(_creator, tokenId);
      pricings[tokenId] = _pricing;
      durations[tokenId] = _duration;
      ipfsHashes[tokenId] = _ipfsHash;
      emit Published(_pricing, _duration, _ipfsHash, _creator, _signature, tokenId);
    }

    mintPrint(tokenId);
  }

  function mintPrint(uint256 _tokenId) public payable {
    require(pricings[_tokenId] > 0 || ipfsHashes[_tokenId] != "", "token is still not published");
    uint256 newSupply = totalSupply[_tokenId].add(1);
    uint256 printPrice = getPrintPrice(newSupply, pricings[_tokenId]);
    require(msg.value >= printPrice, "insufficient funds");
    totalSupply[_tokenId] = newSupply;

    if (!ownershipClaimed[_tokenId]) {
      if (beforeOwnershipClaimedHighestSupplyAt[_tokenId] + durations[_tokenId] > block.timestamp) {
        if (beforeOwnershipClaimedHighestSupply[_tokenId] < newSupply) {
          beforeOwnershipClaimedHighestSupply[_tokenId] = newSupply;
          beforeOwnershipClaimedHighestSupplyAt[_tokenId] = block.timestamp;
          beforeOwnershipClaimedHighestSupplyBy[_tokenId] = msg.sender;
        }
      }
    }

    uint256 reserveCut = getReserveCut(printPrice);

    reserve = reserve.add(reserveCut);
    _mint(msg.sender, _tokenId, 1, "");
    uint256 originalRoyalty = getCreatorRoyality(printPrice);

    uint256 creatorRoyalty;
    uint256 ownerRoyality;
    if (!ownershipClaimed[_tokenId]) {
      ChocomintWallet(chocomintCreator).deposit{ value: creatorRoyalty }(_tokenId);
    } else {
      uint256 separatedRoyality = creatorRoyalty.div(2);
      ChocomintWallet(chocomintCreator).deposit{ value: separatedRoyality }(_tokenId);
      ChocomintWallet(chocomintCreator).deposit{ value: separatedRoyality }(_tokenId);
    }

    emit PrintMinted(
      msg.sender,
      _tokenId,
      printPrice,
      newSupply,
      reserve,
      creatorRoyalty,
      ownerRoyality
    );

    if (msg.value.sub(printPrice) > 0) {
      payable(msg.sender).transfer(msg.value.sub(printPrice));
    }
  }

  function burnPrint(uint256 _tokenId, uint256 minimumSupply) public {
    require(ipfsHashes[_tokenId] != "", "token is still not registered");
    uint256 oldSupply = totalSupply[_tokenId];
    require(oldSupply >= minimumSupply, "Min supply not met");

    uint256 burnPrice = getBurnPrice(oldSupply, pricings[_tokenId]);
    uint256 newSupply = totalSupply[_tokenId].sub(1);
    totalSupply[_tokenId] = newSupply;

    reserve = reserve.sub(burnPrice);
    _burn(msg.sender, _tokenId, 1);
    emit PrintBurned(msg.sender, _tokenId, burnPrice, newSupply, reserve);
    payable(msg.sender).transfer(burnPrice);
  }

  // This curve pricing is coped from Euler Beats
  // Modified 1 ether -> K
  function getPrintPrice(uint256 _printNumber, uint256 _coefficient)
    public
    pure
    returns (uint256 price)
  {
    require(_printNumber <= MAX_PRINT_SUPPLY, "Maximum supply exceeded");
    uint256 decimals = 10**SIG_DIGITS;
    if (_printNumber < B) {
      price = (10**(B.sub(_printNumber))).mul(decimals).div(11**(B.sub(_printNumber)));
    } else if (_printNumber == B) {
      price = decimals;
    } else {
      price = (11**(_printNumber.sub(B))).mul(decimals).div(10**(_printNumber.sub(B)));
    }
    price = price.add(C.mul(_printNumber));
    price = price.sub(D);
    price = price.mul(K).div(decimals);

    // added to reduce price from original EulerBeats because Chocomint is made for cheaper NFT
    price = price.div(_coefficient);
  }

  // This curve pricing is coped from Euler Beats
  // Modified for fee distribution
  function getBurnPrice(uint256 supply, uint256 _coefficient) public pure returns (uint256) {
    uint256 printPrice = getPrintPrice(supply, _coefficient);
    return getReserveCut(printPrice);
  }

  // fee distribution

  // Get 90% cut for reserve
  function getReserveCut(uint256 _fee) public pure returns (uint256) {
    uint256 reserveRatio = BASE_RATIO.sub(CREATOR_RATIO);
    return _fee.mul(reserveRatio).div(BASE_RATIO);
  }

  // Get 10% cut for creator
  function getCreatorRoyality(uint256 _fee) public pure returns (uint256) {
    return _fee.mul(CREATOR_RATIO).div(BASE_RATIO);
  }

  function uri(uint256 _tokenId) public view override returns (string memory) {
    bytes32 hash = ipfsHashes[_tokenId];
    return string(_addIpfsBaseUrlPrefix(_bytesToBase58(_addSha256FunctionCodePrefix(hash))));
  }
}
