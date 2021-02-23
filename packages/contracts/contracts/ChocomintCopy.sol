// SPDX-License-Identifier: MIT
pragma solidity ^0.7.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./ChocomintOriginal.sol";
import "./ChocomintLibrary.sol";

import "hardhat/console.sol";

contract ChocomintCopy is ERC1155, ChocomintLibrary {
  ChocomintOriginal public chocomintOriginal;

  // =C5*E5/D5/(A5+F5+C$2)

  uint256 public constant magic = 100;
  uint256 public constant royality = 100000;
  uint256 public constant weight = 100000;
  uint256 public constant base = 1000000;

  uint256 supply = 0;
  uint256 deposit = 1000000000000000000;

  mapping(uint256 => uint256) soldAt;

  constructor(ChocomintOriginal _chocomintOriginal) ERC1155("") {
    chocomintOriginal = _chocomintOriginal;
  }

  function getMintPrice() public view returns (uint256) {
    // return deposit / ((weight * (supply + magic)) / base);

    uint256 temp1 = supply + magic;
    uint256 temp2 = deposit / (temp1 * weight);
    return temp2 * base;
  }

  function getBurnPrice() public view returns (uint256) {
    uint256 temp1 = supply + magic - 1;
    uint256 temp2 = deposit / (temp1 * weight);
    uint256 temp3 = temp2 * base;
    console.log("temp3", temp3);
    uint256 royalityFee = (temp3 * weight) / base;
    uint256 addedToDeposit = temp3 - royalityFee;
    return addedToDeposit;
  }

  function mint(uint256 _originalId) public {
    console.log(" ");
    console.log("mint start");
    uint256 price = getMintPrice();
    console.log("supply", supply);
    console.log("deposit", deposit);
    console.log("price", price);

    uint256 royalityFee = (price * weight) / base;
    console.log("royalityFee", royalityFee);
    uint256 addedToDeposit = price - royalityFee;
    console.log("addedToDeposit", addedToDeposit);
    supply++;
    soldAt[supply] = addedToDeposit;
    console.log("now supply is changed to ", supply);
    deposit = deposit + addedToDeposit;
    console.log("now deposit is changed to ", deposit);
    require(
      chocomintOriginal.ownerOf(_originalId) != address(0x0),
      "token must exist"
    );

    _mint(msg.sender, _originalId, 1, "");
  }

  function burn(uint256 _originalId) public {
    console.log(" ");
    console.log("burn start");
    uint256 price = soldAt[supply];
    console.log("current supply", supply);
    console.log("deposit", deposit);
    console.log("price", price);

    supply--;
    console.log("now supply is changed to ", supply);
    deposit = deposit - price;
    console.log("now deposit is changed to ", deposit);

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
