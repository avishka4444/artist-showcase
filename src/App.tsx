import { Box, Container, Heading, VStack } from "@chakra-ui/react";

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Container maxW="container.md" py={8}>
        <VStack gap={8} align="stretch">
          <Box textAlign="center" className="text-gray-900">
            <Heading as="h1" size="2xl" mb={4} className="text-gray-900">
              Artist Showcase
            </Heading>
          </Box>
        </VStack>
      </Container>
    </div>
  );
}

export default App;
