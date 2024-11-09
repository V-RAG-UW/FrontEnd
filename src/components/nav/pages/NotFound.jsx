import React from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";

import stinky from "../../../assets/stinky.png";

export default function NotFound(props) {
  return (
    <div>
      <Container fluid className="h-100 d-flex justify-content-center align-items-center">
        <Row className="w-100 text-center">
          <Col>
            <Card className="border-0">
              <Card.Body>
                <Card.Title className="display-4 mb-4">
                  Yo, this page is lowkey lost.
                </Card.Title>
                <Card.Img
                  src={stinky}
                  alt="Uh oh, stinky, poopy."
                  style={{ width: "50%" }}
                />
                <Card.Text className="lead">
                  Don’t worry, we gotchu. Try hitting that back button or peep the homepage.
                </Card.Text>
                <Link to="/" style={{ textDecoration: "none" }}>
                  <Button variant="primary" size="lg">
                    Go Home
                  </Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
