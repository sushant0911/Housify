import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  TextInput,
  Group,
  Stack,
  Text,
  Badge,
  ActionIcon,
  Menu,
  Alert,
} from "@mantine/core";
import { useMutation, useQueryClient } from "react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { useContext } from "react";
import {
  MdMoreVert,
  MdCheckCircle,
  MdSchedule,
  MdWarning,
  MdInfo,
} from "react-icons/md";
import { toast } from "react-toastify";
import { acceptVisit, discardVisit } from "../../utils/api";
import UserDetailContext from "../../context/UserDetailContext";
import "./VisitorManagement.css";

const VisitorManagement = ({ visitor, onVisitorUpdate }) => {
  const [rescheduleModalOpened, setRescheduleModalOpened] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState({
    newDate: "",
    newTime: "",
  });

  const { user } = useAuth0();
  const { userDetails } = useContext(UserDetailContext);
  const queryClient = useQueryClient();

  // Track mutation success for discard and accept
  const [discarded, setDiscarded] = useState(false);
  const [accepted, setAccepted] = useState(false);

  // Accept visit mutation
  const {
    mutate: acceptVisitor,
    isLoading: accepting,
    isSuccess: acceptSuccess,
  } = useMutation({
    mutationFn: () =>
      acceptVisit(
        visitor.visitorEmail,
        visitor.propertyId,
        user?.email,
        userDetails?.token
      ),
    onSuccess: () => {
      toast.success("Visit accepted successfully!", {
        position: "bottom-right",
      });
      setAccepted(true);
      queryClient.invalidateQueries("propertyVisitors");
      queryClient.invalidateQueries(["allBookings", user?.email]);
    },
    onError: (error) => {
      console.error("Accept visit error:", error);
      toast.error(error.response?.data?.message || "Failed to accept visit");
    },
  });

  // Discard visit mutation
  const {
    mutate: discardVisitor,
    isLoading: discarding,
    isSuccess: discardSuccess,
  } = useMutation({
    mutationFn: () =>
      discardVisit(
        visitor.visitorEmail,
        visitor.propertyId,
        user?.email,
        userDetails?.token
      ),
    onSuccess: () => {
      toast.success("Visit discarded successfully!", {
        position: "bottom-right",
      });
      setDiscarded(true);
      queryClient.invalidateQueries("propertyVisitors");
      queryClient.invalidateQueries(["allBookings", user?.email]);
    },
    onError: (error) => {
      console.error("Discard visit error:", error);
      toast.error(error.response?.data?.message || "Failed to discard visit");
    },
  });

  // Notify parent on discard/accept
  useEffect(() => {
    if (discarded && onVisitorUpdate) {
      onVisitorUpdate(visitor.visitorEmail, visitor.propertyId, "discard");
    }
    if (accepted && onVisitorUpdate) {
      onVisitorUpdate(visitor.visitorEmail, visitor.propertyId, "accept");
    }
    // Reset flags
    setDiscarded(false);
    setAccepted(false);
    // eslint-disable-next-line
  }, [discarded, accepted]);

  // Confirmation modal state
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);

  const handleAccept = () => {
    acceptVisitor();
  };

  const handleDiscard = () => {
    setConfirmDiscardOpen(true);
  };

  const confirmDiscard = () => {
    discardVisitor();
    setConfirmDiscardOpen(false);
  };

  const cancelDiscard = () => {
    setConfirmDiscardOpen(false);
  };

  const getStatusBadge = () => {
    // This would need to be updated based on the actual booking status
    // For now, we'll show a default status
    return (
      <Badge color="blue" variant="light" size="sm">
        Pending
      </Badge>
    );
  };

  return (
    <>
      {/* Visitor Management Menu */}
      <Menu shadow="md" width={200} position="bottom-end">
        <Menu.Target>
          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            className="visitor-menu-trigger"
          >
            <MdMoreVert size={20} />
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Visit Management</Menu.Label>
          <Menu.Item
            icon={<MdCheckCircle size={16} />}
            color="green"
            onClick={handleAccept}
            disabled={accepting}
          >
            {accepting ? "Accepting..." : "Accept Visit"}
          </Menu.Item>
          <Menu.Item
            icon={<MdWarning size={16} />}
            color="red"
            onClick={handleDiscard}
            disabled={discarding}
          >
            {discarding ? "Discarding..." : "Discard Visit"}
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <Modal
        opened={confirmDiscardOpen}
        onClose={cancelDiscard}
        title="Confirm Discard"
        centered
        withCloseButton
      >
        <Text size="md" mb="md">
          Are you sure you want to discard this visitor entry? This action
          cannot be undone.
        </Text>
        <Group justify="flex-end">
          <Button
            variant="default"
            onClick={cancelDiscard}
            disabled={discarding}
          >
            Cancel
          </Button>
          <Button color="red" onClick={confirmDiscard} loading={discarding}>
            Discard
          </Button>
        </Group>
      </Modal>
    </>
  );
};

export default VisitorManagement;
