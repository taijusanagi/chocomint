// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

// @openzeppelin/contracts@4.0.0-rc.0
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./ChocomintPublisher.sol";
import "./ChocomintUtils.sol";

contract ChocomintOwnership is ERC721, ChocomintUtils {
  mapping(uint256 => uint256) public balances;

  event Depositted(address indexed operator, uint256 indexed tokenId, uint256 amount);
  event Withdrawed(address indexed operator, uint256 indexed tokenId, uint256 amount);

  address public chocomintPublisher;
  address public aaveEthGateway;

  constructor(string memory name, string memory symbol) public ERC721(name, symbol) {}

  function initialize(address _chocomintPublisher) public {
    require(chocomintPublisher == address(0x0), "contract is already initialized");
    chocomintPublisher = _chocomintPublisher;
  }

  function deposit(uint256 _tokenId) public payable {
    balances[_tokenId] += msg.value;
    emit Depositted(msg.sender, _tokenId, msg.value);
  }

  function withdraw(uint256 _tokenId) public {
    require(msg.sender == ownerOf(_tokenId), "msg sender must be nft owner");
    uint256 reward = balances[_tokenId];
    require(reward > 0, "reward must be more than 0");
    balances[_tokenId] = 0;
    IWETHGateway(aaveEthGateway).withdrawETH(reward, address(this));
    payable(msg.sender).transfer(reward);
    emit Withdrawed(msg.sender, _tokenId, reward);
  }

  function mint(address _to, uint256 _tokenId) public {
    require(msg.sender == chocomintPublisher, "msg sender is not chocomint publisher");
    _mint(_to, _tokenId);
  }

  function tokenURI(uint256 _tokenId) public view override returns (string memory) {
    require(_exists(_tokenId), "token must exist");
    bytes32 hash = ChocomintPublisher(chocomintPublisher).ipfsHashes(_tokenId);
    return string(_addIpfsBaseUrlPrefix(_bytesToBase58(_addSha256FunctionCodePrefix(hash))));
  }
}
