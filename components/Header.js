import { Button, Flex, Heading, Box, Text, Spinner } from "@chakra-ui/react";
import NextLink from "next/link";

import { useAccount, useWeb3 } from "../providers/web3";
import { truncate } from "../utils/format";
import { KycStatus } from "./KycVerify";

export default function Header({ children }) {
  const { data, isLoading } = useWeb3();
  const account = useAccount();

  console.log("useAccount", data, isLoading);
  return (
    <Flex
      alignItems="center"
      justifyContent="space-between"
      p={4}
      bg="white"
      boxShadow="lg"
    >
      <Box>
        <NextLink href={`/`}>
          <Heading
            cursor="pointer"
            letterSpacing={1}
            fontFamily="monospace"
            size="md"
          >
            <Text fontSize="3xl" as="span" mr={2}>
              ◯
            </Text>
            atoll_ido
          </Heading>
        </NextLink>
      </Box>
      <Flex>
        <KycStatus />
        {isLoading ? (
          <Spinner />
        ) : account.data?.address ? (
          <Flex borderWidth={1} borderColor={"gray.300"} fontWeight="bold">
            <Text p={2} bg="gray.100">
              {account.data?.balance?.toHuman()}
            </Text>
            <Text p={2}>{truncate(account.data?.address, 12)}</Text>
          </Flex>
        ) : (
          <Button>Connect wallet</Button>
        )}
      </Flex>
    </Flex>
  );
}
