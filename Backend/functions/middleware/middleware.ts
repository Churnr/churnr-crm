import * as admin from "firebase-admin";

/**
 * Firebase auth id token validation middleware
 * gives status 403 in response object if unauthorized
 * @param {any}req Request object
 * @param {any}res Response object
 * @param {any}next Next object
 * @return {any} nothing
 */
export async function validateFirebaseIdToken(req:any, res:any, next:any) {
  console.log("Check if request is authorized with Firebase ID token");

  if ((!req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer ")) &&
        !(req.cookies && req.cookies.__session)) {
    console.error("No Firebase ID token was passed"+
    "as a Bearer token in the Authorization header.",
    "Make sure you authorize your request by"+
    "providing the following HTTP header:",
    "Authorization: Bearer <Firebase ID Token>",
    "or by passing a \"__session\" cookie.");
    res.status(403).send("Unauthorized");
    return;
  }

  let idToken;
  if (req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")) {
    console.log("Found \"Authorization\" header");
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split("Bearer ")[1];
  } else if (req.cookies) {
    console.log("Found \"__session\" cookie");
    // Read the ID Token from cookie.
    idToken = req.cookies.__session;
  } else {
    // No cookie
    res.status(403).send("Unauthorized");
    return;
  }

  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    console.log("ID Token correctly decoded", decodedIdToken);
    req.user = decodedIdToken;
    next();
    return;
  } catch (error) {
    console.error("Error while verifying Firebase ID token:", error);
    res.status(403).send("Unauthorized");
    return;
  }
}

/**
 * pending
 * @param {any}req Request object
 * @param {any}res Response object
 * @param {any}next Next object
 * @return {any} return nothing
 */
export async function validateIpAddress(req:any, res:any, next:any) {
  const ip = req.header("x-forwarded-for") || req.connection.remoteAddress;
  try {
    if (ip == "localhost") {
      next();
      return;
    } else {
      // eslint-disable-next-line no-throw-literal
      throw "Request comeing from an unauthorized IP";
    }
  } catch (error) {
    console.error("Unauthorized:", error);
    res.status(403).send("Unauthorized");
    return;
  }
}
