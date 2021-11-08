import { ApolloClient, InMemoryCache } from "@apollo/client";
import { split, HttpLink } from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { WebSocketLink } from "@apollo/client/link/ws";

import config from "../config";

export function createApolloClient() {
  const httpLink = new HttpLink({ uri: config.network.backendHttp });

  const wsLink =
    process.browser &&
    new WebSocketLink({
      uri: config.network.backendWs,
      options: { reconnect: true },
    });

  const link = process.browser
    ? split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
            definition.kind === "OperationDefinition" &&
            definition.operation === "subscription"
          );
        },
        wsLink,
        httpLink
      )
    : httpLink;

  return new ApolloClient({
    link,
    cache: new InMemoryCache(),
  });
}
