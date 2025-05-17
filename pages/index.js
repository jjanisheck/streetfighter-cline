import React, { useState } from "react";
import Head from "next/head";
import styled from "styled-components";
import HealthMeter from "../src/components/HealthMeter";
import Button from "../src/components/Button";

const AppWrapper = styled.div`
  max-width: 920px;
  margin: 0 auto;
  font-family: Arial, Helvetica, sans-serif;
`;

const AppHeading = styled.h1`
  text-align: center;
`;

const Row = styled.div`
  display: flex;
  margin: 40px auto;
`;

const Column = styled.div`
  flex: 1 0 50%;
  padding: 0 10px;
`;

export default function StreetFighter() {
  // When using React's `useState` hook, the first value in the array is always the state value.
  // The second value in the array is always the *function* that updates the state value.
  // You can give `useState` an initial value of: [], {}, null, true, false, integers
  const [playerHealth, setPlayerHealth] = useState(100);
  const [opponentHealth, setOpponentHealth] = useState(100);
  const [messageLog, updateMessageLog] = useState([]);

  const getRandomDamageAmount = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const regularAttack = () => {
    // Regular Attack does random damage between 5 and 9
    const damage = getRandomDamageAmount(5, 9);

    setOpponentHealth(opponentHealth - damage);

    const attackMessage = `Player used Regular Attack and did ${damage} damage.`;

    // Here, we use the ES6 "Spread" operator to include all the previous log messages, and then also
    // insert the new one into the `messageLog` state array
    updateMessageLog([...messageLog, attackMessage]);

    // Call the opponentAttack function - every time you hit it, it hits back!
    opponentAttack();
  };

  const specialAttack = () => {
    // Special Attack does random damage between 9 and 12
    const damage = getRandomDamageAmount(9, 12);

    // Build out the specialAttack function:
    // - update opponentHealth using setOpponentHealth
    // - update messageLog using updateMessageLog
    // - call the opponentAttack function
  };

  const opponentAttack = () => {
    // Opponent Attack does random damage between 5 and 12
    const damage = getRandomDamageAmount(5, 12);

    // Build out the opponentAttack function:
    // - update playerHealth using setPlayerHealth
    // - update messageLog using updateMessageLog
  };

  return (
    <>
      <Head>
        <title>Street Fighter!</title>
      </Head>

      <AppWrapper>
        <AppHeading>Street Fighter</AppHeading>

        <Row>
          <Column>
            <span>Player 1</span>
            <HealthMeter />
            {playerHealth}
          </Column>

          <Column>
            <span>Opponent</span>
            <HealthMeter />
            {opponentHealth}
          </Column>
        </Row>

        <Row>
          <Column>
            <Button buttonColor="green" onClick={regularAttack}></Button>
            {
              // Add the "Special Attack" button here: it should be red and call the specialAttack function
            }
          </Column>

          <Column>
            <h3>Game Log</h3>
            {messageLog.map(msg => (
              <div>{msg}</div>
            ))}
          </Column>
        </Row>
      </AppWrapper>
    </>
  );
}
