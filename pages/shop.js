import {
  Alert,
  AlertTitle,
  AlertIcon,
  AlertDescription,
  Box,
  Image,
  Flex,
  Text,
  Link,
  Button,
  Input,
  InputGroup,
  InputRightAddon,
  FormControl,
  FormLabel,
  Spinner,
} from "@chakra-ui/react";
import { request } from "../lib/request";
import { useMutation, useQuery } from "react-query";

import { useForm } from "react-hook-form";
import config from "../config";
import { useWallet } from "../hooks/wallet";
import { useEffect } from "react";

function useWatchPayment(address) {
  return useQuery(
    ["payment", address],
    () => {
      return request(`/api/merchant/store?address=${address}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    { refetchInterval: 2000 }
  );
}

function usePayment() {
  return useMutation(({ apiKey, amount, webhookURL }) => {
    return request(`/api/pay`, {
      method: "POST",
      body: JSON.stringify({
        amount: (
          Number(amount) *
          10 ** config.network.tokenDecimals
        ).toString(),
        webhookURL,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey,
      },
    });
  });
}

const store = {
  get: () => {
    try {
      return JSON.parse(localStorage.getItem("merchant-shop"));
    } catch (error) {}
    return {};
  },
  set: (val) => {
    localStorage.setItem("merchant-shop", JSON.stringify(val));
  },
};

function WaitingForPayment({ amount, address }) {
  const { data, error, isLoading } = useWatchPayment(address);
  console.log("WaitingForPayment", data, error, isLoading);
  return (
    <Alert
      colorScheme="white"
      variant="subtle"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      height="200px"
    >
      {data?.status ? (
        <>
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            Payment received!
          </AlertTitle>
          <AlertDescription maxWidth="sm" mb={4}>
            Thanks for shopping with REEF
          </AlertDescription>
          <Link
            color="blue.500"
            href={`https://testnet.reefscan.com/block/${data?.status.finalized}`}
            target="_blank"
          >
            View block in explorer
          </Link>
        </>
      ) : (
        <>
          <Spinner />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            Waiting for payment to
          </AlertTitle>
          <Input value={address} readOnly size="sm" mb={4} />
          <AlertDescription>
            <Text fontWeight="bold" as="span">
              {amount / 10 ** config.network.tokenDecimals}{" "}
              {config.network.tokenSymbol}
            </Text>
          </AlertDescription>
        </>
      )}
    </Alert>
  );
}

export default function MerchantDemo() {
  const { register, handleSubmit, ...rest } = useForm({
    defaultValues: store.get(),
  });
  const wallet = useWallet();

  console.log("wallet", wallet);

  const { data, error, isLoading, mutateAsync: createPayment } = usePayment();

  useEffect(() => {
    if (data?.address) {
      wallet.transfer(data.address, data.amount);
    }
  }, [data?.address]);

  function sendAndSave(values) {
    // Store in localStorage so we don't have to enter them every time
    try {
      store.set(values);
    } catch (error) {}
    createPayment(values);
  }

  console.log("MerchantDemo", data, error, isLoading, rest);

  return (
    <Flex
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      bg="gray.200"
      py={8}
      flexDirection="column"
    >
      <Box maxW={380} as="form" onSubmit={handleSubmit(sendAndSave)}>
        <Box bg="white" boxShadow="lg">
          <Image src="https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1372&q=80" />
          {data?.address ? (
            <WaitingForPayment {...data} />
          ) : (
            <Box p={8} mb={8}>
              <FormControl>
                <FormLabel fontSize="sm" mb={1}>
                  Amount
                </FormLabel>
                <InputGroup size="sm">
                  <Input
                    required
                    step={"any"}
                    type="number"
                    {...register("amount")}
                    placeholder="Enter amount to pay..."
                    disabled={isLoading}
                    mb={4}
                  />
                  <InputRightAddon>REEF</InputRightAddon>
                </InputGroup>
              </FormControl>
              <Button type="submit" isFullWidth disabled={isLoading}>
                {isLoading ? <Spinner /> : "Pay"}
              </Button>
            </Box>
          )}
        </Box>
        {isLoading || data?.address ? null : (
          <Box bg="white" boxShadow="lg" p={8}>
            <FormControl>
              <FormLabel mb={1}>API Key</FormLabel>
              <Input
                autoFocus
                required
                {...register("apiKey")}
                size="sm"
                mb={4}
              />
            </FormControl>
            <FormControl>
              <FormLabel mb={1}>Webhook to trigger after payment</FormLabel>
              <Input
                required
                size="sm"
                {...register("webhookURL")}
                placeholder="https://"
                mb={4}
              />
            </FormControl>
          </Box>
        )}
      </Box>
    </Flex>
  );
}
