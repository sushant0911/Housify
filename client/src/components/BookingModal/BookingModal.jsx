import React, { useContext, useState } from "react";
import { Modal, Button } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { useMutation, useQueryClient } from "react-query";
import UserDetailContext from "../../context/UserDetailContext.js";
import { bookVisit } from "../../utils/api.js";
import { toast } from "react-toastify";
import dayjs from "dayjs";
const BookingModal = ({ opened, setOpened, email, propertyId }) => {
  const [value, setValue] = useState(null);
  const {
    userDetails: { token },
    setUserDetails,
  } = useContext(UserDetailContext);
  const queryClient = useQueryClient();

  // Validate that user is authenticated
  if (!email) {
    toast.error("Please login to book a visit");
    setOpened(false);
    return null;
  }

  const handleBookingSuccess = () => {
    toast.success("You have booked your visit", {
      position: "bottom-right",
    });
    setUserDetails((prev) => ({
      ...prev,
      bookings: [
        ...prev.bookings,
        {
          id: propertyId,
          date: dayjs(value).format("DD/MM/YYYY"),
        },
      ],
    }));
  };

  const { mutate, isLoading } = useMutation({
    mutationFn: () => {
      if (!value) {
        throw new Error("Please select a date");
      }
      if (value < new Date()) {
        throw new Error("Please select a future date");
      }
      return bookVisit(value, propertyId, email, token);
    },
    onSuccess: (data) => {
      console.log("Booking successful:", data);
      handleBookingSuccess();
      // Refetch bookings to ensure data is up to date
      queryClient.invalidateQueries(["allBookings", email]);
    },
    onError: (error) => {
      console.error("Booking error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to book visit. Please try again.";
      toast.error(errorMessage);
    },
    onSettled: () => setOpened(false),
  });

  return (
    <Modal
      opened={opened}
      onClose={() => setOpened(false)}
      title="Select your date of visit"
      centered
    >
      <div className="flexColCenter" style={{ gap: "1rem" }}>
        <DatePicker value={value} onChange={setValue} minDate={new Date()} />
        <Button
          disabled={!value || isLoading}
          onClick={() => mutate()}
          loading={isLoading}
        >
          {isLoading ? "Booking..." : "Book visit"}
        </Button>
      </div>
    </Modal>
  );
};

export default BookingModal;
