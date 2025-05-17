import React from "react";
import styled from "styled-components";

const HealthMeterWrapper = styled.div`
  background: #eee;
  border: 1px solid #aaa;
  height: 15px;
`;

const HealthMeterInner = styled.div`
  background: green;
  height: 100%;
  transition: 0.5s ease all;
`;

export default function HealthMeter() {
  return (
    <HealthMeterWrapper>
      <HealthMeterInner></HealthMeterInner>
    </HealthMeterWrapper>
  );
}
