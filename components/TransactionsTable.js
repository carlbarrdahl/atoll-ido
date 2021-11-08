import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Heading,
  Input,
  FormControl,
  Link,
  SkeletonText,
} from "@chakra-ui/react";
import { CheckIcon, WarningIcon } from "@chakra-ui/icons";
import { useSubscription, gql } from "@apollo/client";
import { useEffect, useState } from "react";

import { timeAgo, truncate } from "../utils/format";
import config from "../config";
import { useWalletAddress } from "../hooks/api";

const SUBSCRIPTION_QUERY = gql`
  subscription transfer($accountId: String!) {
    transfer(
      order_by: { block_number: desc }
      where: {
        _or: [
          { source: { _eq: $accountId } }
          { destination: { _eq: $accountId } }
        ]
      }
    ) {
      block_number
      extrinsic_index
      section
      method
      hash
      source
      destination
      amount
      denom
      fee_amount
      success
      error_message
      timestamp
    }
  }
`;

function TableWithData({ accountId, onChangeAddress }) {
  const { data, loading, error } = useSubscription(SUBSCRIPTION_QUERY, {
    variables: { accountId },
  });

  return (
    <Table size="sm">
      <Thead>
        <Tr>
          <Th>Hash</Th>
          <Th>Age</Th>
          <Th>From</Th>
          <Th>To</Th>
          <Th>Amount</Th>
          <Th>Success</Th>
        </Tr>
      </Thead>
      <Tbody>
        {loading || error ? (
          <Tr>
            <Td colSpan={7}>
              {loading ? <SkeletonText noOfLines={1} /> : <pre>{error}</pre>}
            </Td>
          </Tr>
        ) : (
          (data?.transfer || []).map((tx) => (
            <Tr key={tx.hash}>
              <Td>
                <Link
                  color="blue.500"
                  href={`${config.network.explorerURL}/transfer/${tx.hash}`}
                  target="_blank"
                >
                  {truncate(tx.hash, 20)}
                </Link>
              </Td>
              <Td>{timeAgo(tx.timestamp * 1000)}</Td>
              <Td onClick={() => onChangeAddress(tx.source)}>
                <Link color="blue.500">{truncate(tx.source)}</Link>
              </Td>
              <Td onClick={() => onChangeAddress(tx.destination)}>
                <Link color="blue.500">{truncate(tx.destination)}</Link>
              </Td>
              <Td>{tx.amount / 10 ** config.network.tokenDecimals}</Td>
              <Td textAlign="center">
                {tx.success ? (
                  <CheckIcon color={"green.500"} />
                ) : (
                  <WarningIcon color={"red.500"} />
                )}
              </Td>
            </Tr>
          ))
        )}
      </Tbody>
    </Table>
  );
}

export default function TransactionTable() {
  const { wallet } = useWalletAddress();
  const [address, setAddress] = useState(wallet);

  function handleChangeAddress(newAddress) {
    setAddress(newAddress);
  }

  useEffect(() => {
    setAddress(wallet);
  }, [wallet]);
  return (
    <Box pt={12}>
      <Heading size={"md"} mb={6} color={"gray.600"}>
        Transactions
      </Heading>
      <FormControl id="address" mb={4}>
        <Input
          value={address}
          placeholder="Filter by wallet address..."
          onChange={(e) => handleChangeAddress(e.target.value)}
        />
      </FormControl>
      {address ? (
        <TableWithData
          accountId={address}
          onChangeAddress={handleChangeAddress}
        />
      ) : null}
    </Box>
  );
}
