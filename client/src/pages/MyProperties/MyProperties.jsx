import React, { useState } from "react";
import { PuffLoader } from "react-spinners";
import { Card, Text, Group, Badge, Button, Stack, Alert } from "@mantine/core";
import {
  MdLocationPin,
  MdMeetingRoom,
  MdShower,
  MdDirectionsCar,
  MdAdd,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import useOwnedProperties from "../../hooks/useOwnedProperties";
import PropertyCard from "../../components/PropertyCard/PropertyCard";
import "./MyProperties.css";

const MyProperties = () => {
  const {
    data: properties,
    isError,
    isLoading,
    refetch,
  } = useOwnedProperties();
  const [filter, setFilter] = useState("");
  const navigate = useNavigate();

  // Filter properties based on search
  const filteredProperties = properties
    ? properties.filter(
        (property) =>
          property.title.toLowerCase().includes(filter.toLowerCase()) ||
          property.city.toLowerCase().includes(filter.toLowerCase()) ||
          property.country.toLowerCase().includes(filter.toLowerCase())
      )
    : [];

  if (isError) {
    return (
      <div className="wrapper">
        <div className="flexCenter paddings">
          <span>Error while fetching your properties</span>
        </div>
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
      <div className="flexColCenter paddings innerWidth my-properties-container">
        <div
          className="flexColStart"
          style={{ width: "100%", marginBottom: "2rem" }}
        >
          <div
            className="flexBetween"
            style={{ width: "100%", marginBottom: "1rem" }}
          >
            <div>
              <h1 className="primaryText" style={{ marginBottom: "0.5rem" }}>
                My Properties
              </h1>
              <p className="secondaryText">Manage all your listed properties</p>
            </div>
            <Button
              leftSection={<MdAdd size={16} />}
              onClick={() => navigate("/add-property")}
              size="md"
              className="add-property-btn"
            >
              Add New Property
            </Button>
          </div>

          {properties && properties.length > 0 && (
            <Badge color="blue" size="lg">
              {properties.length} Property
              {properties.length !== 1 ? "ies" : "y"} Listed
            </Badge>
          )}
        </div>

        {properties && properties.length === 0 ? (
          <div
            className="flexCenter"
            style={{ height: "40vh", fontSize: "1.2rem", color: "#666" }}
          >
            <div className="flexColCenter" style={{ textAlign: "center" }}>
              <MdAdd size={64} color="#ccc" style={{ marginBottom: "1rem" }} />
              <Text size="lg" c="dimmed">
                No properties listed yet
              </Text>
              <Text size="sm" c="dimmed" style={{ marginTop: "0.5rem" }}>
                Start by adding your first property to the marketplace
              </Text>
              <Button
                leftSection={<MdAdd size={16} />}
                onClick={() => navigate("/add-property")}
                style={{ marginTop: "1rem" }}
                size="md"
              >
                Add Your First Property
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Search/Filter Section */}
            <div className="search-section">
              <input
                type="text"
                placeholder="Search your properties..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="search-input"
              />
            </div>

            {/* Properties Grid */}
            <div className="properties-grid">
              {filteredProperties.length > 0 ? (
                filteredProperties.map((property, index) => (
                  <PropertyCard key={property.id || index} card={property} />
                ))
              ) : (
                <div
                  className="flexCenter"
                  style={{ height: "40vh", fontSize: "1.2rem", color: "#666" }}
                >
                  {filter
                    ? "No properties match your search"
                    : "No properties available"}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyProperties;
