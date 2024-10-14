import { useWeb3Modal } from "@web3modal/wagmi/react";
import React from "react";
import { useAccount, useConfig } from "wagmi";
import CommonButton from "../CommonButton";

function CustomAddress() {
  const config = useConfig();
  const { address } = useAccount();
  const { open } = useWeb3Modal();

  function handleOpen(){
    console.log("first")
    try{
      open();
    } catch(_e){
      open();
    }
  }

  return (
    <div>
      <button className="btn" onClick={handleOpen}>
        {address ? `${address.slice(0,5)}...${address.slice(-5)}` : "Connect Wallet"}
      </button>
    </div>
  );
}

export default CustomAddress;
