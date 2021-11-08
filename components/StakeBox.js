import React, { useState } from "react";

import {
  Button,
  Box,
  Text,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Spinner,
} from "@chakra-ui/react";
import { formatMoney } from "../utils/format";

import { useStake, useUser, useAccount } from "../providers/web3";

import ReefSymbol from "./ReefSymbol";

function StakeBox({}) {
  const { isLoading, mutateAsync: stake } = useStake();
  const { data } = useUser();

  const [amount, setAmount] = useState("");

  const balance = data?.tokenAmount;
  function handleMax() {
    setAmount(balance);
  }
  function handleChange(e) {
    const { value } = e.target;
    console.log(value, value);
    setAmount(value || "");
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        stake(amount).then(() => setAmount(""));
      }}
    >
      <Box
        borderWidth={1}
        borderColor="gray.300"
        borderRadius="md"
        px={3}
        py={2}
      >
        <InputGroup>
          <InputLeftElement mt={1} pointerEvents="none">
            <Icon as={ReefSymbol} w={6} h={6} />
          </InputLeftElement>
          <Input
            size="lg"
            placeholder="0.00"
            border="none"
            type="number"
            value={amount ? amount : ""}
            onChange={handleChange}
          />
          <InputRightElement>
            <Button size="sm" onClick={handleMax}>
              Max
            </Button>
          </InputRightElement>
        </InputGroup>
        <Text ml={2} color="gray.500">
          Balance: {formatMoney(balance, 2)}
        </Text>
      </Box>
      <Button
        disabled={isLoading}
        colorScheme="purple"
        isFullWidth
        mt={2}
        type="submit"
      >
        {isLoading ? <Spinner /> : "Stake tokens"}
      </Button>
    </form>
  );
}

export default StakeBox;
