import { Box, Container } from "@chakra-ui/react";

import Auth from "./Auth";
import Header from "./Header";

export default function DashboardLayout({ children }) {
  return (
    <Box bg="gray.100" minH="100vh">
      {/* <Auth> */}
      <Header />
      <Container maxW={"container.xl"} pt={8} pb={32}>
        {children}
      </Container>
      {/* </Auth> */}
    </Box>
  );
}
