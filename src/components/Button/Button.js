import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const Button = styled.div`
  width: 80px;
  height: 80px;
  border: 5px solid ${props => props.color};
  border-radius: 50%;
  background: linear-gradient(
    to bottom right,
    ${props => `dark${props.color}`},
    ${props => props.color}
  );

  cursor: pointer;
  outline: none;
`;

export default function AttackButton({ buttonColor, onClick }) {
  return <Button color={buttonColor} onClick={onClick}></Button>;
}

AttackButton.propTypes = {
  buttonColor: PropTypes.string,
  onClick: PropTypes.func
};
