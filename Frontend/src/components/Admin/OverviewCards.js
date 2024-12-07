import React from "react";
import { Row, Col, Card } from "react-bootstrap";

const darkModeColors = {
  text: "#e0e0e0",
  border: "#444",
  cardBackground: "#18283e",
};

const lightModeColors = {
  text: "#000",
  border: "#ddd",
  cardBackground: "#ffffff",
};

function OverviewCards({ darkMode }) {
  const currentColors = darkMode ? darkModeColors : lightModeColors;

  return (
    <Row className="mt-4">
      <Col md={3}>
        <Card
          className="p-3"
          style={{
            backgroundColor: currentColors.cardBackground,
            border: `1px solid ${currentColors.border}`,
            color: currentColors.text,
          }}
        >
          <h5>Total Sales</h5>
          <h3>$12,345</h3>
        </Card>
      </Col>
      <Col md={3}>
        <Card
          className="p-3"
          style={{
            backgroundColor: currentColors.cardBackground,
            border: `1px solid ${currentColors.border}`,
            color: currentColors.text,
          }}
        >
          <h5>New Users</h5>
          <h3>1,234</h3>
        </Card>
      </Col>
      <Col md={3}>
        <Card
          className="p-3"
          style={{
            backgroundColor: currentColors.cardBackground,
            border: `1px solid ${currentColors.border}`,
            color: currentColors.text,
          }}
        >
          <h5>Total Products</h5>
          <h3>567</h3>
        </Card>
      </Col>
      <Col md={3}>
        <Card
          className="p-3"
          style={{
            backgroundColor: currentColors.cardBackground,
            border: `1px solid ${currentColors.border}`,
            color: currentColors.text,
          }}
        >
          <h5>Conversion Rate</h5>
          <h3>12.5%</h3>
        </Card>
      </Col>
    </Row>
  );
}

export default OverviewCards;
