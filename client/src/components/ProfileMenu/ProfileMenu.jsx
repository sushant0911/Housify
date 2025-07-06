import React, { useContext } from "react";
import { Avatar, Menu } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import UserDetailContext from "../../context/UserDetailContext";

const ProfileMenu = ({ user, logout }) => {
  const navigate = useNavigate();
  const { setUserDetails } = useContext(UserDetailContext);

  return (
    <Menu>
      <Menu.Target>
        <Avatar src={user?.picture} alt="user image" radius="xl" />
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item onClick={() => navigate("./favourites", { replace: true })}>
          Favourites
        </Menu.Item>

        <Menu.Item onClick={() => navigate("./bookings", { replace: true })}>
          Bookings
        </Menu.Item>

        <Menu.Item
          onClick={() => {
            localStorage.clear();
            setUserDetails({
              favourites: [],
              bookings: [],
              token: null,
            });
            logout();
          }}
        >
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default ProfileMenu;
