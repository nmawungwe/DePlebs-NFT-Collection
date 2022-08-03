import { Contract, providers, utils } from "ethers";
import React, { useEffect, useRef, useState } from "react";
import Head from "next/head";
import Web3Modal from "web3modal";
import {NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI } from "../constants";
import styles from "../styles/Home.module.css";

export default function Home() {

  // walletConnected keep track of whether the user's wallet is connected or not 
  const [walletConnected, setWalletConnected] = useState(false)
  const [mintingStarted, setMintingStarted] = useState(false)
  const  [isOwner, setIsOwner] = useState(false)

  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open 
  const web3ModalRef = useRef();

  /**
   * Returns a Provider or Signer object representing the Ethereum RPC with or without the 
   * signing capabilities of metamask attached
   * 
   * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc,
   * 
   * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the 
   * connected account needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to 
   * allow your website to request signatures from the user using Signer functions. 
   * 
   * @param{*} needSigner - True if you need the signer, default false otherwise
   */

  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask 
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Rinkeby network, let them know and throw an error 
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 4) {
      window.alert("Change the network to Rinkeby");
      throw new Error("Change network to Rinkeby");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer; 
    }
    return web3Provider;
  };

  // connectWallet: Connects the MetaMask wallet 
  const connectWallet = async () => {
    try {
        // Get the provider from the web3Modal, which in our case is MetaMask 
        await getProviderOrSigner();
        setWalletConnected(true);
    } catch (error) {
        console.log(error)
    }
  }

  // To start the public mint of the dePlebs NFT  
  const startPublicMint = async() => {
    try {
      // We need a Signer here since this is a 'writer' transaction 
      const signer = await getProviderOrSigner(true)
      // Create a new instance of the Contract with a Signer, which allows 
      // update methods 
      const dePlebContract = new Contract (
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );

        // calling the startPublicMint from contract 
      const tx = await dePlebContract.startPublicMint()
      await tx.wait()
      // set the mintingStarted to true 
      await checkIfPublicMintStarted()
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * checkIfPublicMintStarted: checks if the public mint has started by querying the 
   * `publicMintStarted` variable in the contract 
   */
  const checkIfPublicMintStarted = async () => {
    try {
      // Getting the provider from web3Modal, which in our case is MetaMask 
      // No need for the signer here, as we are only reading state from the blockchain 
      const provider = await getProviderOrSigner();
      // We are connecting to the Contract using a Provider, so we will only 
      // have read-only access to Contract 
      const dePlebContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      )
      // call the publicMint from the contract 
      const _publicMintStarted = await dePlebContract.publicMintStarted();
      if (!_publicMintStarted) {
        await getOwner();
      }
      setMintingStarted(_publicMintStarted);
      return _publicMintStarted;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  /**
   * getOwner: calls the contract to retrieve the owner
   */
  const getOwner = async () => {
    try {
        // Get the provider from web3Modal, which in our case is Metamask
        // No need for the Signer here, as we are only reading state from the blockchain 
      const provider = await getProviderOrSigner();
      // We connect to the Contract using a Provider, so we will only 
      // have read-only access to the Contract 
      const dePlebContract = new Contract (
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );
      // call the owner function from the contract 
      const _owner = await dePlebContract.owner();

      // We will get the signer now to extract the address of the currently connected Metamask account 
      const signer = await getProviderOrSigner(true);

      // Get the address associated to the signer which is connected to MetaMask
      const address = await signer.getAddress();

      if (address.toLowerCase() === _owner.toLowerCase()) {
        setIsOwner(true);        
      } 
    } catch (error) {
        console.error(error.message)
    }
  }

  const mint = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      // We connect to the Contract using a Provider, so we will only 
      // have read-only access to the Contract 
      const dePlebContract = new Contract (
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      )

        // Now calling the mint function 
      const tx = await dePlebContract.mint({
        // value signifies the cost of one dePleb NFT which is "0.001" ethers
        // We are parsing `0.001` string to the ether using the utils library from ether.js 
        value: utils.parseEther("0.001")
      });
      await tx.wait();
      window.alert("You successfully minted a DePleb NFT");
    } catch (error) {
      console.error(error)
    }

  }

  const onPageLoad = async () => {
    await connectWallet();
    await getOwner();
  }

  // useEffects are used to react to changes in state of the website
  // The array at the end of function call represents what state changes will trigger this effect
  // In this case, whenever the value of `walletConnected` changes - this effect will be called

  useEffect(() => {
    // if wallet is not connected, create a new instance of the Web3Modal and connect the MetaMask wallet 
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      })
      
      onPageLoad();
    }
  }, [walletConnected, isOwner]);

  const renderButton = () => {
    // if wallet is not connected, return a button which allows the user to connect wallet 
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      )
    }

    // if connected user is the owner, and the public mint hasn't started yet, allow them to start the 
    // public mint 
    if (isOwner && !mintingStarted) {
      return (
        <button className={styles.button} onClick={startPublicMint}>
          Start Public Mint
        </button>
      )
    }

    // If connected user is not owner and public mint hasn't yet started, inform the user 
    if (!mintingStarted) {
      return (
        <div>
          <div className={styles.description}>Public mint hasn't started!</div>
        </div>
      )
    }

    // If public mint has started 
    if (mintingStarted) {
      return(
        <button className={styles.button} onClick={mint}>
          Mint Now 🚀 
        </button>
      )
    }


  }



  return (
    <div>
      <Head>
        <title>DePlebs NFT Collection</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to DePlebs NFT</h1>
          <div className={styles.description}>
            It's an NFT collection of 500 degens on the Ethereum Blockchain!
          </div>
          <div className={styles.description}>
            /500 DePlebs have been minted
          </div>
          <div className={styles.buttonRow}>
            {renderButton()}
          </div>
          <div>
          <img className={styles.image} src="./dePlebs/1.png"/>
          </div>
        </div>
      </div>
      <footer className={styles.footer}>
        Made with &#10084; by Alisa
      </footer>
    </div>
  )


}