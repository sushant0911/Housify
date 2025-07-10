import React, { useState } from "react";
import { PuffLoader } from "react-spinners";
import {
  Card,
  Text,
  Group,
  Avatar,
  Badge,
  Select,
  Stack,
  Alert,
} from "@mantine/core";
import {
  MdLocationPin,
  MdCalendarToday,
  MdPerson,
  MdInfo,
} from "react-icons/md";
import usePropertyVisitors from "../../hooks/usePropertyVisitors";
import useOwnedProperties from "../../hooks/useOwnedProperties";
import "./PropertyVisitors.css";

const PropertyVisitors = () => {
  const {
    data: visitors,
    isError: visitorsError,
    isLoading: visitorsLoading,
  } = usePropertyVisitors();
  const {
    data: ownedProperties,
    isError: propertiesError,
    isLoading: propertiesLoading,
  } = useOwnedProperties();
  const [filterProperty, setFilterProperty] = useState("all");

  const isError = visitorsError || propertiesError;
  const isLoading = visitorsLoading || propertiesLoading;

  // Get unique properties for filter
  const uniqueProperties = visitors
    ? [...new Set(visitors.map((visitor) => visitor.propertyId))].map(
        (propertyId) => {
          const visitor = visitors.find((v) => v.propertyId === propertyId);
          return {
            value: propertyId,
            label: visitor.propertyTitle,
          };
        }
      )
    : [];

  // Filter visitors based on selected property
  const filteredVisitors = visitors
    ? filterProperty === "all"
      ? visitors
      : visitors.filter((visitor) => visitor.propertyId === filterProperty)
    : [];

  if (isError) {
    return (
      <div className="wrapper">
        <div className="flexCenter paddings">
          <span>Error while fetching property visitors</span>
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
      <div className="flexColCenter paddings innerWidth property-visitors-container">
        <div
          className="flexColStart"
          style={{ width: "100%", marginBottom: "2rem" }}
        >
          <h1 className="primaryText" style={{ marginBottom: "0.5rem" }}>
            Property Visitors
          </h1>
          <p className="secondaryText">
            View all users who have booked visits to your properties
          </p>

          {ownedProperties && ownedProperties.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <Badge color="green" size="lg">
                {ownedProperties.length} Property
                {ownedProperties.length !== 1 ? "ies" : "y"} Owned
              </Badge>
            </div>
          )}
        </div>

        {ownedProperties && ownedProperties.length === 0 ? (
          <Alert
            icon={<MdInfo size={16} />}
            title="No Properties Found"
            color="blue"
            style={{ width: "100%", maxWidth: "600px" }}
          >
            You don't have any properties listed yet. When you add properties
            and users book visits to them, the visitors will appear here.
          </Alert>
        ) : visitors && visitors.length > 0 ? (
          <>
            <div className="filter-section">
              <Select
                label="Filter by Property"
                placeholder="Select a property"
                value={filterProperty}
                onChange={setFilterProperty}
                data={[
                  { value: "all", label: "All Properties" },
                  ...uniqueProperties,
                ]}
                style={{ width: "300px" }}
              />
            </div>

            <div className="visitors-grid">
              {filteredVisitors.length > 0 ? (
                filteredVisitors.map((visitor, index) => (
                  <Card
                    key={index}
                    shadow="sm"
                    padding="lg"
                    radius="md"
                    withBorder
                  >
                    <Card.Section>
                      <div className="visitor-header">
                        <Avatar
                          src={visitor.visitorImage}
                          alt={visitor.visitorName || "Visitor"}
                          size="lg"
                          radius="xl"
                        />
                        <div className="visitor-info">
                          <Text fw={500} size="lg">
                            {visitor.visitorName || "Anonymous"}
                          </Text>
                          <Text c="dimmed" size="sm">
                            {visitor.visitorEmail}
                          </Text>
                        </div>
                      </div>
                    </Card.Section>

                    <Stack gap="xs" mt="md">
                      <Group gap="xs">
                        <MdLocationPin size={16} color="#1F3E72" />
                        <Text size="sm" fw={500}>
                          {visitor.propertyTitle}
                        </Text>
                      </Group>

                      <Group gap="xs">
                        <MdLocationPin size={16} color="#666" />
                        <Text size="sm" c="dimmed">
                          {visitor.propertyAddress}, {visitor.propertyCity},{" "}
                          {visitor.propertyCountry}
                        </Text>
                      </Group>

                      <Group gap="xs">
                        <MdCalendarToday size={16} color="#666" />
                        <Text size="sm" c="dimmed">
                          Visit Date: {visitor.visitDate}
                        </Text>
                      </Group>

                      <Badge
                        color="blue"
                        variant="light"
                        style={{ alignSelf: "flex-start" }}
                      >
                        Interested Visitor
                      </Badge>
                    </Stack>
                  </Card>
                ))
              ) : (
                <div
                  className="flexCenter"
                  style={{ height: "40vh", fontSize: "1.2rem", color: "#666" }}
                >
                  {filterProperty === "all"
                    ? "No visitors for your properties yet"
                    : "No visitors for the selected property"}
                </div>
              )}
            </div>
          </>
        ) : (
          <div
            className="flexCenter"
            style={{ height: "40vh", fontSize: "1.2rem", color: "#666" }}
          >
            <div className="flexColCenter" style={{ textAlign: "center" }}>
              <MdPerson
                size={64}
                color="#ccc"
                style={{ marginBottom: "1rem" }}
              />
              <Text size="lg" c="dimmed">
                No visitors yet
              </Text>
              <Text size="sm" c="dimmed" style={{ marginTop: "0.5rem" }}>
                When users book visits to your properties, they will appear here
              </Text>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyVisitors;
