import React from "react";

import { Box, Heading, Text, Flex, SimpleGrid, Image } from "@chakra-ui/react";
import NextLink from "next/link";
import Layout from "../components/Layout";

import { formatMoney } from "../utils/format";

const projects = require("../data");

function ProjectItems({
  slug,
  cover_url,
  logo_url,
  name,
  token_symbol,
  total_raise,
}) {
  return (
    <NextLink href={`/projects/${slug}`}>
      <Box
        cursor="pointer"
        maxW="sm"
        borderRadius="md"
        borderWidth={1}
        borderColor="gray.300"
        bg="white"
        boxShadow="lg"
        mb={8}
      >
        <Image borderRadius="md" src={cover_url} />
        <Flex ml={8} mt={-12}>
          <Box bg="white" borderRadius="lg" boxShadow="lg">
            <Image w={24} h={24} borderRadius="md" src={logo_url} />
          </Box>
          <Box></Box>
        </Flex>
        <Box p={4}>
          <Heading size="md">{name}</Heading>
          <Text fontWeight="bold" color="gray.400" mb={3}>
            ${token_symbol}
          </Text>
          <Flex justifyContent="space-between" mb={2}>
            <Text>Total Raise: </Text>
            <Text>{formatMoney(total_raise)}</Text>
          </Flex>
          <Flex justifyContent="space-between">
            <Text>Allocation:</Text>
            <Text>TBA</Text>
          </Flex>
        </Box>
      </Box>
    </NextLink>
  );
}

const Dashboard = ({}) => {
  return (
    <Layout>
      <Box>
        <Heading size="lg" mb={8}>
          Upcoming projects
        </Heading>
        <SimpleGrid columns={[3]} mb={16}>
          {projects
            .filter((p) => p.state !== "published")
            .map((project) => (
              <ProjectItems key={project.id} {...project} />
            ))}
        </SimpleGrid>
        <Heading size="lg" mb={8}>
          Funded projects
        </Heading>
        <SimpleGrid columns={[3]} mb={16}>
          {projects
            .filter((p) => p.state === "published")
            .map((project) => (
              <ProjectItems key={project.id} {...project} />
            ))}
        </SimpleGrid>
      </Box>
    </Layout>
  );
};

export default Dashboard;
