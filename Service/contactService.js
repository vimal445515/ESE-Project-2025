import { transport } from "../Config/EmailConfig.js";
const sendEmail = async (userEmail, subject, name, message) => {
  const data = ` <h3>New Contact Message</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${userEmail}</p>
      <p><strong>Message:</strong><br>${message}</p>`;
  try {
    await transport.sendMail({
      from: "eseproject2025@gmail.com",
      to: "eseproject2025@gmail.com",
      subject: subject,
      replyTo: `${name} <${userEmail}>`,
      html: data,
    });
  } catch (error) {
    console.log("error from admin otp send", error.message);
    return false;
  }

  console.log("otp generated");
  return true;
};

export default sendEmail;
