import * as React from "react";
import {
  Html,
  Body,
  Head,
  Font,
  Preview,
  Heading,
  Row,
  Section,
  Text,
  Button,
} from "@react-email/components";


interface EmailTemplateProps {
  username: string;
  verifyCode: string;
}

export const verificaitonEmail: React.FC<Readonly<EmailTemplateProps>> = ({
  username,
  verifyCode,
}) => (
  <Html lang="en" title="Verify your email">
    <Head>
      <title>Verify your email</title>
      <Font fontFamily="Roboto" fontWeight={400} fallbackFontFamily={"Arial"}/>
    </Head>
    <Body>
      <Section>
        <Row>
          <Heading>Verify your email</Heading>
        </Row>
        <Row>
          <Text>
            Hi {username},
          </Text>
          <Text>
            Your verification code is {verifyCode}
          </Text>
        </Row>
        <Row>
          <Button style={{color:"white", backgroundColor:'blue'}} href={`${process.env.HOST}/verify`}>Verify</Button>
        </Row>
      </Section>
    </Body>
    </Html>
);
