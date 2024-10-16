"use client"; 

import { useState } from "react";
import Banner from "./Banner";
import Brand from "./Brand";
import ChartArea from "./ChartArea";
import Contribution from "./Contribution";
import DownloadArea from "./DownloadArea";
import FAQ from "./Faq";
import FeatureOne from "./FeatureOne";
import FeatureTwo from "./FeatureTwo";
import RoadMapArea from "./RoadMapArea";
import Team from "./Team";

const Home = () => {
   const [withdrawLoading, setWithdrawLoading] = useState(false);

   console.log("loading",withdrawLoading)
   
   return (
      <>
         <Banner withdrawLoading={withdrawLoading} setWithdrawLoading={setWithdrawLoading}/>
         <Contribution  withdrawLoading={withdrawLoading}/>
         <Brand />
         <FeatureOne  />
         <FeatureTwo />
         <ChartArea withdrawLoading={withdrawLoading} setWithdrawLoading={setWithdrawLoading}/>
         <RoadMapArea />
         <Team />
         <FAQ />
         <DownloadArea />
      </>
   )
}

export default Home;
