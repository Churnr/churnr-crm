import * as admin from "firebase-admin";
import * as crypto from "crypto";
import * as functions from "firebase-functions";
import * as qs from "qs";

/**
 * Firebase auth id token validation middleware
 * gives status 403 in response object if unauthorized
 * @param {any}req Request object
 * @param {any}res Response object
 * @param {any}next Next object
 * @return {any} nothing
 */
export async function validateFirebaseIdToken(req:any, res:any, next:any) {
  if ((!req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer ")) &&
        !(req.cookies && req.cookies.__session)) {
    return res.status(403).send("Unauthorized");
  }

  let idToken;
  if (req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")) {
    idToken = req.headers.authorization.split("Bearer ")[1];
  } else if (req.cookies) {
    idToken = req.cookies.__session;
  } else {
    return res.status(403).send("Unauthorized");
  }

  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    console.log("ID Token correctly decoded", decodedIdToken);
    req.user = decodedIdToken;
    next();
    return;
  } catch (error) {
    console.error("Error while verifying Firebase ID token:", error);
    return res.status(403).send("Unauthorized");
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
    return res.status(403).send("Unauthorized");
  }
}

/**
 * Validating the Signing Secret sendt from slack apps
 * @param {any}req Request object
 * @param {any}res Response object
 * @param {any}next Next object
 * @return {any}res status 400
 */
export function validateSlackSigningSecret(req:any, res:any, next:any) {
  const slackSigningSecret = process.env.SLACK_SIGNING_SECRET!;
  const requestSigningSecret = req.headers["x-slack-signature"];
  const requestTimestamp = req.headers["x-slack-request-timestamp"];
  const requestBody = qs.stringify(req.body, {format: "RFC1738"});

  if (slackSigningSecret == undefined) {
    functions.logger.error("Enviroment Error: ",
        "Slack Signing Secret missing from enviroment");
    return res.status(500).send("Internal server error - Contact support");
  }

  if (requestSigningSecret == undefined || requestTimestamp == undefined) {
    return res.status(403).send("Verification failed");
  }

  const sigBasestring = "v0:" + requestTimestamp + ":" + requestBody;
  const signature = "v0=" +
                   crypto.createHmac("sha256", slackSigningSecret)
                       .update(sigBasestring, "utf8")
                       .digest("hex");

  if (crypto.timingSafeEqual(
      Buffer.from(signature, "utf8"),
      Buffer.from(requestSigningSecret, "utf8"))) {
    next();
  } else {
    return res.status(403).send("Verification failed");
  }
}
