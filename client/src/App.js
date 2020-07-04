import React from "react";
import { Container, Paper } from "@material-ui/core";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import CountryInfo from "./components/CountryInfo";
import StateInfo from "./components/StateInfo";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Container>
        <div style={{ padding: "10px", marginTop: "80px" }}>
          <Route path="/" exact component={CountryInfo} />
          <Route path="/state/:name" component={StateInfo} />
        </div>
      </Container>
    </Router>
  );
};

export default App;
