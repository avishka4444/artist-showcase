import { Box, Text } from "@chakra-ui/react";

const Footer = () => {
  return (
    <Box bg="#1A1A1A" py={4} textAlign="center">
      <Text color="white" fontSize="sm">
        © Copyright {new Date().getFullYear()}, All Rights Reserved by Melody Scope
      </Text>
    </Box>
  );
};

export default Footer;
