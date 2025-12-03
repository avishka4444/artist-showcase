import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./layouts/MainLayout/MainLayout";
import ErrorPage from "./components/ErrorPage/ErrorPage";

const Home = lazy(() => import("./pages/Home/Home"));
const AlbumDetail = lazy(() => import("./pages/AlbumDetail/AlbumDetail"));
const Search = lazy(() => import("./pages/Search/Search"));
const Favourites = lazy(() => import("./pages/Favourites/Favourites"));

export const navRoutes = [
  { label: "Home", path: "/" },
  { label: "Search", path: "/search" },
  { label: "Favourites", path: "/favourites" },
] as const;

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "album/:artist/:albumName",
        element: <AlbumDetail />,
      },
      {
        path: "search",
        element: <Search />,
      },
      {
        path: "favourites",
        element: <Favourites />,
      },
    ],
  },
]);
