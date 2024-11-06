"use client"
import Image from "next/image"


import bannerShape_1 from "@/assets/img/banner/banner_shape01.png";
import bannerShape_2 from "@/assets/img/banner/banner_shape02.png";

import PresaleTabs from "@/components/Presale/PresaleTabs";

interface BannerProps {
   //mode: string; // Replace 'string' with the specific type if it's not always a string
   withdrawLoading: boolean;
   setWithdrawLoading: React.Dispatch<React.SetStateAction<boolean>>;
   referralCode:any;
 }

let mode = false
const Banner: React.FC<BannerProps> = ({withdrawLoading, setWithdrawLoading,referralCode }) => {
   
   return (
      <section  className="banner-area banner-bg" style={{ backgroundImage: `url(/assets/img/banner/banner_bg.png)` }}>
         <div className="container">
            <div className="row justify-content-center">
               <div className="col-lg-10">
                  <div className="banner-content ">
                  
                      <PresaleTabs mode={mode} withdrawLoading={withdrawLoading} setWithdrawLoading={setWithdrawLoading} referralCode={referralCode}/>
                     
                  </div>
                 
               </div>
            </div>
         </div>
         <div className="banner-scroll-down">
               <a href="#contribution" className="section-link">
                  <span></span>
                  <span></span>
                  <span></span>
               </a>
         </div>
         <div className="banner-shape-wrap">
            <Image src={bannerShape_1} alt="" className="leftToRight" />
            <Image src={bannerShape_2} alt="" className="alltuchtopdown" />
         </div>
      </section>
   )
}

export default Banner
