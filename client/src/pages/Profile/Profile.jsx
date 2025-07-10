import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Avatar,
  Container,
  Title,
  Paper,
  Group,
  Badge,
  Button,
  Stack,
  Grid,
  Divider,
  ActionIcon,
  Tooltip,
  Select,
  Alert,
  TextInput,
  Text,
} from "@mantine/core";
import { PuffLoader } from "react-spinners";
import { useQuery } from "react-query";
import useOwnedProperties from "../../hooks/useOwnedProperties";
import useFavourites from "../../hooks/useFavourites";
import useBookings from "../../hooks/useBookings";
import usePropertyVisitors from "../../hooks/usePropertyVisitors";
import { getAllProperties } from "../../utils/api";
import PropertyCard from "../../components/PropertyCard/PropertyCard";
import VisitorManagement from "../../components/VisitorManagement/VisitorManagement";
import "./Profile.css";
import SearchBar from "../../components/SearchBar/SearchBar";
import {
  MdEmail,
  MdHome,
  MdFavorite,
  MdBookmark,
  MdPeople,
  MdLocationPin,
  MdCalendarToday,
  MdAdd,
  MdInfo,
} from "react-icons/md";

const Profile = () => {
  const { user } = useAuth0();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("properties");
  const [searchFilter, setSearchFilter] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [propertiesSearchFilter, setPropertiesSearchFilter] = useState("");

  // Fetch user data
  const { data: ownedProperties, isLoading: propertiesLoading } =
    useOwnedProperties();
  const { data: favouriteIds, isLoading: favouritesLoading } = useFavourites();
  const { data: bookings, isLoading: bookingsLoading } = useBookings();
  const { data: visitors, isLoading: visitorsLoading } = usePropertyVisitors();

  // Add at the top of the Profile component
  const [visitorsState, setVisitorsState] = useState(visitors || []);

  useEffect(() => {
    setVisitorsState(visitors || []);
  }, [visitors]);

  const handleVisitorUpdate = (visitorEmail, propertyId, action) => {
    setVisitorsState((prev) => {
      if (action === "discard") {
        return prev.filter(
          (v) =>
            !(v.visitorEmail === visitorEmail && v.propertyId === propertyId)
        );
      }
      if (action === "accept") {
        return prev.map((v) =>
          v.visitorEmail === visitorEmail && v.propertyId === propertyId
            ? { ...v, status: "confirmed" }
            : v
        );
      }
      return prev;
    });
  };

  // Fetch all properties to get full data for favorites
  const { data: allProperties, isLoading: allPropertiesLoading } = useQuery({
    queryKey: "allProperties",
    queryFn: getAllProperties,
    enabled: !!favouriteIds,
  });

  const isLoading =
    propertiesLoading ||
    favouritesLoading ||
    bookingsLoading ||
    visitorsLoading ||
    allPropertiesLoading;

  // Get full property data for favorites
  const favourites = React.useMemo(() => {
    if (!favouriteIds || !allProperties) return [];
    return allProperties.filter((property) =>
      favouriteIds.includes(property.id)
    );
  }, [favouriteIds, allProperties]);

  // Filter data based on search
  const filterData = (data, searchTerm) => {
    if (!data || !searchTerm) return data;
    return data.filter((item) => {
      // Handle bookings structure
      if (item.property) {
        const property = item.property;
        return (
          property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.address?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      // Handle direct property structure (for favorites and owned properties)
      else {
        return (
          item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.address?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
    });
  };

  // Filter visitors by property
  const getUniqueProperties = () => {
    if (!visitors) return [];
    return [...new Set(visitors.map((visitor) => visitor.propertyId))].map(
      (propertyId) => {
        const visitor = visitors.find((v) => v.propertyId === propertyId);
        return {
          value: propertyId,
          label: visitor.propertyTitle,
        };
      }
    );
  };

  const filteredVisitors = visitors
    ? propertyFilter === "all"
      ? visitors
      : visitors.filter((visitor) => visitor.propertyId === propertyFilter)
    : [];

  const filteredFavourites = filterData(favourites, searchFilter);
  const filteredBookings = filterData(bookings, searchFilter);
  const filteredOwnedProperties = filterData(
    ownedProperties,
    propertiesSearchFilter
  );

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
      <Container size="lg" className="profile-container">
        {/* Profile Header */}
        <Card className="profile-header" shadow="sm" padding="xl" radius="md">
          <div className="profile-header-content">
            <div className="profile-info">
              <Avatar
                src={user?.picture}
                alt={user?.name}
                size={120}
                radius={120}
                className="profile-avatar"
              />
              <div className="profile-details">
                <h1 className="profile-name">{user?.name}</h1>
                <div className="profile-email">
                  <Group gap="xs" style={{ color: "#fff" }}>
                    <MdEmail size={24} />
                    <Text size="lg" c="dimmed">
                      <a href={`mailto:${user?.email}`}>{user?.email}</a>
                    </Text>
                  </Group>
                </div>
                <Group gap="md" className="profile-stats">
                  <Badge
                    color="blue"
                    size="lg"
                    variant="light"
                    leftSection={<MdHome size={14} />}
                  >
                    {ownedProperties?.length || 0} Properties
                  </Badge>
                  <Badge
                    color="red"
                    size="lg"
                    variant="light"
                    leftSection={<MdFavorite size={14} />}
                  >
                    {favourites?.length || 0} Favorites
                  </Badge>
                  <Badge
                    color="green"
                    size="lg"
                    variant="light"
                    leftSection={<MdBookmark size={14} />}
                  >
                    {bookings?.length || 0} Bookings
                  </Badge>
                </Group>
              </div>
            </div>
          </div>
        </Card>

        {/* Navigation Tabs */}
        <Paper className="profile-tabs" shadow="xs" p="md">
          <Group gap="md" className="tab-group">
            <Button
              variant={activeTab === "properties" ? "filled" : "subtle"}
              leftSection={<MdHome size={16} />}
              onClick={() => setActiveTab("properties")}
              className={`tab-button${
                activeTab === "properties" ? " active" : ""
              }`}
            >
              My Properties ({ownedProperties?.length || 0})
            </Button>
            <Button
              variant={activeTab === "favourites" ? "filled" : "subtle"}
              leftSection={<MdFavorite size={16} />}
              onClick={() => setActiveTab("favourites")}
              className={`tab-button${
                activeTab === "favourites" ? " active" : ""
              }`}
            >
              Favorites ({favourites?.length || 0})
            </Button>
            <Button
              variant={activeTab === "bookings" ? "filled" : "subtle"}
              leftSection={<MdBookmark size={16} />}
              onClick={() => setActiveTab("bookings")}
              className={`tab-button${
                activeTab === "bookings" ? " active" : ""
              }`}
            >
              My Bookings ({bookings?.length || 0})
            </Button>
            <Button
              variant={activeTab === "visitors" ? "filled" : "subtle"}
              leftSection={<MdPeople size={16} />}
              onClick={() => setActiveTab("visitors")}
              className={`tab-button${
                activeTab === "visitors" ? " active" : ""
              }`}
            >
              Property Visitors ({visitors?.length || 0})
            </Button>
          </Group>
        </Paper>

        {/* Content Sections */}
        <div className="profile-content">
          {activeTab === "properties" && (
            <div className="tab-content">
              <div className="content-header">
                <div className="header-content">
                  <div className="header-text">
                    <Title order={2}>My Properties</Title>
                    <Text c="dimmed">Manage your listed properties</Text>
                  </div>
                  <div className="search-section">
                    <SearchBar
                      filter={propertiesSearchFilter}
                      setFilter={setPropertiesSearchFilter}
                    />
                  </div>
                </div>
              </div>

              {ownedProperties && ownedProperties.length > 0 ? (
                <>
                  <div className="properties-grid">
                    {filteredOwnedProperties.map((property, index) => (
                      <PropertyCard
                        key={property.id || index}
                        card={property}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <Card className="empty-state" shadow="sm" padding="xl">
                  <div className="empty-state-content">
                    <MdHome size={64} color="#ccc" />
                    <Title order={3} c="dimmed">
                      {propertiesSearchFilter
                        ? "No properties match your search"
                        : "No Properties Listed"}
                    </Title>
                    <Text c="dimmed" ta="center">
                      {propertiesSearchFilter
                        ? "Try adjusting your search terms"
                        : "Start by adding your first property to the marketplace"}
                    </Text>
                    {!propertiesSearchFilter && (
                      <Button
                        leftSection={<MdAdd size={16} />}
                        onClick={() => navigate("/my-properties")}
                        style={{ marginTop: "1rem" }}
                      >
                        Add Your First Property
                      </Button>
                    )}
                  </div>
                </Card>
              )}
            </div>
          )}

          {activeTab === "favourites" && (
            <div className="tab-content">
              <div className="content-header">
                <div className="header-content">
                  <div className="header-text">
                    <Title order={2}>My Favorites</Title>
                    <Text c="dimmed">Properties you've saved</Text>
                  </div>
                  <div className="search-section">
                    <SearchBar
                      filter={searchFilter}
                      setFilter={setSearchFilter}
                    />
                  </div>
                </div>
              </div>

              {favourites && favourites.length > 0 ? (
                <>
                  <div className="properties-grid">
                    {filteredFavourites.map((property, index) => (
                      <PropertyCard
                        key={property.id || index}
                        card={property}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <Card className="empty-state" shadow="sm" padding="xl">
                  <div className="empty-state-content">
                    <MdFavorite size={64} color="#ccc" />
                    <Title order={3} c="dimmed">
                      {searchFilter
                        ? "No favorites match your search"
                        : "No Favorites Yet"}
                    </Title>
                    <Text c="dimmed" ta="center">
                      {searchFilter
                        ? "Try adjusting your search terms"
                        : "Start exploring properties and save your favorites"}
                    </Text>
                    {!searchFilter && (
                      <Button
                        onClick={() => navigate("/properties")}
                        style={{ marginTop: "1rem" }}
                      >
                        Browse Properties
                      </Button>
                    )}
                  </div>
                </Card>
              )}
            </div>
          )}

          {activeTab === "bookings" && (
            <div className="tab-content">
              <div className="content-header">
                <div className="bookings-header-content">
                  <div className="header-text">
                    <Title order={2}>My Bookings</Title>
                    <Text c="dimmed">Your scheduled property visits</Text>
                  </div>
                  <div className="search-section">
                    <SearchBar
                      filter={searchFilter}
                      setFilter={setSearchFilter}
                    />
                  </div>
                </div>
              </div>

              {bookings && bookings.length > 0 ? (
                <>
                  <div className="properties-grid">
                    {filteredBookings
                      .filter((booking) => booking.property)
                      .map((booking, index) => (
                        <PropertyCard
                          key={booking.property.id || index}
                          card={booking.property}
                          bookingStatus={booking.status}
                          onClick={() =>
                            navigate(`/property/${booking.property.id}`)
                          }
                          style={{ cursor: "pointer" }}
                        />
                      ))}
                  </div>
                </>
              ) : (
                <Card className="empty-state" shadow="sm" padding="xl">
                  <div className="empty-state-content">
                    <MdBookmark size={64} color="#ccc" />
                    <Title order={3} c="dimmed">
                      {searchFilter
                        ? "No bookings match your search"
                        : "No Bookings Yet"}
                    </Title>
                    <Text c="dimmed" ta="center">
                      {searchFilter
                        ? "Try adjusting your search terms"
                        : "Start booking visits to properties you're interested in"}
                    </Text>
                    {!searchFilter && (
                      <Button
                        onClick={() => navigate("/properties")}
                        style={{ marginTop: "1rem" }}
                      >
                        Browse Properties
                      </Button>
                    )}
                  </div>
                </Card>
              )}
            </div>
          )}

          {activeTab === "visitors" && (
            <div className="tab-content">
              <div className="content-header">
                <div className="visitors-header-content">
                  <div className="visitors-header-text">
                    <Title order={2}>Property Visitors</Title>
                    <Text c="dimmed">People interested in your properties</Text>
                  </div>
                  <div className="filter-section">
                    <Select
                      label="Filter by Property"
                      placeholder="Select a property"
                      value={propertyFilter}
                      onChange={setPropertyFilter}
                      data={[
                        { value: "all", label: "All Properties" },
                        ...getUniqueProperties(),
                      ]}
                      style={{ width: "300px" }}
                    />
                  </div>
                </div>
              </div>
              {/* Wrap all branches in a fragment to avoid adjacent JSX error */}
              <>
                {ownedProperties && ownedProperties.length === 0 ? (
                  <Alert
                    icon={<MdInfo size={16} />}
                    title="No Properties Found"
                    color="blue"
                    style={{
                      width: "100%",
                      maxWidth: "600px",
                      margin: "0 auto",
                    }}
                  >
                    You don't have any properties listed yet. When you add
                    properties and users book visits to them, the visitors will
                    appear here.
                  </Alert>
                ) : visitorsState && visitorsState.length > 0 ? (
                  <div className="visitors-grid">
                    {visitorsState
                      .filter(
                        (visitor) =>
                          propertyFilter === "all" ||
                          visitor.propertyId === propertyFilter
                      )
                      .map((visitor, index) => (
                        <Card
                          key={index}
                          shadow="sm"
                          padding="lg"
                          radius="md"
                          withBorder
                          className="visitor-card"
                          style={{ position: "relative" }}
                        >
                          <VisitorManagement
                            visitor={visitor}
                            onVisitorUpdate={handleVisitorUpdate}
                          />
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
                          <Stack gap="xs" mt="md">
                            <div className="flexColStart visitor-details-container">
                              <Group gap="xs">
                                <MdLocationPin size={16} color="#1F3E72" />
                                <Text size="sm" fw={500}>
                                  {visitor.propertyTitle}
                                </Text>
                              </Group>
                              <Group gap="xs">
                                <MdLocationPin size={16} color="#666" />
                                <Text size="sm" c="dimmed">
                                  {visitor.propertyAddress},{" "}
                                  {visitor.propertyCity},{" "}
                                  {visitor.propertyCountry}
                                </Text>
                              </Group>
                              <Group gap="xs">
                                <MdCalendarToday size={16} color="#666" />
                                <Text size="sm" c="dimmed">
                                  Visit Date: {visitor.visitDate}
                                </Text>
                              </Group>
                            </div>
                            {/* Status Badge Logic */}
                            {(() => {
                              const now = new Date();
                              const visitDate = visitor.visitDate
                                ? new Date(visitor.visitDate)
                                : null;
                              if (visitDate && visitDate < now) {
                                return null; // Past visit, no badge
                              }
                              if (visitor.status === "confirmed") {
                                return (
                                  <Badge
                                    color="green"
                                    variant="light"
                                    style={{ alignSelf: "flex-start" }}
                                  >
                                    Accepted
                                  </Badge>
                                );
                              }
                              return (
                                <Badge
                                  color="blue"
                                  variant="light"
                                  style={{ alignSelf: "flex-start" }}
                                >
                                  Interested Visitor
                                </Badge>
                              );
                            })()}
                          </Stack>
                        </Card>
                      ))}
                  </div>
                ) : (
                  <Card className="empty-state" shadow="sm" padding="xl">
                    <div className="empty-state-content">
                      <MdPeople size={64} color="#ccc" />
                      <Title order={3} c="dimmed">
                        No Visitors Yet
                      </Title>
                      <Text c="dimmed" ta="center">
                        When users book visits to your properties, they will
                        appear here
                      </Text>
                    </div>
                  </Card>
                )}
              </>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default Profile;
