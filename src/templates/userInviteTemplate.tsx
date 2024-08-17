export interface UserInviteVars {
  organization_name: string;
  owner_email: string;
  invite_link: string;
  organization_website: string;
}
export const UserInviteTemplate = (body: UserInviteVars) => {
  const organization_name = body.organization_name;
  const owner_email = body.owner_email;
  const invite_link = body.invite_link;
  const organization_website = body.organization_website;
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>You're Invited to Join ${organization_name}</title>
            <style>
              body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
              .email-container {
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
              .email-header {
              text-align: initial;
              margin-bottom: 20px;
            }
              .email-header img {
              max-width: 150px;
            }
              .email-body {
              font-size: 16px;
              color: #333333;
              line-height: 1.6;
            }
              .email-footer {
              margin-top: 20px;
              text-align: center;
              font-size: 14px;
              color: #777777;
            }
              .cta-button {
              display: inline-block;
              padding: 10px 20px;
              font-size: 16px;
              color: #ffffff;
              background-color: #007BFF;
              text-decoration: none;
              border-radius: 5px;
            }
              .cta-button:hover {
              background-color: #0056b3;
            }
              .email-footer a {
              color: #007BFF;
              text-decoration: none;
            }
              .email-footer a:hover {
              text-decoration: underline;
            }
            </style>
      </head>
      <body>
      <div class="email-container">
        <div class="email-header">
<!--          <img src="[Organization Logo URL]" alt="[Organization Name] Logo">-->
            <h3>
              Join ${organization_name} in Intracom
            </h3>
        </div>
        <div class="email-body">
          <p>${organization_name} (${owner_email}) has invited you to join the Intracom workspace ${organization_name}.</p>
          <p style="text-align: initial; color: white;">
            <a href="${invite_link}" class="cta-button">Accept Invitation</a>
          </p>
        </div>
        <div class="email-footer">
          <p>&copy; ${year} Intracom. All rights reserved.</p>
          <p><a href="${organization_website}">Visit our website</a></p>
        </div>
      </div>
      </body>
      </html> `;
};
