import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import grace from '../../../assets/grace.png';

const LandingPage = (props) => {
  return (
    <div>
      {/* Header Section */}
      <Container fluid className="bg-info text-white text-center py-5" style={{ backgroundColor: "blue" }}> {/* backgroundImage: 'url(https://via.placeholder.com/1200x400)', backgroundSize: 'cover', backgroundPosition: 'center' */}
        <Container>
          <h1 className="display-4">Enhancing Retrieval-Augmented Generation (RAG) with Video Data</h1>
          <p className="lead">
            This project aims to enhance chat agents by incorporating video data, making responses more authentic and contextually accurate.
          </p>
          <Button variant="light" size="lg" href="#overview">
            Learn More
          </Button>
        </Container>
      </Container>

      {/* Project Description Section */}
      <Container id="overview" className="my-5">
        <h2 className="text-center mb-4">Project Overview</h2>
        <Row>
          <Col md={12}>
            <Card className="border-0 shadow-lg">
              <Card.Body>
                <Card.Title>Introduction</Card.Title>
                <Card.Text>
                  This project explores enhancing retrieval-augmented generation (RAG) systems by integrating video data to provide more authentic and contextually rich responses. Traditional text-based retrieval systems often miss crucial non-verbal cues such as facial expressions, emotions, injuries, or clothing, which are vital in contexts like childcare or education. Video data helps address these gaps. While image recognition software could supplement text logs, it risks omitting subtle but potentially important details. Since video-to-text parsing is irreversible, important visual context can be lost.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Pipeline Overview Section */}
      <Container className="my-5">
        <h2 className="text-center mb-4">Proposed Pipeline Overview</h2>
        <Row>
          <Col md={12}>
            <Card className="border-0 shadow-lg">
              <Card.Body>
                <Card.Title>Pipeline Steps</Card.Title>
                <Card.Text>
                  The project follows a multi-step pipeline to process, retrieve, and generate enriched responses. Here's a summary of the main stages:
                </Card.Text>
                <ul>
                  <li><strong>Initial Processing:</strong> The input video is analyzed, generating metadata including dialogue, participant identities, and key events.</li>
                  <li><strong>Querying:</strong> Metadata is queried through semantic full-text search (FTS) or vector search (VS) to retrieve relevant historical events.</li>
                  <li><strong>Re-ranking:</strong> Query results are reranked for relevance.</li>
                  <li><strong>Keyframe Retrieval:</strong> Associated keyframes are identified and retrieved based on the metadata.</li>
                  <li><strong>Secondary Analysis:</strong> The keyframes are processed to regenerate and verify metadata.</li>
                  <li><strong>Metadata Comparison:</strong> New and original metadata are compared for accuracy.</li>
                  <li><strong>LLM Integration:</strong> The metadata is passed to a language model (LLM) to create enriched responses.</li>
                  <li><strong>Response Generation:</strong> The LLM generates contextually accurate responses.</li>
                  <li><strong>Logging:</strong> The metadata is logged for future use and the process repeats.</li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Container className="my-5">
        <Row>
          <Col md={12}>
            <Card className="border-0 shadow-lg">
              <Card.Body>
                <Card.Text>
                  <img src={grace} alt="Proposed Pipeline" className="img-fluid" />
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Call to Action Section */}
      <Container className="text-center my-5">
        <h2>Ready to dive deeper?</h2>
        <p>
          Join us on this exciting journey to revolutionize RAG systems with video data. Contact us for more information or collaboration.
        </p>
        <Button variant="primary" href="mailto:contact@example.com">
          Get in Touch
        </Button>
        <Button style={{marginLeft: "10px"}} variant="primary" href="/chat">
          Try Our Demo
        </Button>
      </Container>

      {/* Footer Section */}
      <footer className="text-center py-3">
        <p>&copy; 2024 V-RAG. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
