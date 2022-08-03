import { providers } from "ethers";
import React, { useEffect, useRef, useState } from "react";
import Head from "next/head";
import Web3Modal from "web3modal";
import styles from "../styles/Home.module.css";

export default function Home() {

  // walletConnected keep track of whether the user's wallet is connected or not 
  const [walletConnected, setWalletConnected] = useState(false)

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
      connectWallet();


    }
  }, [walletConnected]);



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
            <button className={styles.button}>
              Start Mint
            </button>
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