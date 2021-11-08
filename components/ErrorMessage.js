import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  Flex,
} from "@chakra-ui/react";
export default function ErrorMessage({ error, retry }) {
  return (
    <Alert status="error">
      <AlertIcon />
      <Flex alignItems="center" justifyContent="space-between" flex="1">
        There was an error processing your request
        <Button size="sm" onClick={retry} colorScheme="red">
          Retry
        </Button>
      </Flex>
    </Alert>
  );
}
