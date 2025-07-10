import React, { useContext } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { Menu, Avatar, Text, Group, UnstyledButton, rem } from "@mantine/core";
import { MdPerson, MdLogout } from "react-icons/md";
import UserDetailContext from "../../context/UserDetailContext";
import "./ProfileMenu.css";

const ProfileMenu = () => {
  const { user, logout } = useAuth0();
  const { userDetails } = useContext(UserDetailContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return (
    <Menu shadow="md" width={200} position="bottom-end">
      <Menu.Target>
        <UnstyledButton className="profile-menu-trigger">
          <Avatar src={user?.picture} alt={user?.name} size="md" radius="xl" />
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          icon={<MdPerson size={16} />}
          onClick={() => navigate("/profile")}
        >
          Profile
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item
          icon={<MdLogout size={16} />}
          style={{ color: "red", fontWeight: "100" }}
          className="logout-menu-item"
          onClick={handleLogout}
        >
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default ProfileMenu;
