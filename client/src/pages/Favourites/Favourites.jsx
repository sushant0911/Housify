import React, { useContext, useState } from "react";
import SearchBar from "../../components/SearchBar/SearchBar";
import useProperties from "../../hooks/useProperties";
import useFavourites from "../../hooks/useFavourites";
import { PuffLoader } from "react-spinners";
import PropertyCard from "../../components/PropertyCard/PropertyCard";
import "../Properties/Properties.css";
import UserDetailContext from "../../context/UserDetailContext";

const Favourites = () => {
  const {
    data: propertiesData,
    isError: propertiesError,
    isLoading: propertiesLoading,
  } = useProperties();
  const {
    data: favouritesData,
    isError: favouritesError,
    isLoading: favouritesLoading,
  } = useFavourites();
  const [filter, setFilter] = useState("");

  const isError = propertiesError || favouritesError;
  const isLoading = propertiesLoading || favouritesLoading;

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

  // Filter properties that are in favorites
  const favoriteProperties =
    propertiesData?.filter((property) =>
      favouritesData?.includes(property.id)
    ) || [];

  // Apply search filter
  const filteredProperties = favoriteProperties.filter(
    (property) =>
      property.title.toLowerCase().includes(filter.toLowerCase()) ||
      property.city.toLowerCase().includes(filter.toLowerCase()) ||
      property.country.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="wrapper">
      <div className="flexColCenter paddings innerWidth properties-container">
        <SearchBar filter={filter} setFilter={setFilter} />

        <div className="paddings flexCenter properties">
          {filteredProperties.length === 0 ? (
            <div
              className="flexCenter"
              style={{ height: "40vh", fontSize: "1.2rem", color: "#666" }}
            >
              {filter ? "No favorites match your search" : "No favorites yet"}
            </div>
          ) : (
            filteredProperties.map((card, i) => (
              <PropertyCard card={card} key={i} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Favourites;
