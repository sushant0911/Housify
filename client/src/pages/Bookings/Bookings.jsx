import React, { useContext, useState, useEffect } from "react";
import SearchBar from "../../components/SearchBar/SearchBar";
import useProperties from "../../hooks/useProperties";
import { PuffLoader } from "react-spinners";
import PropertyCard from "../../components/PropertyCard/PropertyCard";
import "../Properties/Properties.css";
import UserDetailContext from "../../context/UserDetailContext";
import useBookings from "../../hooks/useBookings";

const Bookings = () => {
  const { data, isError, isLoading } = useProperties();
  const [filter, setFilter] = useState("");
  const {
    userDetails: { bookings },
  } = useContext(UserDetailContext);
  const { refetch: refetchBookings } = useBookings();

  // Refetch bookings when component mounts
  useEffect(() => {
    refetchBookings();
  }, [refetchBookings]);

  if (isError) {
    return (
      <div className="wrapper">
        <span>Error while fetching data</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="wrapper flexCenter" style={{ height: "60vh" }}>
        <PuffLoader
          height="80"
          width="80"
          radius={1}
          color="#4066ff"
          aria-label="puff-loading"
        />
      </div>
    );
  }
  return (
    <div className="wrapper">
      <div className="flexColCenter paddings innerWidth properties-container">
        <SearchBar filter={filter} setFilter={setFilter} />

        <div className="paddings flexCenter properties">
          {data &&
          Array.isArray(data) &&
          bookings &&
          Array.isArray(bookings) ? (
            data
              .filter((property) =>
                bookings.map((booking) => booking.id).includes(property.id)
              )
              .filter(
                (property) =>
                  property.title.toLowerCase().includes(filter.toLowerCase()) ||
                  property.city.toLowerCase().includes(filter.toLowerCase()) ||
                  property.country.toLowerCase().includes(filter.toLowerCase())
              )
              .map((card, i) => <PropertyCard card={card} key={i} />)
          ) : (
            <span>No bookings available</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bookings;
