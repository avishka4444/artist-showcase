import { Link, useLocation } from "react-router-dom";
import {
  Box,
  Container,
  Flex,
  Text,
  Image,
} from "@chakra-ui/react";

import { navRoutes } from "../../routes";
import logo from "../../assets/logo.png";

const AppBar = () => {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      width="100%"
      zIndex={50}
      bg="white"
      boxShadow="md"
      minH="80px"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Container
        maxW="6xl"
        w="100%"
        px={{ base: 4, md: 6 }}
        position="relative"
      >
        <Flex align="center" justify="space-between" h="100%">
          <Box flexShrink={0}>
            <Link to="/">
              <Image
                src={logo}
                alt="Logo"
                height={{ base: "36px", md: "44px" }}
                width="auto"
                objectFit="contain"
              />
            </Link>
          </Box>

          <Flex
            gap={{ base: 4, md: 8, lg: 12, xl: 16 }}
            position="absolute"
            left="50%"
            transform="translateX(-50%)"
            align="center"
          >
            {navRoutes.map((item) => {
              const isActive =
                (item.path === "/" && pathname === "/") ||
                (item.path !== "/" && pathname.startsWith(item.path));

              return (
                <Link key={item.path} to={item.path}>
                  <Text
                    textAlign="center"
                    fontSize={{ base: "xs", sm: "sm", lg: "md" }}
                    color={isActive ? "gray.900" : "gray.500"}
                    fontWeight={isActive ? "bold" : "normal"}
                    borderBottom={isActive ? "2px solid" : "none"}
                    borderColor={isActive ? "gray.900" : "transparent"}
                    pb={1}
                    _hover={{ color: "gray.700" }}
                    transition="color 0.2s ease"
                  >
                    {item.label}
                  </Text>
                </Link>
              );
            })}
          </Flex>

          <Box
            flexShrink={0}
            width="200px"
            display={{ base: "none", lg: "block" }}
          />
        </Flex>
      </Container>
    </Box>
  );
};

export default AppBar;
