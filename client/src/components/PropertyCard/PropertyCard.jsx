import React, { useContext } from "react";
import "./PropertyCard.css";
import { truncate } from "lodash";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Badge } from "@mantine/core";
import Heart from "../Heart/Heart";
import PropertyManagement from "../PropertyManagement/PropertyManagement";

const PropertyCard = ({ card }) => {
  const navigate = useNavigate();
  const { user } = useAuth0();

  const isOwned = card?.userEmail === user?.email;

  return (
    <div
      className="flexColStart r-card"
      onClick={() => navigate(`../properties/${card.id}`)}
    >
      {/* Only show heart button for non-owned properties */}
      {!isOwned && <Heart id={card?.id} />}

      {/* Property Management Menu - only show for owned properties */}
      {isOwned && (
        <div onClick={(e) => e.stopPropagation()}>
          <PropertyManagement property={card} />
        </div>
      )}

      {isOwned && (
        <Badge
          color="green"
          variant="filled"
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            zIndex: 10,
            fontSize: "0.7rem",
            fontWeight: "600",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        >
          Owned
        </Badge>
      )}

      <img src={card.image} alt="home" />
      <span className="secondaryText r-price">
        <span style={{ color: "orange" }}>$</span>
        <span>{card.price}</span>
      </span>
      <span className="primaryText">
        {truncate(card.title, { length: 15 })}
      </span>
      <span className="secondaryText">
        {truncate(card.description, { length: 80 })}
      </span>
    </div>
  );
};

export default PropertyCard;
