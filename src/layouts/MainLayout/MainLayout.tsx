import { Suspense } from "react";
import { Box, Container } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import AppBar from "../../components/AppBar/AppBar";
import Footer from "../../components/Footer/Footer";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import ErrorBoundary from "../../components/ErrorBoundary/ErrorBoundary";

const MainLayout = () => {
  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <AppBar />

      <Box as="main" flex="1">
        <Container maxW="6xl" py={6} px={{ base: 4, md: 6 }} pt={{ base: "100px", md: "110px" }}>
          <Suspense fallback={<LoadingSpinner />}>
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </Suspense>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default MainLayout;

