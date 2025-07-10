import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  TextInput,
  Textarea,
  NumberInput,
  Group,
  Stack,
  Text,
  Alert,
  ActionIcon,
  Menu,
  Badge,
} from "@mantine/core";
import { useMutation, useQueryClient } from "react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { useContext } from "react";
import {
  MdEdit,
  MdDelete,
  MdMoreVert,
  MdWarning,
  MdInfo,
} from "react-icons/md";
import { toast } from "react-toastify";
import { updateResidency, deleteResidency } from "../../utils/api";
import UserDetailContext from "../../context/UserDetailContext";
import "./PropertyManagement.css";

const PropertyManagement = ({ property }) => {
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [editForm, setEditForm] = useState({
    title: property?.title || "",
    description: property?.description || "",
    price: property?.price || 0,
    address: property?.address || "",
    city: property?.city || "",
    country: property?.country || "",
    facilities: {
      bedrooms: property?.facilities?.bedrooms || 0,
      bathrooms: property?.facilities?.bathrooms || 0,
      parkings: property?.facilities?.parkings || 0,
    },
    image: property?.image || "",
  });

  const { user } = useAuth0();
  const { userDetails } = useContext(UserDetailContext);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (editModalOpened) {
      setEditForm({
        title: property?.title || "",
        description: property?.description || "",
        price: property?.price || 0,
        address: property?.address || "",
        city: property?.city || "",
        country: property?.country || "",
        facilities: {
          bedrooms: property?.facilities?.bedrooms || 0,
          bathrooms: property?.facilities?.bathrooms || 0,
          parkings: property?.facilities?.parkings || 0,
        },
        image: property?.image || "",
      });
    }
  }, [property, editModalOpened]);

  // Additional effect to ensure cache is up to date when property changes
  useEffect(() => {
    if (property) {
      // Ensure the property data is cached
      queryClient.setQueryData(["resd", property.id], property);
    }
  }, [property, queryClient]);

  // Update mutation
  const { mutate: updateProperty, isLoading: updating } = useMutation({
    mutationFn: () =>
      updateResidency(property.id, editForm, userDetails?.token, user?.email),
    onSuccess: (updatedProperty) => {
      toast.success("Property updated successfully!", {
        position: "bottom-right",
      });
      setEditModalOpened(false);

      // Optimistically update the cache
      queryClient.setQueryData(["resd", property.id], updatedProperty);

      // Invalidate and refetch all relevant queries
      queryClient.invalidateQueries("allProperties");
      queryClient.invalidateQueries(["ownedProperties", user?.email]);
      queryClient.invalidateQueries(["resd", property.id]);

      // Force refetch to ensure UI is updated
      queryClient.refetchQueries("allProperties");
      queryClient.refetchQueries(["ownedProperties", user?.email]);
    },
    onError: (error) => {
      console.error("Update property error:", error);
      toast.error(error.response?.data?.message || "Failed to update property");
    },
  });

  // Delete mutation
  const { mutate: deleteProperty, isLoading: deleting } = useMutation({
    mutationFn: () =>
      deleteResidency(property.id, user?.email, userDetails?.token),
    onSuccess: () => {
      toast.success("Property deleted successfully!", {
        position: "bottom-right",
      });
      setDeleteModalOpened(false);

      // Remove the property from cache immediately
      queryClient.removeQueries(["resd", property.id]);

      // Invalidate and refetch all relevant queries
      queryClient.invalidateQueries("allProperties");
      queryClient.invalidateQueries(["ownedProperties", user?.email]);

      // Force refetch to ensure UI is updated
      queryClient.refetchQueries("allProperties");
      queryClient.refetchQueries(["ownedProperties", user?.email]);
    },
    onError: (error) => {
      console.error("Delete property error:", error);
      toast.error(error.response?.data?.message || "Failed to delete property");
    },
  });

  const handleEditSubmit = () => {
    // Basic validation
    if (
      !editForm.title ||
      !editForm.description ||
      !editForm.address ||
      !editForm.city ||
      !editForm.country
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (editForm.price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }
    updateProperty();
  };

  const handleDelete = () => {
    deleteProperty();
  };

  return (
    <>
      {/* Property Management Menu */}
      <Menu shadow="md" width={200} position="bottom-end">
        <Menu.Target>
          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            className="property-menu-trigger"
          >
            <MdMoreVert size={20} />
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Property Management</Menu.Label>
          <Menu.Item
            icon={<MdEdit size={16} />}
            onClick={() => setEditModalOpened(true)}
          >
            Edit Property
          </Menu.Item>
          <Menu.Item
            icon={<MdDelete size={16} />}
            color="red"
            onClick={() => setDeleteModalOpened(true)}
          >
            Delete Property
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      {/* Edit Modal */}
      <Modal
        opened={editModalOpened}
        onClose={() => setEditModalOpened(false)}
        title="Edit Property"
        size="lg"
        centered
      >
        <Stack gap="md">
          <TextInput
            label="Property Title"
            placeholder="Enter property title"
            value={editForm.title}
            onChange={(e) =>
              setEditForm((prev) => ({ ...prev, title: e.target.value }))
            }
            required
          />

          <Textarea
            label="Description"
            placeholder="Enter property description"
            value={editForm.description}
            onChange={(e) =>
              setEditForm((prev) => ({ ...prev, description: e.target.value }))
            }
            minRows={3}
            required
          />

          <NumberInput
            label="Price ($)"
            placeholder="Enter price"
            value={editForm.price}
            onChange={(value) =>
              setEditForm((prev) => ({ ...prev, price: value || 0 }))
            }
            min={0}
            required
          />

          <TextInput
            label="Address"
            placeholder="Enter property address"
            value={editForm.address}
            onChange={(e) =>
              setEditForm((prev) => ({ ...prev, address: e.target.value }))
            }
            required
          />

          <Group grow>
            <TextInput
              label="City"
              placeholder="Enter city"
              value={editForm.city}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, city: e.target.value }))
              }
              required
            />
            <TextInput
              label="Country"
              placeholder="Enter country"
              value={editForm.country}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, country: e.target.value }))
              }
              required
            />
          </Group>

          <Text size="sm" fw={500} c="dimmed">
            Facilities
          </Text>
          <Group grow>
            <NumberInput
              label="Bedrooms"
              placeholder="Number of bedrooms"
              value={editForm.facilities.bedrooms}
              onChange={(value) =>
                setEditForm((prev) => ({
                  ...prev,
                  facilities: { ...prev.facilities, bedrooms: value || 0 },
                }))
              }
              min={0}
            />
            <NumberInput
              label="Bathrooms"
              placeholder="Number of bathrooms"
              value={editForm.facilities.bathrooms}
              onChange={(value) =>
                setEditForm((prev) => ({
                  ...prev,
                  facilities: { ...prev.facilities, bathrooms: value || 0 },
                }))
              }
              min={0}
            />
            <NumberInput
              label="Parking"
              placeholder="Number of parking spaces"
              value={editForm.facilities.parkings}
              onChange={(value) =>
                setEditForm((prev) => ({
                  ...prev,
                  facilities: { ...prev.facilities, parkings: value || 0 },
                }))
              }
              min={0}
            />
          </Group>

          <TextInput
            label="Image URL"
            placeholder="Enter image URL"
            value={editForm.image}
            onChange={(e) =>
              setEditForm((prev) => ({ ...prev, image: e.target.value }))
            }
          />

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={() => setEditModalOpened(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditSubmit}
              loading={updating}
              disabled={updating}
            >
              {updating ? "Updating..." : "Update Property"}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        title="Delete Property"
        size="md"
        centered
      >
        <Stack gap="md">
          <Alert
            icon={<MdWarning size={16} />}
            title="Are you sure?"
            color="red"
            variant="light"
          >
            This action cannot be undone. This will permanently delete the
            property
            <Text fw={600} mt="xs">
              "{property?.title}"
            </Text>
          </Alert>

          <Text size="sm" c="dimmed">
            All data associated with this property, including visitor inquiries,
            will be permanently removed.
          </Text>

          <Group justify="flex-end" mt="md">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpened(false)}
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={handleDelete}
              loading={deleting}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Property"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export default PropertyManagement;
