import { Component, type ReactNode } from "react";
import { Box, Heading, Text, Button } from "@chakra-ui/react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
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
            Something went wrong
          </Heading>
          <Text color="gray.600" mb={4}>
            {this.state.error?.message || "An unexpected error occurred"}
          </Text>
          <Button onClick={this.handleReset} colorScheme="gray">
            Go to Home
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

