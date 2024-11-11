import tokenAbi from "./tokenAbi.json";
import stakingAbi from "./stakingAbi.json";
import airdropAbi from "./airdropAbi.json";
import presaleAbi from "./presaleAbi.json";
import usdtTokenAbi from "./usdtTokenAbi.json";
import { http, createConfig } from "@wagmi/core";
import { bscTestnet } from "@wagmi/core/chains";
import Web3 from "web3";

export const presaleContract = {
  address: "0x93c6dE0244ab7a637b89b01672ae32fc7193b90F", //testnet
  abi: presaleAbi,
};
export const airdropContract = {
  address: "0x7D7Cbf826C00920F58bED2eDB9af5cE781f7eD2A", //testnet
  abi: airdropAbi,
};

export const owner = "0x34F60988257c3895C0552014882e4dab4916baE7"

export const kafaStaking = {
  address: "0x665e6346C5118d342894a94BA08874661071Aa09", //testnet
  abi: stakingAbi,
};

export const iqopyStaking = {
  address: "0x62Cc061A3b14Ca7a21778Ac343AFFeBE945F2Cd2", //testnet
  abi: stakingAbi,
};

export const usdtContract = {
  address: "0x35BD1509a00CE3D6a7969A97cB075e0086A943cB", //testnet
  abi: usdtTokenAbi,
};
export const tokenContract = {
  address: "0x3fcb590b16003bF8326B27EfD806c53a6368419b", //testnet
  abi: tokenAbi,
};

export const config = createConfig({
  chains: [bscTestnet],
  transports: {
    [bscTestnet.id]: http(),
  },
});


export const rpcUrl = "https://bsc-testnet-rpc.publicnode.com"

export const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
//export const wallet = web3.eth.accounts.wallet.add(privateKey)    //(import.meta.env.VITE_SOME_KEY)
export const presaleContractR = new web3.eth.Contract(presaleAbi, presaleContract.address);

export const bscUrl = "https://testnet.bscscan.com/address/";
export const ActiveChain = 97;
export let getSliceAddress = (address) =>
  address?.slice(0, 4) + "..." + address?.slice(-4);
export const getCommas = (value, percision = 2) => {
  value = parseFloat(value).toFixed(percision);
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
