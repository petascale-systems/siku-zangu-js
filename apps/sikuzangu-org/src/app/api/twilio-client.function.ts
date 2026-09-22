import twilio from 'twilio';
import {APIError} from '@siku-zangu/core';

/**
 * Lazily-built Twilio client.
 *
 * Both SMS routes used to construct this at module scope with non-null
 * assertions on the env vars. The Twilio SDK throws when the account SID is
 * missing or is not an `AC…` value, so importing either route without Twilio
 * configured blew up at module evaluation rather than at the point of use.
 *
 * Building on first use keeps the app serving with no Twilio config, and turns
 * a missing setting into a normal 503 on the two routes that actually need it.
 */
let client: twilio.Twilio | null = null;

export function getTwilioClient(): twilio.Twilio {
  if (client) return client;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw {
      status: 503,
      message: 'SMS is not configured on this server',
    } as APIError;
  }

  client = twilio(accountSid, authToken);
  return client;
}

/** The Verify service the SMS routes send through. */
export function getVerifyServiceSid(): string {
  const sid = process.env.TWILIO_VERIFY_SERVICE_SID;
  if (!sid) {
    throw {
      status: 503,
      message: 'SMS is not configured on this server',
    } as APIError;
  }
  return sid;
}
