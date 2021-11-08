import React, { useState, useEffect } from "react";

import {
  Button,
  Divider,
  Box,
  Heading,
  Text,
  Flex,
  SimpleGrid,
  Grid,
  GridItem,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Image,
  HStack,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  Spinner,
  SkeletonText,
} from "@chakra-ui/react";
import { TriangleDownIcon } from "@chakra-ui/icons";
import NextLink from "next/link";
import Layout from "../../components/Layout";
import Markdown from "../../components/Markdown";
import { useRouter } from "next/router";
import { formatMoney } from "../../utils/format";

import {
  useIDO,
  useWeb3,
  useWithdraw,
  useStake,
  useClaim,
  useUser,
  useAccount,
  useTotalStaked,
} from "../../providers/web3";
import { utils } from "ethers";
import KycVerifyButton, { useKyc } from "../../components/KycVerify";
import { useMutation } from "react-query";
const projects = require("../../data");

const ReefCoin = () => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 28 28"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="dotgrad">
        <stop stop-color="#681CFF" offset="0%"></stop>
        <stop stop-color="#FD3F83" offset="100%"></stop>
      </linearGradient>
    </defs>
    <g fill="url(#dotgrad)">
      <path d="M15.48808,-2.27373675e-13 C13.32539,-2.27373675e-13 11.30154,0.448217 9.41865,1.346735 C7.53576,2.176457 5.89481,3.318889 4.4979,4.769861 C3.10309,6.222917 1.98808,7.915717 1.15077,9.850346 C0.38289,11.718264 0,13.688333 0,15.762639 C0,17.422083 0.31346,19.012732 0.9425,20.532499 C1.56942,21.985556 2.40673,23.263495 3.45442,24.370486 C4.56942,25.477477 5.86115,26.340555 7.32539,26.961805 C8.78962,27.653935 10.36115,28 12.03366,28 C14.0575,28 15.97405,27.551783 17.79173,26.65118 C19.60729,25.821458 21.17672,24.681111 22.5021,23.228055 C23.89481,21.708287 24.97616,19.980046 25.74404,18.045417 C26.58135,16.108704 27,14.069838 27,11.926737 C27,8.539051 25.91865,5.70382 23.75596,3.423126 C21.66269,1.140347 18.90673,-2.27373675e-13 15.48808,-2.27373675e-13 L15.48808,-2.27373675e-13 Z"></path>
    </g>
  </svg>
);

const ClaimButton = () => {
  const user = useUser();

  console.log("Claim reward", user);

  return <Button>Claim Reward</Button>;
};

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
      mb={4}
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
            <Icon as={ReefCoin} w={6} h={6} />
          </InputLeftElement>
          <Input
            size="lg"
            placeholder="0.00"
            border="none"
            type="number"
            readOnly
            value={stakeAmount ? stakeAmount : ""}
          />
        </InputGroup>
        <Text ml={2} color="gray.500">
          At: {stakeTime.toLocaleDateString()}
        </Text>
      </Box>
      <HStack mb={4}>
        <Button
          flex={1}
          disabled={isWithdrawing || user.isLoading}
          type="submit"
        >
          Withdraw
        </Button>
        <Button
          colorScheme="green"
          bg="green.300"
          color="green.900"
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

function StakeBox({}) {
  const { isLoading, mutateAsync: stake } = useStake();
  const { data } = useUser();
  const account = useAccount();

  const [amount, setAmount] = useState("");

  function handleMax() {
    setAmount(account.balance.toString() / 1e18);
  }
  function handleChange(e) {
    const { value } = e.target;
    console.log(value, value);
    setAmount(value || "");
  }
  return (
    <>
      <WithdrawBox />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          stake(amount);
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
              <Icon as={ReefCoin} w={6} h={6} />
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
            Balance: {data?.tokenAmount?.toString()}
          </Text>
        </Box>
        <Button disabled={isLoading} isFullWidth mt={2} type="submit">
          {isLoading ? <Spinner /> : "Stake tokens"}
        </Button>
      </form>
    </>
  );
}

const TokenAllocation = ({ project }) => {
  const { data, isLoading } = useTotalStaked();
  return (
    <>
      <Flex justifyContent="space-between">
        <Text>Allocation</Text>
        <Text>
          {isLoading ? <SkeletonText noOfLines={1} /> : data?.toString()}
        </Text>
      </Flex>
      <Flex justifyContent="space-between">
        <Text>Price per token</Text>
        <Text>TBA</Text>
      </Flex>
    </>
  );
};
const ProjectView = ({ ...props }) => {
  const router = useRouter();
  const kyc = useKyc();
  const { id } = router.query;

  const project = projects.find((p) => p.slug === id);

  const { address, balance, wallet } = useWeb3();

  if (!project) {
    return null;
  }

  return (
    <Layout>
      <Box p={6} pt={0}>
        <Breadcrumb mb={8}>
          <BreadcrumbItem>
            <BreadcrumbLink as={NextLink} href={`/`}>
              Projects
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink href="#">{project.name}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        <Flex alignItems="center" mb={8}>
          <Box mr={8}>
            <Image w={24} h={24} borderRadius="md" src={project.logo_url} />
          </Box>
          <Box>
            <Heading size="xl" mb={4}>
              {project.name}
            </Heading>
            <Text fontSize="lg">{project.short_description}</Text>
          </Box>
        </Flex>
        <Grid templateColumns="auto 25rem" gap={8}>
          <Box>
            <Image src={project.cover_url} mb={16} />
            <Markdown>{project.description}</Markdown>
          </Box>
          <Box>
            <Box
              p={8}
              boxShadow="lg"
              bg="white"
              sx={{
                position: "sticky",
                top: "36px",
              }}
            >
              <Text color="gray.400">Fundraise Goal</Text>
              <Text fontSize={48} fontWeight="bold">
                {formatMoney(project.total_raise)}
              </Text>
              <TokenAllocation project={project} />
              <Box mt={8}>
                {kyc?.data?.kyc ? (
                  <StakeBox project={project} />
                ) : (
                  <Box mb={4}>
                    <KycVerifyButton />
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Grid>
      </Box>
    </Layout>
  );
};

export default ProjectView;
