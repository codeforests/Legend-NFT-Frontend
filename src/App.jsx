import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import { ethers } from "ethers";

import React, { useEffect, useState } from 'react';
import LegendNFT from "./utils/MyLegendNFT"

// Constants
const TWITTER_HANDLE = 'codeforests';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_COLLECTION_LINK = 'https://testnets.opensea.io/collection/dev-legend-nft-v3';
const CONTRACT_ADDRESS = "0x5c5b13e9B7902FaE3BE0f946f2bD0bEb092Ce54F";

const App = () => {

  const [currentAccount, setCurrentAccount] = useState("");

  const [totalSupply, setTotalSupply] = useState("");
  const [totalMinted, setTotalMinted] = useState("");


  const rinkebyChainId = "0x4"; 

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask installed");
      return;
    } else {
      console.log("we have connected to ethereum wallet!", ethereum);
    }

    let chainId = await ethereum.request({ method: 'eth_chainId' });
    console.log("Connected to chain " + chainId);

    if (chainId !== rinkebyChainId) {
      alert("You are not connected to the Rinkeby Test Network!");
    }
  
    const accounts = await ethereum.request({method : 'eth_accounts'});

    if (accounts.length != 0) {
      const account = accounts[0];
      console.log("found an authorized account:", account);
      setCurrentAccount(account);
    } else {
      console.log("No authorized account found!");
    }
  }

  const connectWallet = async () => {
    try {
      const {ethereum} = window;

      if (!ethereum) {
        alert("Please install MetaMask first!");
        return;
      }

      const accounts = await ethereum.request({method : "eth_requestAccounts"});

      console.log("connected", accounts[0]);
      setCurrentAccount(accounts[0]);

    } catch (error) {

      console.log(error);
    }
  }

    const getTotalNFTsMinted = async () => {
    try {
      const {ethereum} = window;

      if (ethereum) {
        
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, LegendNFT.abi, signer);

        let totalSuppy = await connectedContract.totalSupply();
        setTotalSupply(totalSuppy.toNumber());

        let totalMinted = await connectedContract.getTotalNFTsMintedSoFar();
        setTotalMinted(totalMinted.toNumber());

      }

    } catch (error) {

      console.log(error);
    }
  }


  const setupEventListener = async () => {

    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, LegendNFT.abi, signer);
        connectedContract.on("newLegendNFTMinted", (from, tokenId) => {
          console.log( from, tokenId.toNumber);
          alert(`Hey there! You've minted your NFT, it can take a max of 15 mins to show in your wallet! Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`);
        
        getTotalNFTsMinted();

        });

         console.log("Event listener created!")
        
        }
    } catch (error) {
      console.log("Ethereum object does not exist")
    }
  }

  const askContractToMintNFT = async () => {

    try {
      const {ethereum} = window;

      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, LegendNFT.abi, signer);

        console.log("going to pop wallet now to pay the gas");

        let nftTxn = await connectedContract.makeLegendNFT();
        console.log("Mining in process...");

        await nftTxn.wait();

        console.log(`Minted, see transaction from here: \n https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);


      }
    } catch (error) {
      console.log(error)
    }
  }

  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  const renderMintButton = () => (
    <div>
    <p className="sub-text-2"> Minted: {totalMinted} / Total: {totalSupply} </p>
    <button onClick={askContractToMintNFT} className="cta-button connect-wallet-button">
    Mint NFT
    </button>
    </div>
  )

  useEffect(() => {
    checkIfWalletIsConnected();
    getTotalNFTsMinted();
    }, [])


  return (

    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">NFT Collections For Developers</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
           {currentAccount === "" ? renderNotConnectedContainer() : renderMintButton()}
        </div>
        <div className="footer-container">
        
          <div>
          🌊 <a className="footer-text" href={OPENSEA_COLLECTION_LINK}>
          View on OpenSea</a>
          </div>

          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;