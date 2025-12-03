import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";
import { Box, Heading, Text, Button } from "@chakra-ui/react";

const ErrorPage = () => {
  const error = useRouteError();

  let errorMessage = "An unexpected error occurred";
  let errorStatus: number | undefined;

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    errorMessage = error.statusText || error.data?.message || `Error ${error.status}`;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <Box
      minH="400px"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      p={8}
      textAlign="center"
    >
      <Heading as="h2" size="lg" mb={4} color="red.500">
        {errorStatus === 404 ? "Page Not Found" : "Something went wrong"}
      </Heading>
      <Text color="gray.600" mb={4}>
        {errorMessage}
      </Text>
      <Link to="/">
        <Button colorScheme="gray">Go to Home</Button>
      </Link>
    </Box>
  );
};

export default ErrorPage;

