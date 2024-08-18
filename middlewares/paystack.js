// List of Paystack IP addresses
const PAYSTACK_IPS = ["52.31.139.75", "52.49.173.169", "52.214.14.220"];

// IP Whitelisting Middleware
export const ipWhitelistingMiddleware = (req, res, next) => {
  const clientIp =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  if (PAYSTACK_IPS.includes(clientIp)) {
    return next();
  } else {
    return res.status(403).send("Forbidden");
  }
};
