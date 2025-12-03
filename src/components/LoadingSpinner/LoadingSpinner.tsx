import { Center, Spinner } from "@chakra-ui/react";

const LoadingSpinner = () => (
  <Center minH="400px">
    <Spinner size="xl" color="gray.500" />
  </Center>
);

export default LoadingSpinner;
