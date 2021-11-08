import { AuthProvider, useFirebaseApp } from "reactfire";

import { Button, Flex, Avatar, Box, Container } from "@chakra-ui/react";

import { useAuth, useSigninCheck } from "reactfire";
import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";

export const signOut = (auth) =>
  auth.signOut().then(() => console.log("signed out"));
const signIn = async (auth) => {
  const provider = new GoogleAuthProvider();

  await signInWithPopup(auth, provider);
};

const SignInForm = () => {
  const auth = useAuth();
  return (
    <Flex justifyContent="center" alignItems="center" h={"100vh"} bg="gray.200">
      <Container>
        <Flex
          bg="white"
          py={32}
          boxShadow="2xl"
          alignItems="center"
          justifyContent="center"
        >
          <Button onClick={() => signIn(auth)}>Sign in with Google</Button>
        </Flex>
      </Container>
    </Flex>
  );
};

export const AuthWrapper = ({ children, fallback }) => {
  const { status, data: signInCheckResult } = useSigninCheck();

  if (!children) {
    throw new Error("Children must be provided");
  }
  if (status === "loading") {
    return "loading...";
  } else if (signInCheckResult.signedIn === true) {
    return children;
  }

  return fallback;
};

export default function Auth(props) {
  const firebaseApp = useFirebaseApp();
  const auth = getAuth(firebaseApp);

  return (
    <AuthProvider sdk={auth}>
      <AuthWrapper fallback={<SignInForm />}> {props.children}</AuthWrapper>
    </AuthProvider>
  );
}
