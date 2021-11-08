import { createContext, useContext, useEffect, useState } from "react";

import { WsProvider } from "@polkadot/rpc-provider";
import { keyring } from "@polkadot/ui-keyring";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import { Provider, Signer } from "@reef-defi/evm-provider";
import { ethers, Contract } from "ethers";

import IDO from "../artifacts/contracts/IDO.sol/IDO.json";
import Token from "../artifacts/contracts/Token.sol/Token.json";

import config from "../config";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useRouter } from "next/router";
const SS58_FORMAT = 42;

const Context = createContext({});

function useWeb3State() {
  const [state, setState] = useState({ isLoading: true });

  useEffect(() => {
    const {
      web3Enable,
      web3Accounts,
      web3FromAddress,
    } = require("@polkadot/extension-dapp");

    cryptoWaitReady()
      .then(async () => {
        keyring.loadAll({ ss58Format: SS58_FORMAT, type: "sr25519" });
        const provider = new Provider({
          provider: new WsProvider(config.network.networkURL),
        });

        provider.api.on("connected", () => console.log("api connected"));
        provider.api.on("disconnected", () => console.log("api disconnected"));
        provider.api.on("ready", async () => {
          console.log("api ready");
          try {
            const [ext] = await web3Enable("@reef-defi/payment-api");
            const [account] = await web3Accounts();

            const wallet = new Signer(provider, account.address, ext.signer);

            const injector = await web3FromAddress(wallet._substrateAddress);

            const { data } = await provider.api.query.system.account(
              account.address
            );

            setState((state) => ({
              ...state,
              isLoading: false,
              wallet,
              account,
              api: provider.api,
            }));
          } catch (error) {
            console.error("Unable to load chain", error);
            setState({ isLoading: false, error });
          }
        });

        await provider.api.isReadyOrError;
      })
      .catch((error) => setState({ isLoading: false, error }));
  }, []);

  return state;
}

export const useWeb3 = () => useContext(Context);

export function useAccount() {
  const { api, account } = useWeb3();
  return useQuery(
    ["user.account"],
    async () => {
      const { data } = await api.query.system.account(account.address);
      return {
        address: account.address,
        balance: data?.free,
      };
    },
    { enabled: !!api }
  );
}
export function useUser() {
  const { wallet } = useWeb3();
  const { ido, stakingToken } = useContracts();

  return useQuery(
    ["user.info"],
    async () => {
      const userAddress = await wallet.getAddress();
      const user = await ido.users(userAddress);

      console.log(
        "USER ST TOKENS",
        (await stakingToken.balanceOf(userAddress)).toString()
      );
      return {
        stakeAmount: user.stakeAmount / 1e18,
        stakeTime: new Date(user.stakeTime * 1000),
        claimedRewards: user.claimedRewards / 1e18,
        tokenAmount: (await stakingToken.balanceOf(userAddress)) / 1e18,
      };
    },
    { enabled: !!ido && !!wallet }
  );
}

export function useStake() {
  const { wallet } = useWeb3();
  const queryClient = useQueryClient();
  const { ido, stakingToken } = useContracts();
  return useMutation(
    async (_amount) => {
      const amount = ethers.utils.parseEther(_amount);
      await stakingToken.approve(ido.address, amount);
      return ido.stake(amount);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["user.info"]);
        queryClient.invalidateQueries(["user.account"]);
        queryClient.invalidateQueries(["ido.totalStaked"]);
      },
    }
  );
}

export function useWithdraw() {
  const queryClient = useQueryClient();
  const { ido } = useContracts();
  return useMutation(
    async (_amount) => {
      try {
        const amount = ethers.utils.parseEther(String(_amount));
        console.log("Withdrawing:", amount, _amount);
        return ido.withdraw(amount);
      } catch (error) {
        console.log(error);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["user.info"]);
        queryClient.invalidateQueries(["user.account"]);
        queryClient.invalidateQueries(["ido.totalStaked"]);
      },
    }
  );
}

export function useClaim() {
  const queryClient = useQueryClient();
  const { ido } = useContracts();
  return useMutation(
    async () => {
      try {
        return ido.claim();
      } catch (error) {
        console.log(error);
      }
    },
    {
      onSuccess: () => queryClient.invalidateQueries(["user.info"]),
    }
  );
}

export function useTotalStaked() {
  const { ido, stakingToken } = useContracts();
  return useQuery(
    ["ido.totalStaked"],
    async () => {
      try {
        console.log("TOTAL STAKED", await ido.totalStaked());
        console.log("TOTAL STAKED", await stakingToken.balanceOf(ido.address));
        return (await ido.totalStaked()) / 1e18;
      } catch (error) {
        console.log(error);
        return 0;
      }
    },
    { enabled: !!ido && !!stakingToken }
  );
}

export function useContracts() {
  const { wallet } = useWeb3();
  const [contracts, setContracts] = useState({});

  const router = useRouter();
  const projects = require("../data");
  const project = projects.find((p) => p.slug === router.query.id);

  useEffect(() => {
    const { pool_contract_address, pool_token_address } = project;
    if (pool_contract_address && wallet) {
      async function init() {
        console.log("wallet address", await wallet.getAddress());
        const ido = new Contract(pool_contract_address, IDO.abi, wallet);
        const stakingAddress = await ido.stakingToken();
        const rewardAddress = await ido.rewardToken();
        const stakingToken = new Contract(stakingAddress, Token.abi, wallet);
        const rewardToken = new Contract(rewardAddress, Token.abi, wallet);

        console.log(
          "IDO StakingdToken balance:",
          await stakingToken.balanceOf(await wallet.getAddress())
        );
        console.log(
          "IDO RewardToken balance:",
          await rewardToken.balanceOf(await wallet.getAddress())
        );
        setContracts({ ido, stakingToken, rewardToken });
      }

      init().catch(console.log);
    }
  }, [project, wallet]);

  return contracts;
}

export default function Web3Provider({ children }) {
  const state = useWeb3State();

  return <Context.Provider value={state}>{children}</Context.Provider>;
}
