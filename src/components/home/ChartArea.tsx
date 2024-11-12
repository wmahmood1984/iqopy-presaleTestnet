"use client"
import { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';
import Image from 'next/image';
import Staking from "@/components/Staking/Staking";

import chartImg from "@/assets/img/images/chart_img.png"
import ReferralPanel from './ReferralPanel';
import { presaleContract, presaleContractR } from '@/constants/environment';
import { formatEther } from 'viem';
import { useAccount, useConfig } from 'wagmi';
import {
   writeContract,
   waitForTransactionReceipt,
   readContract,
 } from "@wagmi/core";

const tab_title: string[] = ["Funding Allocation", "Token Distribution",];
const chart_List_1: string[] = ["Legal & Regulation: 20%", "Business Development: 15%", "ICO Liquidity: 30%", "Development Team: 15%", "Marketing: 10%", "Cash Reserves: 10%"]
const chart_List_2: string[] = ["Seed & Private Sale: 10%", "Development Team: 30%", "Presale: 20%", "Staking and Rewards: 25%", "Initial Circulation: 5%",  "Treasury: 10%"]
let mode=false;

interface ChartAreaProps {
 //  mode: string; // Replace 'string' with the specific type if it's not always a string
   withdrawLoading: boolean;
   setWithdrawLoading: React.Dispatch<React.SetStateAction<boolean>>;
 }



const ChartArea: React.FC<ChartAreaProps> = ({withdrawLoading, setWithdrawLoading }) => {
   const config = useConfig();
   const { address, isConnected, chain } = useAccount();
   const [referralBalance,setReferralbalance] = useState("0")
   const [activeTab, setActiveTab] = useState(0);


   useEffect(()=>{
      const abc = async ()=>{
         if(address){
            const _referralBalance:any = await presaleContractR.methods.bnbReferralRewards(address).call()
            setReferralbalance(formatEther(_referralBalance))
         }

      }

      abc()

   },[address])

   const [protocol, setProtocol] = useState("");
const [host, setHost] = useState("");

  const [loading, setloading] = useState(false);

  useEffect(() => {
   if (typeof window !== "undefined") {
     setProtocol(window.location.protocol);
     setHost(window.location.host);
   }
 }, []);

   const withdrawReferral = async () => {
      
      try {
        setloading(true);

    

          // Buy using BNB

          const buyHash = await writeContract(config, {
            //...presaleContract,
            address:"0x6C963D1F69bda3657112C9a688240364cf61F39c",
            abi:presaleContract.abi,
            functionName: "withdrawBNBReferralRewards",
          });
          const receipt = await waitForTransactionReceipt(config, { hash: buyHash });
          
          if (receipt.status) {
            setloading(false)
          } 
        
      } catch (error) {
        
        console.log("Error:", error);
      } finally {
        setloading(false); // Ensure loading is turned off after transaction is processed
      }
    };

   console.log("referral balance",protocol,host)

   // Handle tab click event
   const handleTabClick = (index: any) => {
      setActiveTab(index);
   };


   const chartData = [
      [30, 30, 30, 15, 20, 10], // Funding Allocation percentages
      [10, 30, 20, 25, 5, 10]  // Token Distribution percentages
   ];

   const data = {
      // labels: ["Contingency", "Business Development", "Investor", "Poland", "Legal & Regulation", "Czech Republic"],
      datasets: [
         {
            label: 'Allocation',
            data: chartData[activeTab],
            backgroundColor: ["#44A08D", "#136F84", "#0B446D", "#033356", "#012641", "#191F28"]
         }
      ],
   };

   return (
      <>
      <section id="chart">
      <Staking mode={mode} withdrawLoading={withdrawLoading} setWithdrawLoading={setWithdrawLoading}/>
      <ReferralPanel referralBalance={referralBalance} referralCode={`${protocol}//${host}/?referralCode=${address}`} onWithdraw={withdrawReferral}/>
      <div className="chart-area pt-140">
      
         <div className="container">
            <div className="chart-inner-wrap">
               <div className="row align-items-center">
                  <div className="col-lg-6">
                     <div className="chart-wrap">
                        <div className="chart">
                           <div id="doughnutChart">
                              {chartData[activeTab] && <Doughnut data={data} />}
                           </div>
                        </div>
                        <div className="chart-tab">
                           <ul className="nav nav-tabs" id="myTab" role="tablist">
                              {tab_title.map((tab, index) => (
                                 <li key={index} className="nav-item">
                                    <button onClick={() => handleTabClick(index)}
                                       className={activeTab === index ? 'nav-link active' : ' nav-link'}>{tab}
                                    </button>
                                 </li>
                              ))}
                           </ul>
                           <div className="tab-content" id="myTabContent">
                              <div className={`tab-pane fade ${activeTab === 0 ? 'show active' : ''}`} id="description">
                                 <div className="chart-list">
                                    <ul className="list-wrap">
                                       {chart_List_1.map((list, index) => (<li key={index}>{list}</li>))}
                                    </ul>
                                 </div>
                              </div>
                              <div className={`tab-pane fade ${activeTab === 1 ? 'show active' : ''}`} id="description">
                                 <div className="chart-list">
                                    <ul className="list-wrap">
                                       {chart_List_2.map((list, i) => (<li key={i}>{list}</li>))}
                                    </ul>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className="col-lg-6">
                     <div className="right-side-content">
                        <Image src={chartImg} alt="" />
                        <p>Discover key details about our native token, IQO, including symbol, network, and sale values, fueling our platform&apos;s ecosystem. Join the Private Sale now!</p>
                        <ul className="list-wrap">
                           <li><span>1</span>Symbol: IQO</li>
                           <li><span>2</span>Network: BEP20</li>
                           <li><span>3</span>Total Supply: 1,000,000,000</li>
                           <li ><span>4</span><strong>Private Sale: $ 1 = 2,000 IQO</strong></li>
                           <li className="selected"><span>5</span>Presale: $ 1 = 1,000 IQO</li>
                           <li><span>6</span>ICO: $ 1 = 500 IQO</li>
                        </ul>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
      </section>
      </>
   )
}

export default ChartArea
