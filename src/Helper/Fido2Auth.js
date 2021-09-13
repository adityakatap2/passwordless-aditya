import Axios from "./Axios";

function n(e) {
  const t = e.replace(/-/g, "+").replace(/_/g, "/"),
    n = (4 - (t.length % 4)) % 4,
    r = t.padEnd(t.length + n, "="),
    o = atob(r),
    i = new ArrayBuffer(o.length),
    a = new Uint8Array(i);
  for (let e = 0; e < o.length; e++) a[e] = o.charCodeAt(e);
  return i;
}
function t(e) {
  const t = new Uint8Array(e);
  let n = "";
  for (const e of t) n += String.fromCharCode(e);
  return btoa(n).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function o(e) {
  const { id: t } = e;
  return { ...e, id: n(t) };
}
function r() {
  return (
    void 0 !==
      (null === window || void 0 === window
        ? void 0
        : window.PublicKeyCredential) &&
    "function" == typeof window.PublicKeyCredential
  );
}

export const startAssertion = async (e) => {
  var i, a;
  if (!r()) throw new Error("WebAuthn is not supported in this browser");
  let s;
  0 !==
    (null === (i = e.allowCredentials) || void 0 === i ? void 0 : i.length) &&
    (s = null === (a = e.allowCredentials) || void 0 === a ? void 0 : a.map(o));
  const l = { ...e, challenge: n(e.challenge), allowCredentials: s },
    d = await navigator.credentials.get({ publicKey: l });
  if (!d) throw new Error("Assertion was not completed");
  const { id: c, rawId: u, response: p, type: f } = d;
  let w;
  var g;
  return (
    p.userHandle &&
      ((g = p.userHandle), (w = new TextDecoder("utf-8").decode(g))),
    {
      id: c,
      rawId: t(u),
      response: {
        authenticatorData: t(p.authenticatorData),
        clientDataJSON: t(p.clientDataJSON),
        signature: t(p.signature),
        userHandle: w,
      },
      type: f,
      clientExtensionResults: d.getClientExtensionResults(),
    }
  );
};

export const startAttestation = async (e) => {
  if (!r()) throw new Error("WebAuthn is not supported in this browser");

  const publicKey = {
    ...e,
    challenge: n(e.challenge),
    user: { ...e.user, id: ((a = e.user.id), new TextEncoder().encode(a)) },
    excludeCredentials: e.excludeCredentials.map(o),
  };
  var a;
  const s = await navigator.credentials.create({ publicKey: publicKey });
  if (!s) throw new Error("Attestation was not completed");
  const { id: l, rawId: d, response: c, type: u } = s,
    p = {
      id: l,
      rawId: t(d),
      response: {
        attestationObject: t(c.attestationObject),
        clientDataJSON: t(c.clientDataJSON),
      },
      type: u,
      clientExtensionResults: s.getClientExtensionResults(),
    };
  return p;
};

export const registerOrgWithFido = async ({ email:username ,name}) => {
  
  try {
    const attestation = await Axios.post("registerOperator", { username ,name});
    const { challenge } = attestation.data;
    const attresp = await startAttestation(attestation.data);
    const verification = await Axios.post("verify-registerOperator-attestation", {
      username,
      credential: attresp,
      challenge,
    });

    return verification.data;
  } catch (error) {
    let errorMsg = error.message;
    if (error?.response?.data?.errorMessage)
      errorMsg = error?.response?.data?.errorMessage;

    throw new Error(errorMsg);
  }
};

export const loginOrgWithFido = async ({ email:username }) => {
  
  try {
    const assertion = await Axios.post("loginOperator", { username });
    const { challenge } = assertion.data;
    console.log("assertion",assertion.data);
    const attresp = await startAssertion(assertion.data);
    console.log(attresp);
    const verification = await Axios.post("verify-loginOperator-assertion", {
      username,
     ...attresp,
      challenge,
    });

    return verification.data;
  } catch (error) {
    let errorMsg = error.message;
    if (error?.response?.data?.errorMessage)
      errorMsg = error?.response?.data?.errorMessage;

    throw new Error(errorMsg);
  }
};


