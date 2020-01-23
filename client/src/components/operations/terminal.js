import React from "react";
import Chart from "react-apexcharts";
import Select from "react-select";

import {
  Container,
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  CardText,
  Button,
  CardFooter
} from "reactstrap";

const terminal = () => {
  const chart = {
    options: {
      chart: {
        id: "basic-bar"
      },
      xaxis: {
        categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999]
      }
    },
    series: [
      {
        name: "series-1",
        data: [30, 40, 45, 50, 49, 60, 70, 91]
      }
    ],
    responsive: [
      {
        breakpoint: undefined,
        options: {}
      }
    ]
  };

  return (
    <Container className="themed-container" fluid={true}>
      <Row xs="1" md="2" className="operations-charts">
        <Col>
          <Chart
            options={chart.options}
            series={chart.series}
            type="bar"
            width="500"
          />
        </Col>
        <Col>
          <Chart
            options={chart.options}
            series={chart.series}
            type="line"
            width="500"
          />
        </Col>
      </Row>
      <Row className="operations-charts">
        <Col>
          <Card>
            <CardHeader tag="h3">Featured</CardHeader>
            <CardBody>
              <CardTitle>Special Title Treatment</CardTitle>
              <CardText>
                With supporting text below as a natural lead-in to additional
                content.
              </CardText>
              <Button>Go somewhere</Button>
            </CardBody>
            <CardFooter className="text-muted">Footer</CardFooter>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default terminal;
