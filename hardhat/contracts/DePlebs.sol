// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DePlebs is ERC721Enumerable, Ownable {

          /**
       * @dev _baseTokenURI for computing {tokenURI}. If set, the resulting URI for each
       * token will be the concatenation of the `baseURI` and the `tokenId`.
       */
       string _baseTokenURI;

        //    _price is the price for one DePleb NFT 
        uint256 public _price = 0.05 ether;

       // _paused is used to pause the contract in case of an emergency
       bool public _paused;

       // max number of DePlebs
       uint256 public maxTokenIds = 500;

       // boolean to keep track of whether public mint has started or not
       bool public publicMintStarted;

       // total number of tokenIds minted
       uint256 public tokenIds;

        // A mapping to keep track of which addresses minted 
        mapping (address => bool) public minted;

          /**
       * @dev ERC721 constructor takes in a `name` and a `symbol` to the token collection.
       * name in our case is `Crypto Devs` and symbol is `CD`.
       * Constructor for Crypto Devs takes in the baseURI to set _baseTokenURI for the collection.
       */

       constructor (string memory baseURI) ERC721("DePlebs", "DP") {
            _baseTokenURI = baseURI;
       }

       modifier onlyWhenNotPaused {
        require(!_paused, "Contract currently paused");
        _;
       }

        //  @dev publicMint starts a presale for the whitelisted addresses
        function startPublicMint() public onlyOwner {
            publicMintStarted = true;
        } 

        function mint() public payable onlyWhenNotPaused {
            require(publicMintStarted, "Public mint has not started");
            require(tokenIds < maxTokenIds, "Exceeded maximum DePlebs supply");
            require(msg.value >= _price, "Ether sent is not correct");
            tokenIds += 1;
            _safeMint(msg.sender, tokenIds);
            minted[msg.sender] = true; 
        }

              /**
                * @dev _baseURI overides the Openzeppelin's ERC721 implementation which by default
                * returned an empty string for the baseURI
            */
        function _baseURI() internal view virtual override returns (string memory) {
            return _baseTokenURI;
        }

             /**
      * @dev setPaused makes the contract paused or unpaused
       */
       function setPaused(bool val) public onlyOwner {
            _paused = val;
       }

              /**
      * @dev withdraw sends all the ether in the contract
      * to the owner of the contract
       */
       function withdraw() public onlyOwner {
            address _owner = owner();
            uint256 amount = address(this).balance;
            (bool sent, ) = _owner.call{value: amount}("");
            require(sent, "Failed to send Ether");
       }

       // Function to receive Ether. msg.data must be empty
       receive() external payable {}

       // Fallback function is called when msg.data is not empty
       fallback() external payable {}
}