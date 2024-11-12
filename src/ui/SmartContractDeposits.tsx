import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import PrivateSaleABI from './NewPrivateSaleABI.json';
import PresaleAbi from "../constants/presaleAbi.json"  
import axios from 'axios';
import { presaleContract } from '@/constants/environment';
import { bscTestnet,bsc } from 'viem/chains';

// The address of the deployed contract
const contractAddress =  presaleContract //'0xc2E2F67d4802824A7093679cf1247CF3276349Ee'; // replace with your contract address

// The ABI of the contract
const contractABI: AbiItem[] = PresaleAbi;

// Initialize web3 with the URL of your Ethereum node
//const web3 = new Web3('https://rpc.ankr.com/bsc'); // replace with your node URL

export const web3 = new Web3(bscTestnet.rpcUrls.default.http[0])

// Create a new contract instance with the contract address and ABI
export const contract = new web3.eth.Contract(PresaleAbi, presaleContract.address);

// Function to get the BNB to USD exchange rate
async function getBNBtoUSDExchangeRate(): Promise<number> {
  try {
      const response = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT');
      return parseFloat(response.data.price);
  } catch (error) {
      console.error('Error getting BNB to USD exchange rate:', error);
      return 0;
  }
}

// Function to get the BNB deposit for a specific address and convert it to USD
export async function getBNBDeposit(): Promise<string> {
  try {
      const address = '0xCa184fB4C8C0B675A8e457Bb918b78Df1A78a41e';
      const bnbDepositWei: string = await contract.methods.tokensSold().call() as string;
      const price: string = await contract.methods.tokenPrice().call() as string;

      const bnbDeposit = Number(web3.utils.fromWei(bnbDepositWei, 'ether'));
      const priceE = Number(web3.utils.fromWei(price, 'ether'));
      console.log("progress bar width",bnbDeposit,priceE)
      const exchangeRate = await getBNBtoUSDExchangeRate();
      const usdDeposit = (bnbDeposit  / priceE).toFixed(2);
   
      return usdDeposit;
  } catch (error) {
      console.error('Error getting BNB deposit:', error);
      return '';
  }
}

// Function to get the total deposit
// Uncomment this function when you're ready to use it
/*
export async function getTotalDeposit(): Promise<string> {
    const totalDeposit: string = await contract.methods.getTotalDeposit().call() as string;
    return totalDeposit;
}
*/