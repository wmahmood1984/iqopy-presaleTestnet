import { LoadingButton } from "@mui/lab";
import {
  Box,
  Container,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import moment from "moment";
import React, { useEffect, useState } from "react";
import NotificationModal from "../NotificationModal/NotificationModal";
import { useAccount, useConfig } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import {
  getCommas,
  // kafaStaking,
  iqopyStaking,
  airdropContract,
  presaleContract,
} from "../../constants/environment";
import {
  writeContract,
  readContract,
  waitForTransactionReceipt,
} from "@wagmi/core";
import { formatEther } from "viem";
import { contract } from "@/ui/SmartContractDeposits";

const hoverStyle = {
  "&:hover": {
    background:
      "linear-gradient(286deg, #C7AE6A 0%, #1a4578 47.60%, #112d4e 98.23%)",
  },
};

const columns = [
  { id: "StartTime", label: "Start Time", minWidth: 200, align: "center" },
  {
    id: "StakedAmount",
    label: "Staked Amount",
    minWidth: 200,
    align: "center",
  },
  {
    id: "AmountWithdrawn",
    label: "Tokens Withdrawn",
    minWidth: 200,
    align: "center",
    format: (value) => value.toLocaleString("en-US"),
  },
  {
    id: "WithdrawableAmount",
    label: "Withdrawable Tokens",
    minWidth: 200,
    align: "center",
  },
  {
    id: "WithdrawnReward",
    label: "Reward Withdrawn",
    minWidth: 200,
    align: "center",
  },
  {
    id: "WithdrawableReward",
    label: "Withdrawable Reward",
    minWidth: 200,
    align: "center",
  },
  {
    id: "WithdrawReward",
    label: "Withdraw Reward",
    minWidth: 200,
    align: "center",
  },
  {
    id: "Withdraw",
    label: "Unlock Tokens",
    minWidth: 200,
    align: "center",
  },
];

const Staking = ({ mode,withdrawLoading,setWithdrawLoading }) => {
  const color = mode ? "#b99a45" : "#E0F7FA";
  const [notificationProps, setnotificationProps] = useState({
    error: "",
    message: "",
    modal: false,
  });
  const [loading, setLoading] = useState(false);

  const [unstakedLoading, setUnstakedLoading] = useState(false);
  const config = useConfig();
  const { open } = useWeb3Modal();
  const { address } = useAccount();
  const [userBalance, setUserBalance] = useState(0);
  const [usersAirdrops, setUsersAirdrops] = useState(0);
  const [stakingDetails, setStakingDetails] = useState([]);
  const [withdrawableAmount, setWithdrwableAmount] = useState(0);
  const [stakingDetails2,setStakingdetails2] = useState()

  const init2 = async ()=>{

    try {
      const _stakingDetails = await contract.methods.getUserPurchase(address).call()
      setStakingdetails2(_stakingDetails)
    } catch (error) {
      console.log("error in init2",error)
    }
  }


  const stakeTokens = async () => {
    try {
      setLoading(true);
      // First transaction: Approve
      let approveHash = await writeContract(config, {
        ...iqopyStaking,
        functionName: "stakeTokens",
        args: [address],
      });
      await waitForTransactionReceipt(config, { hash: approveHash });
      setnotificationProps({
        ...notificationProps,
        modal: true,
        error: false,
        message: "Staked successfully",
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setnotificationProps({
        ...notificationProps,
        modal: true,
        error: true,
        message: error.message,
      });
      console.log("error", error);
    }
  };
  const unstakeTokens = async () => {
    try {
      setUnstakedLoading(true);

      let approveHash = await writeContract(config, {
        ...iqopyStaking,
        functionName: "stopStake",
        args: [address],
      });
      await waitForTransactionReceipt(config, { hash: approveHash });
      setnotificationProps({
        ...notificationProps,
        modal: true,
        error: false,
        message: "Unsaked successfully",
      });
      setUnstakedLoading(false);
    } catch (error) {
      setUnstakedLoading(false);
      setnotificationProps({
        ...notificationProps,
        modal: true,
        error: true,
        message: error.message,
      });
      console.log("error", error);
    }
  };

  const withdrawTokens = async (index) => {
    try {
      setWithdrawLoading(true);
      let withdrawHash = await writeContract(config, {
        ...presaleContract,
        functionName: "withdraw",
        args: [index]
      });
      await waitForTransactionReceipt(config, { hash: withdrawHash });
      setnotificationProps({
        modal: true,
        error: false,
        message: "Withdrawal successfully completed.",
      });
      setWithdrawLoading(false);
    } catch (error) {
      setWithdrawLoading(false);
      setnotificationProps({
        modal: true,
        error: true,
        message: error.message,
      });
      console.log("error", error);
    }
  };

  const withdrawReward = async (index) => {
    try {
      setWithdrawLoading(true);
      let withdrawHash = await writeContract(config, {
        ...presaleContract,
        functionName: "withdrawReward",
        args: [index]
      });
      await waitForTransactionReceipt(config, { hash: withdrawHash });
      setnotificationProps({
        modal: true,
        error: false,
        message: "Withdrawal successfully completed.",
      });
      setWithdrawLoading(false);
    } catch (error) {
      setWithdrawLoading(false);
      setnotificationProps({
        modal: true,
        error: true,
        message: error.message,
      });
      console.log("error", error);
    }
  };

  const init = async () => {
    if (!address) {
      return;
    }
    try {
      const [
        _getUserBalance,
        _getUserAirdrop,
        _stakingDetails,
        _withdrawableAmount,
      ] = await Promise.all([
        readContract(config, {
          ...iqopyStaking,
          functionName: "getUserBala",
          args: [address],
        }),
        readContract(config, {
          ...iqopyStaking,
          functionName: "getUserAirdrop",
          args: [address],
        }),
        readContract(config, {
          ...iqopyStaking,
          functionName: "stake",
          args: [address],
        }),
        readContract(config, {
          ...iqopyStaking,
          functionName: "calcStake",
          args: [address],
        }),
      ]);
      setUsersAirdrops(_getUserAirdrop);
      setUserBalance(_getUserBalance);
      setStakingDetails(_stakingDetails);
      setWithdrwableAmount(_withdrawableAmount);
    } catch (error) {
      console.log(error);
    }
  };


  console.log("staking Details",stakingDetails2)

  const [started,setStarted] = useState(false)


  useEffect(() => {
    var interval = setInterval(() => {
      init();
      init2()      
    }, 60000);

    if(!started){
      init2()
      setStarted(true)
    }


    return ()=>{clearInterval(interval)}
    

  }, [address,withdrawLoading]);

  const [startTime, withdrawnAmount] = stakingDetails;

  return (
    <Container maxWidth="lg" sx={{ py: "50px" }}>
      <NotificationModal
        notificationProps={notificationProps}
        setnotificationProps={setnotificationProps}
      />
      {/* <Container maxWidth="md">
        <Typography variant="h2" textAlign="center">
          Staking
        </Typography>
        <Divider color={color} sx={{ mt: "10px" }} />
        <Grid container sx={{ mt: "10px" }} spacing={4}>
          <Grid item xs={12} md={6}>
          
            <Box
              sx={{
                mb: 3,
                backgroundColor: mode ? "#ffffff" : "#112e50", // Adjust the last value (0.7) to change transparency
                padding: "10px",
                borderRadius: "10px",
                border: mode ? "0.4px solid #081524" : "0.4px solid #28558c",
                boxShadow: "0px 2px 9px 0px rgba(151, 151, 151, 0.19)",
              }}
            >
              <Typography
                sx={{ color: mode ? "#000000" : "#ffffff" }}
                variant="h6"
              >
                Airdrop balance
              </Typography>
              <Typography
                sx={{
                  fontStyle: "normal",
                  fontWeight: 700,
                  fontSize: { xs: "20", md: "25px" },
                  color: "#b5a36c",
                }}
              >
                {formatEther(usersAirdrops)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
          
            <Box
              sx={{
                mb: 3,
                backgroundColor: mode ? "#ffffff" : "#112e50", // Adjust the last value (0.7) to change transparency
                padding: "10px",
                borderRadius: "10px",
                border: mode ? "0.4px solid #28558c" : "0.4px solid #28558c",
                boxShadow: "0px 2px 9px 0px rgba(151, 151, 151, 0.19)",
              }}
            >
              <Typography
                sx={{ color: mode ? "#000000" : "#ffffff" }}
                variant="h6"
              >
                User balance
              </Typography>
              <Typography
                sx={{
                  fontStyle: "normal",
                  fontWeight: 700,
                  fontSize: { xs: "20", md: "25px" },
                  color: "#b5a36c",
                }}
              >
                {formatEther(userBalance)}
              </Typography>
            </Box>
            <Stack direction="row" justifyContent="space-between">
              <LoadingButton
                sx={{
                  backgroundColor: "#ffffff",
                  color: "#000000",
                  ...hoverStyle,
                  fontSize: "15px",
                  fontWeight: 600,
                  transition: "background 0.3s",
                  px: "30px",
                  py: "10px",
                  mt: "20px",
                  maxWidth: "200px",
                }}
                variant="contained"
                loading={loading}
                disabled={loading}
                loadingPosition="end"
                color="primary"
                onClick={stakeTokens}
              >
                {loading ? "Processing" : "Stake"}
              </LoadingButton>
              <LoadingButton
                variant="contained"
                loading={unstakedLoading}
                disabled={unstakedLoading}
                loadingPosition="end"
                sx={{
                  backgroundColor: "#ffffff",
                  color: "#000000",
                  ...hoverStyle,
                  fontSize: "15px",
                  fontWeight: 600,
                  transition: "background 0.3s",
                  px: "30px",
                  py: "10px",
                  mt: "20px",
                  maxWidth: "200px",
                }}
                color="primary"
                onClick={unstakeTokens}
              >
                {unstakedLoading ? "Processing" : "Unstake"}
              </LoadingButton>
            </Stack>
          </Grid>
        </Grid>
      </Container> */}
      <Paper
        sx={{
          width: "100%",
          overflow: "hidden",
          backgroundColor: "transparent",
          mx: "auto",
          border: mode ? "1px solid #b99a45" : "1px solid #28558c",
          my: "40px",
        }}
        align="center"
      >
        <Box my={4}>
          <Typography fontWeight="600" mb={1} variant="h2" textAlign="center">
            Token Lock Details
          </Typography>
        </Box>
        <TableContainer
          sx={{
            maxWidth: "100%",
            overflowX: "auto",
            display: "block",
            "@media screen and (max-width: 600px)": {
              width: "100vw",
            },
          }}
        >
          <Table
            stickyHeader
            aria-label="sticky table"
            style={{ minWidth: "100%" }}
          >
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    sx={{
                      background: "#ffffff",
                      fontSize: "15px",
                      fontWeight: 600,
                      "&:hover": {
                        color: "#b5a36c",
                      },

                      // background:
                      // "linear-gradient(293.69deg, #b5a36c -1.22%, #1a4578 100%)",
                    }}
                    key={column.id}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>

              {stakingDetails2 ? stakingDetails2.map((v,e)=>
              <TableRow>
                  <TableCell sx={{ color: mode ? "#b99a45" : "#ffffff" }}>
                    {moment.unix(Number(v.tokenLockTime)).format("lll")}
                  </TableCell>
                  <TableCell sx={{ color: mode ? "#b99a45" : "#ffffff" }}>
                    {formatEther(v.buyToken)}
                  </TableCell>
                  <TableCell sx={{ color: mode ? "#b99a45" : "#ffffff" }}>
                    &nbsp;{getCommas(formatEther(v.TokensUnlocked))}
                  </TableCell>
                  <TableCell sx={{ color: mode ? "#b99a45" : "#ffffff" }}>
                    &nbsp;
                    {getCommas(formatEther(v.unLockableTokens))}
                  </TableCell>
                  <TableCell sx={{ color: mode ? "#b99a45" : "#ffffff" }}>
                    &nbsp;
                    {getCommas(formatEther(v.rewardWithdrawn))}
                  </TableCell>
                  <TableCell sx={{ color: mode ? "#b99a45" : "#ffffff" }}>
                    &nbsp;
                    {getCommas(formatEther(v.rewardEarned))}
                  </TableCell>
                  <TableCell sx={{ color: mode ? "#b99a45" : "#ffffff" }}>
                    <LoadingButton
                      variant="contained"
                      loading={withdrawLoading}
                      disabled={withdrawLoading}
                      loadingPosition="end"
                      sx={{
                        backgroundColor: "#ffffff",
                        color: "#000000",
                        ...hoverStyle,
                        fontSize: "15px",
                        fontWeight: 600,
                        transition: "background 0.3s",
                        px: "30px",
                        py: "10px",
                        mt: "20px",
                        maxWidth: "150px",
                        borderRadius: "22px",
                        fontSize: "10px",
                      }}
                      color="primary"
                      onClick={address ? () => withdrawReward(e) : open}
                    >
                      {address
                        ? withdrawLoading
                          ? "Processing"
                          : "Withdraw Reward"
                        : "Connect Wallet"}
                    </LoadingButton>
                  
                  </TableCell>
                  <TableCell>
                  <LoadingButton
                      variant="contained"
                      loading={withdrawLoading}
                      disabled={withdrawLoading}
                      loadingPosition="end"
                      sx={{
                        backgroundColor: "#ffffff",
                        color: "#000000",
                        ...hoverStyle,
                        fontSize: "15px",
                        fontWeight: 600,
                        transition: "background 0.3s",
                        px: "30px",
                        py: "10px",
                        mt: "20px",
                        maxWidth: "150px",
                        borderRadius: "22px",
                        fontSize: "10px",
                      }}
                      color="primary"
                      onClick={address ? () => withdrawTokens(e) : open}
                    >
                      {address
                        ? withdrawLoading
                          ? "Processing"
                          : "Withdraw Tokens"
                        : "Connect Wallet"}
                    </LoadingButton>

                    </TableCell>
                </TableRow>
              ): (
                <TableRow>
                  <TableCell
                    sx={{ color: mode ? "#b99a45" : "#ffffff" }}
                    colSpan={6}
                    style={{ textAlign: "center" }}
                  >
                    No deposit data found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default Staking;
