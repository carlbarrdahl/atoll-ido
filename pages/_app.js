import { ChakraProvider } from "@chakra-ui/react";
import { ApolloProvider } from "@apollo/client";
import { QueryClient, QueryClientProvider } from "react-query";
import { FirebaseAppProvider } from "reactfire";

import { createApolloClient } from "../lib/apollo";
import config from "../config";
import { extendTheme } from "@chakra-ui/react";
import Web3Provider from "../providers/web3";

const apolloClient = createApolloClient();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const theme = extendTheme({
  fonts: {
    heading: "monospace",
    body: "monospace",
  },
});

function MyApp({ Component, pageProps }) {
  return (
    <ApolloProvider client={apolloClient}>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider theme={theme}>
          <FirebaseAppProvider firebaseConfig={config.firebase}>
            <Web3Provider>
              <Component {...pageProps} />
            </Web3Provider>
          </FirebaseAppProvider>
        </ChakraProvider>
      </QueryClientProvider>
    </ApolloProvider>
  );
}

export default MyApp;
