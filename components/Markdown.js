import React from "react";

import {
  Divider,
  Box,
  Heading,
  Text,
  Flex,
  UnorderedList,
  ListItem,
  Grid,
  GridItem,
  Image,
} from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";

const components = {
  h2: (p) => (
    <Heading
      as="h2"
      fontSize={"lg"}
      fontWeight="light"
      textTransform="uppercase"
      letterSpacing={6}
      color="gray.400"
      mt={16}
      mb={4}
      {...p}
    />
  ),
  h3: (p) => <Heading as="h3" mb={4} letterSpacing={-2} {...p} />,
  p: (p) => <Text mb={8} fontSize="md" {...p} />,
  ul: (p) => <UnorderedList {...p} ml={8} mb={16} />,
  li: (p) => <ListItem {...p} fontSize="xl" mb={4} />,
  img: (p) => <Image {...p} my={8} />,
};

export default function Markdown({ children }) {
  return <ReactMarkdown components={components}>{children}</ReactMarkdown>;
}
