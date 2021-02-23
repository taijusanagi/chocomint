// SPDX-License-Identifier: MIT
pragma solidity ^0.7.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./ChocomintOriginal.sol";
import "./ChocomintLibrary.sol";

import "hardhat/console.sol";

contract ChocomintCopy is ERC1155, ChocomintLibrary {
  ChocomintOriginal public chocomintOriginal;

  uint256 public constant BASE_RATIO = 1000000;

  uint256 public constant magic = 100;
  uint256 public constant royality = 100000;
  uint256 public constant weight = 100000;

  uint256 supply = 0;
  uint256 deposit = 1000000000000000000;

  mapping(uint256 => mapping(uint256 => uint256)) priceRecords;
  mapping(uint256 => uint256) supplies;
  mapping(uint256 => uint256) pools;

  constructor(ChocomintOriginal _chocomintOriginal) ERC1155("") {
    chocomintOriginal = _chocomintOriginal;
  }

  function getNewMintPrice(
    uint256 _pool,
    uint256 _supply,
    uint256 _magic,
    uint256 _weight
  ) public view returns (uint256) {
    return (_pool / ((_supply + _magic) * weight)) * BASE_RATIO;
  }

  function getRoyalityFromPrice(uint256 _price, uint256 _ratio)
    public
    pure
    returns (uint256)
  {
    require(_ratio < BASE_RATIO, "ratio must be less than base");
    return (_price * _ratio) / BASE_RATIO;
  }

  function getPoolFromPrice(uint256 _price, uint256 _ratio)
    public
    pure
    returns (uint256)
  {
    require(_ratio < BASE_RATIO, "ratio must be less than base");
    return (_price * (BASE_RATIO - _ratio)) / BASE_RATIO;
  }

  function mint(uint256 _originalId) public {
    uint256 currentSupply = supplies[_originalId];
    console.log("mint start current supply", currentSupply);
    uint256 currentPool = pools[_originalId] > 0 ? pools[_originalId] : deposit;
    uint256 price =
      priceRecords[_originalId][currentSupply] > 0
        ? priceRecords[_originalId][currentSupply]
        : getNewMintPrice(currentPool, currentSupply, magic, weight);

    console.log("price", price);
    priceRecords[_originalId][currentSupply] = price;
    uint256 royalityFee = getRoyalityFromPrice(price, royality);
    uint256 poolIncrease = getPoolFromPrice(price, royality);

    supplies[_originalId]++;
    console.log("now supply is changed to ", supplies[_originalId]);
    deposit += poolIncrease;
    console.log("now deposit is changed to ", deposit);
    require(
      chocomintOriginal.ownerOf(_originalId) != address(0x0),
      "token must exist"
    );

    _mint(msg.sender, _originalId, 1, "");
  }

  function burn(uint256 _originalId) public {
    uint256 currentSupply = supplies[_originalId];
    console.log("burn start current supply", currentSupply);
    uint256 price =
      getPoolFromPrice(priceRecords[_originalId][currentSupply - 1], royality);

    console.log("price", price);
    deposit = deposit - price;
    console.log("now deposit is changed to ", deposit);
    supplies[_originalId]--;
    require(
      chocomintOriginal.ownerOf(_originalId) != address(0x0),
      "token must exist"
    );
    _burn(msg.sender, _originalId, 1);
  }

  function getMetadata(uint256 tokenId) public view returns (string memory) {
    return
      string(
        abi.encodePacked(
          '{"chainId":"',
          uintToString(getChainId()),
          '","contractAddress":"',
          bytesToString(abi.encodePacked(address(this))),
          '","tokenId":"',
          uintToString(tokenId),
          '","name":"',
          bytes32ToString((chocomintOriginal.nameMemory(tokenId))),
          '","image":"',
          string(
            addIpfsBaseUrlPrefix(
              bytesToBase58(
                addSha256FunctionCodePrefix(
                  chocomintOriginal.imageMemory(tokenId)
                )
              )
            )
          ),
          '","signature":"',
          bytesToString(
            abi.encodePacked(
              chocomintOriginal.rMemory(tokenId),
              chocomintOriginal.sMemory(tokenId),
              uint8(chocomintOriginal.vMemory(tokenId))
            )
          ),
          '","iss":"',
          bytesToString(abi.encodePacked(chocomintOriginal.issMemory(tokenId))),
          '"}'
        )
      );
  }

  function uri(uint256 tokenId) public view override returns (string memory) {
    require(
      chocomintOriginal.ownerOf(tokenId) != address(0x0),
      "token must exist"
    );
    string memory metadata = getMetadata(tokenId);
    bytes32 digest = digetIpfsContent(abi.encodePacked(metadata));

    return
      string(
        abi.encodePacked(
          addIpfsBaseUrlPrefix(
            bytesToBase58(addSha256FunctionCodePrefix(digest))
          )
        )
      );
  }
}
