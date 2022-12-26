/* eslint-disable react-hooks/rules-of-hooks */
import * as React from "react";

import {
  useCallback,
  useEffect,
  useState,
  useRef,
  ElementType,
  ReactNode,
  memo,
} from "react";
import {
  IconButton,
  Box,
  CloseButton,
  Flex,
  Icon,
  useColorModeValue,
  Link,
  Drawer,
  DrawerContent,
  Text,
  useDisclosure,
  BoxProps,
  FlexProps,
  VStack,
} from "@chakra-ui/react";
import { FiMenu } from "react-icons/fi";
import NextLink from "next/link";
import { IconType } from "react-icons";
import localFont from "@next/font/local";

import LogoutButton from "./LogoutButton";
import ModeToggler from "./ModeToggler";

interface LinkItemProps {
  name: string;
  icon: IconType;
  href: string;
}

const sundaneseFont = localFont({
  src: "./fonts/NotoSansSundanese-Regular.ttf",
});

type SimpleSidebarType = JSX.IntrinsicAttributes;

export const SidebarWrapper =
  (LinkItems: Array<LinkItemProps>) => (WrappedComponent: ElementType) =>
    // eslint-disable-next-line react/display-name
    memo((props: SimpleSidebarType) => {
      const { isOpen, onOpen, onClose } = useDisclosure();
      const container = useRef<HTMLDivElement>(null!);

      return (
        <Box
          minH="100vh"
          bg={useColorModeValue("gray.100", "gray.900")}
          ref={container}
        >
          <SidebarContent
            LinkItems={LinkItems}
            onClose={() => onClose}
            display={{ base: "none", md: "block" }}
          />
          <Drawer
            autoFocus={false}
            isOpen={isOpen}
            placement="left"
            onClose={onClose}
            returnFocusOnClose={false}
            onOverlayClick={onClose}
            size="full"
          >
            <DrawerContent>
              <SidebarContent
                onClose={onClose}
                height={height}
                LinkItems={LinkItems}
              />
            </DrawerContent>
          </Drawer>
          {/* mobilenav */}
          <MobileNav display={{ base: "flex", md: "none" }} onOpen={onOpen} />
          <Box ml={{ base: 0, md: 60 }} p="4">
            <WrappedComponent {...props} />
          </Box>
        </Box>
      );
    });

interface SidebarProps extends BoxProps {
  onClose: () => void;
  LinkItems: Array<LinkItemProps>;
}

const SidebarContent = ({ LinkItems, onClose, ...rest }: SidebarProps) => {
  return (
    <Box
      bg={useColorModeValue("white", "gray.900")}
      borderRight="1px"
      borderRightColor={useColorModeValue("gray.200", "gray.700")}
      w={{ base: "full", md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text
          fontSize="2xl"
          fontWeight="bold"
          className={sundaneseFont.className}
        >
          ᮞᮧᮛ
        </Text>
        <CloseButton display={{ base: "flex", md: "none" }} onClick={onClose} />
      </Flex>
      {LinkItems.map((link) => (
        <NavItem key={link.name} icon={link.icon} href={link.href}>
          {link.name}
        </NavItem>
      ))}
      <LogoutButton />
      <ModeToggler />
    </Box>
  );
};

interface NavItemProps extends FlexProps {
  icon: IconType;
  children: ReactNode;
  href: string;
}
const NavItem = ({ icon, children, href, ...rest }: NavItemProps) => {
  return (
    <NextLink href={href} legacyBehavior passHref>
      <Link style={{ textDecoration: "none" }} _focus={{ boxShadow: "none" }}>
        <Flex
          align="center"
          p="4"
          mx="4"
          borderRadius="lg"
          role="group"
          cursor="pointer"
          _hover={{
            bg: "cyan.700",
            color: "white",
          }}
          {...rest}
        >
          {icon && (
            <Icon
              mr="4"
              fontSize="16"
              _groupHover={{
                color: "white",
              }}
              as={icon}
            />
          )}
          {children}
        </Flex>
      </Link>
    </NextLink>
  );
};

interface MobileProps extends FlexProps {
  onOpen: () => void;
}
const MobileNav = ({ onOpen, ...rest }: MobileProps) => {
  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 24 }}
      height="20"
      alignItems="center"
      bg={useColorModeValue("white", "gray.900")}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue("gray.200", "gray.700")}
      justifyContent="flex-start"
      {...rest}
    >
      <IconButton
        variant="outline"
        onClick={onOpen}
        aria-label="open menu"
        icon={<FiMenu />}
      />

      <Text
        fontSize="2xl"
        ml="8"
        fontWeight="bold"
        className={sundaneseFont.className}
      >
        ᮞᮧᮛ
      </Text>
    </Flex>
  );
};
