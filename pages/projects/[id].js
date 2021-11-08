import {
  Box,
  Heading,
  Text,
  Flex,
  Grid,
  Image,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  SkeletonText,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/router";

import Layout from "../../components/Layout";
import Markdown from "../../components/Markdown";
import StakeBox from "../../components/StakeBox";
import WithdrawBox from "../../components/WithdrawBox";
import { formatMoney } from "../../utils/format";
import { useTotalStaked } from "../../providers/web3";
import KycVerifyButton, { useKyc } from "../../components/KycVerify";

const projects = require("../../data");

const TokenAllocation = ({ project }) => {
  const { data, isLoading } = useTotalStaked();
  return (
    <>
      <Flex justifyContent="space-between">
        <Text>Allocation</Text>
        <Text>
          {isLoading ? (
            <SkeletonText width={10} noOfLines={1} />
          ) : (
            formatMoney(data, 2)
          )}
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
                <Box mb={8} />
                <WithdrawBox />
              </Box>
            </Box>
          </Box>
        </Grid>
      </Box>
    </Layout>
  );
};

export default ProjectView;
