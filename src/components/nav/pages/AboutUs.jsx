import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const AboutUs = () => {
  const teamMembers = [
    {
      name: 'Phong (HarutoHiroki) Do',
      role: 'Front-End Developer',
      description: 'Phong is responsible for the design and functionality of our website, ensuring that it is user-friendly and visually appealing.',
      image: 'https://via.placeholder.com/150',
      homepage: 'https://harutohiroki.com',
    },
    {
      name: 'Wen Jie Lee',
      role: 'Back-End Developer',
      description: 'Lorem ipsum',
      image: 'https://via.placeholder.com/150',
      homepage: '',
    },
    {
      name: 'KK',
      role: 'Back-End Developer',
      description: 'Lorem ipsum',
      image: 'https://via.placeholder.com/150',
      homepage: '',
    },
    {
      name: 'Yeedrag',
      role: 'Back-End Developer',
      description: 'Lorem ipsum',
      image: 'https://via.placeholder.com/150',
      homepage: '',
    },
  ];

  return (
    <Container className="my-5">
      <h1 className="text-center mb-4">Meet Our Team</h1>
      <Row>
        {teamMembers.map((member, index) => (
          <Col key={index} md={6} lg={3} className="mb-4">
            <Card className="text-center">
              <Card.Img variant="top" src={member.image} alt={member.name} />
              <Card.Body>
                <Card.Title>{member.name}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">{member.role}</Card.Subtitle>
                <Card.Text>{member.description}</Card.Text>
                {member.homepage && (
                  <Card.Link href={member.homepage} target="_blank" rel="noopener noreferrer">
                    Visit Homepage
                  </Card.Link>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default AboutUs;
