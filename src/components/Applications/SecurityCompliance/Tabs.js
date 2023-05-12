import React from "react";
import { Tab, Row, Col, Nav } from "react-bootstrap";
import Events from "./Events";
import _ from "underscore";
import DataShared from "./DataShared";
import ComplianceTab from "./ComplianceTab";
import SecurityProbes from "./SecurityProbes";

export function Tabs(props) {

  const TabsList = [
    {
      uniqueKey: "events",
      title: "Events",
      component: (
        <Events application={props.application} />
      ),
    },
    {
      uniqueKey: "dataShared",
      title: "Data Shared",
      component: <DataShared application={props.application} />,
    },
    {
      title: "Compliance",
      component: <ComplianceTab application={props.application} />,
    },
    {
      title: "Security Probes",
      component: <SecurityProbes application={props.application} />
    },
  ];

  return (
    <Tab.Container
      id="left-tabs-example"
      defaultActiveKey={_.first(TabsList).title.replace(" ", "_").toLocaleLowerCase()}
    >
      <div className="d-flex justify-content-center mt-4">
        <Nav className="security__nav__tabs__wrapper mt-3">
          {TabsList.map((item, index) => (
            <Nav.Item className="security__nav__item" key={index}>
              <Nav.Link style={{ paddingTop: "6px", paddingButtom: "6px" }} eventKey={item.title.replace(" ", "_").toLocaleLowerCase()}>
                {item.title}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>
      </div>
      <Row>
        <Tab.Content className="security__tabs__wrapper">
          {TabsList.map(item => (
            <Tab.Pane className="security__tabs__content" eventKey={item.title.replace(" ", "_").toLocaleLowerCase()}>
              {item.component}
            </Tab.Pane>))}
        </Tab.Content>
      </Row>
    </Tab.Container>)
}
