import React from "react";

import {
  Button,
  Box,
  Text,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  HStack,
  Spinner,
} from "@chakra-ui/react";
import { formatMoney } from "../utils/format";

import { useWithdraw, useClaim, useUser } from "../providers/web3";

import ReefSymbol from "./ReefSymbol";

const WithdrawBox = ({}) => {
  const { isLoading: isWithdrawing, mutateAsync: withdraw } = useWithdraw();
  const { isLoading: isClaiming, mutateAsync: claim } = useClaim();
  const user = useUser();

  if (!user?.data?.stakeAmount) {
    return null;
  }
  const { stakeAmount, stakeTime } = user.data;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        withdraw(String(stakeAmount));
      }}
    >
      <Box
        borderWidth={1}
        borderColor="gray.300"
        borderRadius="md"
        px={3}
        py={2}
        mb={2}
      >
        <Text ml={2} color="gray.500">
          You have staked:
        </Text>
        <InputGroup>
          <InputLeftElement mt={1} pointerEvents="none">
            <Icon as={ReefSymbol} w={6} h={6} />
          </InputLeftElement>
          <Input
            size="lg"
            placeholder="0.00"
            border="none"
            // type="number"
            readOnly
            value={stakeAmount ? formatMoney(stakeAmount, 2) : ""}
          />
        </InputGroup>
        <Text ml={2} color="gray.500">
          At: {stakeTime.toLocaleDateString()}
        </Text>
      </Box>
      <HStack>
        <Button
          flex={1}
          disabled={isWithdrawing || user.isLoading}
          type="submit"
        >
          {isWithdrawing ? <Spinner /> : "Withdraw"}
        </Button>
        <Button
          colorScheme="purple"
          // bg="green.200"
          // color="green.800"
          flex={1}
          disabled={isClaiming}
          onClick={claim}
        >
          {isClaiming ? <Spinner /> : "Claim Reward"}
        </Button>
      </HStack>
    </form>
  );
};

export default WithdrawBox;
