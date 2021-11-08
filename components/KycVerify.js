import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@chakra-ui/button";
import { useMutation, useQuery, useQueryClient } from "react-query";

import config from "../config";
import { request } from "../lib/request";
import { useAccount, useWeb3 } from "../providers/web3";
import { Flex, Badge, Box, Spinner } from "@chakra-ui/react";

export function useKyc() {
  const { data } = useAccount();
  return useQuery(
    ["kyc-verify"],
    () => request(`/api/verify?address=${data.address}`),
    { enabled: !!data?.address }
  );
}

export function useKycVerify() {
  const { data } = useAccount();
  const queryClient = useQueryClient();
  const [isSubmitted, setSubmitted] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const address = data?.address;
  const { mutateAsync } = useMutation(
    () =>
      request(`/api/verify`, {
        method: "POST",
        body: JSON.stringify({ address }),
        headers: { "Content-Type": "application/json" },
      }),
    {
      enabled: !!address,
    }
  );

  async function verify() {
    setLoading(true);
    try {
      const stripe = await loadStripe(config.stripe.pk);
      const session = await mutateAsync();
      const { error } = await stripe.verifyIdentity(session.client_secret);
      if (error) {
        console.log(error);
      } else {
        await queryClient.invalidateQueries(["kyc-verify"]);
        setSubmitted(true);
      }
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  }

  return { address, isLoading, isSubmitted, verify };
}

export function KycStatus() {
  const { data, isLoading } = useKyc();

  if (data?.kyc) {
    return (
      <Flex mr={2} alignItems="center">
        <Badge
          px={2}
          colorScheme="green"
          height="100%"
          sx={{ display: "flex", alignItems: "center" }}
        >
          KYC Verified
        </Badge>
      </Flex>
    );
  }
  return null;
}

export function KycVerifyButton() {
  const kyc = useKyc();
  const { address, isLoading, isSubmitted, verify } = useKycVerify();

  return kyc?.data?.kyc ? null : (
    <Button isFullWidth disabled={isLoading} onClick={verify}>
      {isLoading || !address ? <Spinner /> : "Start KYC process"}
    </Button>
  );
}

export default KycVerifyButton;
