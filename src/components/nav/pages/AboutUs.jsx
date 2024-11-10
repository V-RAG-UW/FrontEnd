import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

// profile images
import haruto from '../../../assets/ugly_ass.jpg';
import kuroma from '../../../assets/look_at_this_guy.jpg';
import lee from '../../../assets/pepelaff.png';
import andy from '../../../assets/yeeyee.png'

const AboutUs = () => {
  const teamMembers = [
    {
      name: 'Phong (HarutoHiroki) Do',
      role: 'Front-End Developer',
      description: 'Phong is responsible for the design and functionality of our website, ensuring that it is user-friendly and visually appealing.',
      image: haruto,
      homepage: 'https://harutohiroki.com',
    },
    {
      name: 'KK (Kuroma) Thuwajit',
      role: 'AI Engineer (Chat Completion)',
      description: 'KK leads the development of our AI completion agent powered by GPT and LLaMA models, expertly crafted to deliver smooth, coherent, and engaging conversations with our service.',
      image: kuroma,
      homepage: 'https://kuroma.dev/',
    },
    {
      name: 'Andy (Yeedrag) Wang',
      role: 'AI Engineer (Recognition Engine)',
      description: 'Andy contributed to developing real-time video summarization by creating video descriptions and audio transcriptions using LLaVA and Whisper. This work was essential for processing and generating insights from video content efficiently.',
      image: andy,
      homepage: 'https://yeedrag.github.io',
    },
    {
      name: 'Wen Jie Lee',
      role: 'VideoRAG Database Engineer',
      description: 'Wen Jie is responsible for managing and optimizing the VideoRAG database, ensuring efficient storage, retrieval, and analysis of video-related data.',
      image: lee,
      homepage: 'https://www.wenjielee.tech/about',
    },
  ];

  return (
    <Container className="my-5">
      <h1 className="text-center mb-4">Meet Our Team</h1>
      <Row>
        {teamMembers.map((member, index) => (
          <Col key={index} md={6} lg={3} className="mb-4">
            <Card className="text-center">
              <Card.Img variant="top" src={member.image} alt={member.name} style={{}} />
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
