import { Box, Container, Heading, VStack } from "@chakra-ui/react";

function App() {
  return (
    <Box minH="100vh" bg="white">
      <Container maxW="container.md" py={8}>
        <VStack gap={8} align="stretch">
          <Box textAlign="center" color="gray.900">
            <Heading as="h1" size="2xl" mb={4}>
              Melody Scope
            </Heading>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}

export default App;
