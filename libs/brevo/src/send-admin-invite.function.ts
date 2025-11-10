import * as handlebars from "handlebars";
import {BREVO_TX_EMAIL_API} from "./create-brevo-email-api.function";
import {BREVO_CONFIG} from "./create-brevo-config.function";

export type AdminInviteOptions = {
    toName?: string;
    toEmail?: string;
    link?: string;
}

export async function sendAdminInvite(options: AdminInviteOptions) {
    return BREVO_TX_EMAIL_API.sendTransacEmail({
        sender: {email: BREVO_CONFIG.senderEmail, name: BREVO_CONFIG.senderFullName},
        to: [{email: options.toEmail ?? '', name: options.toName}],
        subject: 'Welcome to Siku Zangu',
        htmlContent: _ADMIN_INVITE_TEMPLATE(options),
        headers: {contentType: 'text/html; charset=utf-8'},
    })
}

const _ADMIN_INVITE_TEMPLATE = handlebars.compile(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 40px 0;">
                <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 30px; text-align: center; background-color: #FD5A7E; border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Siku Zangu</h1>
                        </td>
                    </tr>
                    <!-- Content -->
                <tr>
                    <td style="padding: 40px;">
                        <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.5;">
                            Hi <strong>{{toName}}</strong>,
                        </p>
                        
                        <p style="margin: 0 0 30px; color: #666666; font-size: 15px; line-height: 1.6;">
                            You have been invited to join Siku Zangu.
                        </p>
                        
                        <p style="margin: 0 0 30px; color: #666666; font-size: 15px; line-height: 1.6;">
                            Click the button below to set up your password and activate your account:
                        </p>
                        
                        <!-- Button -->
                        <table role="presentation" style="margin: 0 0 30px;">
                            <tr>
                                <td style="text-align: center;">
                                    <a href="{{link}}" target="_blank" style="display: inline-block; padding: 14px 36px; background-color: #FD5A7E; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">Set Up Password</a>
                                </td>
                            </tr>
                        </table>
                        
                        <p style="margin: 0 0 30px; color: #999999; font-size: 13px; line-height: 1.5;">
                            This link expires in 2 weeks.
                        </p>
                        
                        <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.5;">
                            Questions? Contact us at <a href="mailto:support@sikuzangu.com" style="color: #FD5A7E; text-decoration: none;">support@sikuzangu.org</a>
                        </p>
                    </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                    <td style="padding: 30px 40px; background-color: #f9f9f9; border-radius: 0 0 8px 8px; text-align: center;">
                        <p style="margin: 0; color: #999999; font-size: 13px; line-height: 1.5;">
                            Best regards,<br>
                            The Siku Zangu Team
                        </p>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
    </table>
</body>
</html>`)