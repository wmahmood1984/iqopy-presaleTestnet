"use client";
import { Box, Container, Grid, Typography } from "@mui/material";
import React, { useEffect, useState, useCallback } from "react";
import { ActiveChain, airdropContract } from "../../constants/environment";
import { useAccount, useConfig, useSwitchChain } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import {
  writeContract,
  waitForTransactionReceipt,
  readContract,
} from "@wagmi/core";
import { formatEther } from "viem";

import moment from "moment";
import CommonButton from "../CommonButton";
import SubscriptionForm from "../SubscriptionForm/SubscriptionForm";

const Airdrops = ({ mode }) => {
  const color = mode ? "#b99a45" : "#E0F7FA";
  const [loading, setLoading] = useState(false);
  const [airdropDetails, setAirdropDetails] = useState([]);
  const [claimableAmount, setClaimableAmount] = useState(0);
  const [notificationProps, setNotificationProps] = useState({});
  const { isConnected, chain, address } = useAccount();
  const { switchChain } = useSwitchChain();
  const { open } = useWeb3Modal();
  const [isClaimed, setIsClaimed] = useState(0); // Assuming isClaimed is initially set to 0
  const config = useConfig();

  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = () => {
    setIsSubscribed(true);
  };

  const init = useCallback(async () => {
    if (!address) {
      return;
    }
    try {
      const [_airdropDetails, _claimableAmount] = await Promise.all([
        readContract(config, {
          ...airdropContract,
          functionName: "airdrops",
          args: [address],
        }),
        readContract(config, {
          ...airdropContract,
          functionName: "calcAirDrop",
          args: [address],
        }),
      ]);
      setAirdropDetails(_airdropDetails);
      setClaimableAmount(_claimableAmount);
    } catch (error) {
      console.log(error);
    }
  }, [address, config]);

  useEffect(() => {
    init();
  }, [address, init]);

  const [freezedAmount, claimedAmount, startTime] = airdropDetails;

  const claimHandler = async () => {
    try {
      setLoading(true);
      let claimHash = await writeContract(config, {
        ...airdropContract,
        functionName: "releaseAirdrop",
      });
      await waitForTransactionReceipt({ hash: claimHash });
      console.log("claimHash", claimHash);
      setNotificationProps({
        ...notificationProps,
        modal: true,
        error: false,
        message: "Airdrop request successfully sent.",
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setNotificationProps({
        ...notificationProps,
        modal: true,
        error: true,
        message: error.message,
      });
      console.log("Error:", error);
    }
  };
  console.log("Number(claimedAmount)", claimedAmount);

  const hoverStyle = {
    "&:hover": {
      background:
        "linear-gradient(286deg, #C7AE6A 0%, #1a4578 47.60%, #112d4e 98.23%)",
    },
  };

  return (
    <Container maxWidth="md">
      {!isSubscribed ? (
        <SubscriptionForm onSubscribe={handleSubscribe} />
      ) : (
        <Box
          sx={{
            backgroundColor: mode ? "#ffffff" : "#112D4E50",
            px: "20px",
            borderRadius: "10px",
            border: "0.4px solid #28558c",
            boxShadow: "0px 2px 9px 0px rgba(151, 151, 151, 0.19)",
            textAlign: "center",
            py: "40px",
            mt: "70px",
            mb: "50px",
          }}
        >
          <Container maxWidth="lg">
            <Typography
              textAlign="center"
              variant="h5"
              sx={{
                color: mode ? "#000000" : "#fff",
                fontSize: { md: "30px", xs: "15px" },
              }}
            >
              Welcome to our token airdrop!
            </Typography>

            <Grid
              container
              justifyContent="center"
              alignItems="center"
              spacing={2}
              mt={2}
            >
              <Grid item xs={12} md={12}>
                <Box>
                  <Box
                    sx={{
                      mb: 3,
                      backgroundColor: mode ? "#ffffff" : "#112e50", // Adjust the last value (0.7) to change transparency
                      padding: "10px",
                      borderRadius: "10px",
                      border: mode
                        ? "0.4px solid #081524"
                        : "0.4px solid rgba(140, 140, 140, 0.40)",
                      boxShadow: "0px 2px 9px 0px rgba(151, 151, 151, 0.19)",
                    }}
                  >
                    <Typography
                      sx={{ color: mode ? "#000000" : "#ffffff" }}
                      variant="h6"
                    >
                      Freezed Amount
                    </Typography>
                    <Typography
                      sx={{
                        fontStyle: "normal",
                        fontWeight: 700,
                        fontSize: { xs: "20", md: "25px" },
                        color: "#b5a36c",
                      }}
                    >
                      {freezedAmount === claimedAmount
                        ? 0
                        : formatEther(Number(freezedAmount))}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      mb: 3,
                      backgroundColor: mode ? "#ffffff" : "#112e50", // Adjust the last value (0.7) to change transparency
                      padding: "10px",
                      borderRadius: "10px",
                      border: mode
                        ? "0.4px solid #081524"
                        : "0.4px solid rgba(140, 140, 140, 0.40)",
                      boxShadow: "0px 2px 9px 0px rgba(151, 151, 151, 0.19)",
                    }}
                  >
                    <Typography
                      sx={{ color: mode ? "#000000" : "#ffffff" }}
                      variant="h6"
                    >
                      Claimed Amount
                    </Typography>
                    <Typography
                      sx={{
                        fontStyle: "normal",
                        fontWeight: 700,
                        fontSize: { xs: "20", md: "25px" },
                        color: "#b5a36c",
                      }}
                    >
                      {claimedAmount ? formatEther(Number(claimedAmount)) : 0}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      mb: 3,
                      backgroundColor: mode ? "#ffffff" : "#112e50", // Adjust the last value (0.7) to change transparency
                      padding: "10px",
                      borderRadius: "10px",
                      border: mode
                        ? "0.4px solid #081524"
                        : "0.4px solid rgba(140, 140, 140, 0.40)",
                      boxShadow: "0px 2px 9px 0px rgba(151, 151, 151, 0.19)",
                    }}
                  >
                    <Typography
                      sx={{ color: mode ? "#000000" : "#ffffff" }}
                      variant="h6"
                    >
                      Start Time
                    </Typography>
                    <Typography
                      sx={{
                        fontStyle: "normal",
                        fontWeight: 700,
                        fontSize: { xs: "20", md: "25px" },
                        color: "#b5a36c",
                      }}
                    >
                      {Number(startTime) > 0
                        ? moment.unix(Number(startTime)).format("lll")
                        : "Start Time"}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={12}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "20px",
                    backgroundColor: mode ? "#ffffff" : "#112e50",
                    padding: "30px",
                    borderRadius: "10px",
                    border: "0.4px solid #28558c",
                    boxShadow: "0px 2px 9px 0px rgba(151, 151, 151, 0.19)",
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{ color: mode ? "#000000" : "#fff" }}
                  >
                    Claimable Amount = {formatEther(claimableAmount)}
                  </Typography>
                  <CommonButton
                    sx={{
                      backgroundColor: "#ffffff",
                      color: "#000000",
                      ...hoverStyle,
                      fontSize: "16px",
                      fontWeight: 600,
                    }}
                    disabled={loading}
                    onClick={() =>
                      !isConnected
                        ? open()
                        : chain?.id !== ActiveChain
                        ? switchChain({ chainId: ActiveChain })
                        : claimHandler()
                    }
                  >
                    {isConnected
                      ? chain?.id !== ActiveChain
                        ? "Wrong Network"
                        : loading
                        ? "Processing..."
                        : isClaimed === 1
                        ? "Fully Claimed"
                        : "Request Airdrop"
                      : "Connect Wallet"}
                  </CommonButton>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>
      )}
    </Container>
  );
};

export default Airdrops;
