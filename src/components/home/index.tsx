"use client";

import { useState, Suspense } from "react";
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
import { useSearchParams } from 'next/navigation';

const Home = () => {
   const [withdrawLoading, setWithdrawLoading] = useState(false);
   
   return (
      <Suspense fallback={<div>Loading...</div>}>
         <InnerHome withdrawLoading={withdrawLoading} setWithdrawLoading={setWithdrawLoading} />
      </Suspense>
   );
}

interface BannerProps {
   //mode: string; // Replace 'string' with the specific type if it's not always a string
   withdrawLoading: any;
   setWithdrawLoading: any;
   
 }

const InnerHome: React.FC<BannerProps> = ({ withdrawLoading, setWithdrawLoading }) => {
   const searchParams = useSearchParams();
   const referralCode = searchParams.get('referralCode');

   return (
      <>
         <Banner withdrawLoading={withdrawLoading} setWithdrawLoading={setWithdrawLoading} referralCode={referralCode} />
         <Contribution withdrawLoading={withdrawLoading} />
         <Brand />
         <FeatureOne />
         <FeatureTwo />
         <ChartArea withdrawLoading={withdrawLoading} setWithdrawLoading={setWithdrawLoading} />
         <RoadMapArea />
         <Team />
         <FAQ />
         <DownloadArea />
      </>
   );
};

export default Home;
