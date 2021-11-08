import { useAuth } from "reactfire";
import { useMutation, useQuery, useQueryClient } from "react-query";

import { request } from "../lib/request";

export const useAPIKey = () => {
  const auth = useAuth();
  const queryClient = useQueryClient();

  const post = useMutation(
    () =>
      request(`/api/key`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.currentUser.accessToken,
        },
      }),
    {
      onSuccess: () => queryClient.invalidateQueries("api-key"),
    }
  );

  const get = useQuery(
    "api-key",
    () =>
      request(`/api/key`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.currentUser.accessToken,
        },
      })
    // { enabled: false } // Lazy-loading of api key
  );

  console.log("useAIKEY", post.error, get.error);
  return {
    apiKey: get.data?.key,
    create: post.mutateAsync,
    isLoading: post.isLoading || get.isLoading,
    error: post.error || get.error,
    refetch: get.refetch,
  };
};

export const useWalletAddress = () => {
  const auth = useAuth();
  const queryClient = useQueryClient();

  const post = useMutation((wallet) => {
    console.log("save wallet", wallet);
    return request(`/api/wallet`, {
      method: "POST",
      body: JSON.stringify({ wallet }),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + auth.currentUser.accessToken,
      },
    }).then(() => queryClient.invalidateQueries("wallet"));
  });

  const get = useQuery("wallet", () =>
    request(`/api/wallet`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + auth.currentUser.accessToken,
      },
    })
  );

  return {
    wallet: get.data?.wallet,
    save: post.mutateAsync,
    isLoading: post.isLoading || get.isLoading,
    error: post.error || get.error,
    refetch: get.refetch,
  };
};
