#!/usr/bin/env node
/**
 * Cross-repo SkinTwin mesh verifier (local payment rails).
 * Start: Connect :3000, Suite :3001, LMS :5000, salon rail :8000, Gatsby :9000 (optional).
 * Usage: SKINTWIN_PLATFORM_KEY=mesh-secret-skintwin node scripts/verify-platform-mesh.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const BASE = {
  connect: process.env.SKINTWINNECTOR_URL || 'http://127.0.0.1:3000',
  suite: process.env.REGIMA_SUITE_URL || 'http://127.0.0.1:3001',
  lms: process.env.REGIMA_LMS_URL || 'http://127.0.0.1:5000',
  salon: process.env.SALON_RAIL_URL || 'http://127.0.0.1:8000',
  salonGatsby: process.env.SALON_GATSBY_URL || 'http://127.0.0.1:9000',
};
const PLATFORM_KEY = process.env.SKINTWIN_PLATFORM_KEY || 'mesh-secret-skintwin';
const outFile =
  process.env.MESH_VERIFY_OUTPUT ||
  path.join(path.dirname(fileURLToPath(import.meta.url)), '../../platform-mesh-verification.json');

const report = {at: new Date().toISOString(), checks: {}, liveRails: {available: false}, overall: false};

function fail(name, error) {
  report.checks[name] = {ok: false, error: String(error)};
}

async function ok(name, detail) {
  report.checks[name] = {ok: true, ...detail};
}

async function main() {
  let platformSession;
  let lmsCookie;
  try {
    const res = await fetch(`${BASE.lms}/api/auth/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({username: 'demo', password: 'password'}),
    });
    const body = await res.json();
    platformSession = body.platformSession;
    lmsCookie = res.headers.getSetCookie?.()?.join('; ') || '';
    if (!platformSession) throw new Error('no platformSession');
    await ok('lms_login', {email: body.email, hasContinue: Boolean(body.continue)});
  } catch (e) {
    fail('lms_login', e);
    write();
    return;
  }

  try {
    const res = await fetch(`${BASE.connect}/api/platform/session`, {
      headers: {Authorization: `Bearer ${platformSession}`},
    });
    const body = await res.json();
    if (!body.ok) throw new Error(JSON.stringify(body));
    await ok('connect_platform_session', {actor: body.actor});
  } catch (e) {
    fail('connect_platform_session', e);
  }

  try {
    const loginRes = await fetch(
      `${BASE.suite}/api/platform/login?session=${encodeURIComponent(platformSession)}&next=/`,
      {redirect: 'manual'}
    );
    const cookies = loginRes.headers.getSetCookie?.() || [];
    const jar = cookies.map((c) => c.split(';')[0]).join('; ');
    const me = await fetch(
      `${BASE.suite}/api/trpc/auth.me?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%7D%7D`,
      {headers: {Cookie: jar}}
    );
    const meJson = await me.json();
    const user = meJson?.[0]?.result?.data?.json;
    if (!user?.email) throw new Error(JSON.stringify(meJson));
    await ok('suite_platform_sso', {email: user.email, role: user.role});
  } catch (e) {
    fail('suite_platform_sso', e);
  }

  try {
    const invRes = await fetch(`${BASE.salon}/api/create_invoice`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email: 'mesh-verify@skintwin.ai', amount: 850000}),
    });
    const inv = await invRes.json();
    const termRes = await fetch(`${BASE.salon}/api/push_to_terminal`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(inv.data),
    });
    const term = await termRes.json();
    const syncRes = await fetch(`${BASE.salon}/api/integrations/skintwin`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        action: 'sync_appointment',
        appointment: {
          id: `apt_mesh_${Date.now()}`,
          clientEmail: 'mesh-verify@skintwin.ai',
          service: 'Signature Facial',
          status: 'confirmed',
        },
      }),
    });
    const sync = await syncRes.json();
    await ok('salon_paystack_local', {
      invoiceId: inv.data?.id,
      terminalStatus: term.data?.status,
      platformSync: sync.data,
    });
  } catch (e) {
    fail('salon_paystack_local', e);
  }

  try {
    const res = await fetch(`${BASE.lms}/api/platform/certifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${platformSession}`,
      },
      body: JSON.stringify({
        therapistEmail: 'demo@skintwin.ai',
        therapistName: 'Dr. Jane Doe',
        certLevel: 'Professional',
        courseId: `mod-mesh-${Date.now()}`,
      }),
    });
    const body = await res.json();
    if (!body.ok || !body.forwarded) throw new Error(JSON.stringify(body));
    await ok('lms_suite_certification', {forwarded: body.forwarded});
  } catch (e) {
    fail('lms_suite_certification', e);
  }

  try {
    const res = await fetch(`${BASE.connect}/api/platform/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PLATFORM_KEY}`,
      },
      body: JSON.stringify({
        action: 'sync_certification',
        source: 'regima-training-lms',
        certification: {
          therapistEmail: 'demo@skintwin.ai',
          therapistName: 'Dr. Jane Doe',
          courseId: 'mod-mesh-connect',
          certLevel: 'Foundation',
        },
      }),
    });
    const body = await res.json();
    if (!body.ok) throw new Error(JSON.stringify(body));
    await ok('connect_certification_sync', {id: body.id});
  } catch (e) {
    fail('connect_certification_sync', e);
  }

  try {
    const res = await fetch(`${BASE.lms}/api/shopify/local/order`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', Cookie: lmsCookie},
      body: JSON.stringify({moduleId: 8, userId: 1, email: 'demo@skintwin.ai'}),
    });
    const body = await res.json();
    if (!body.success) throw new Error(JSON.stringify(body));
    await ok('lms_shopify_local_enroll', {
      orderId: body.order?.id,
      enrollments: body.enrollments?.length,
    });
  } catch (e) {
    fail('lms_shopify_local_enroll', e);
  }

  try {
    const csrfRes = await fetch(`${BASE.connect}/api/auth/csrf`);
    const {csrfToken} = await csrfRes.json();
    const cookie = csrfRes.headers.getSetCookie?.().map((c) => c.split(';')[0]).join('; ') || '';
    const sign = await fetch(`${BASE.connect}/api/auth/callback/platform`, {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded', Cookie: cookie},
      body: new URLSearchParams({
        csrfToken,
        platformSession,
        callbackUrl: `${BASE.connect}/home`,
        json: 'true',
      }),
    });
    const authCookies = sign.headers.getSetCookie?.().map((c) => c.split(';')[0]).join('; ') || cookie;
    const checkout = await fetch(`${BASE.connect}/api/bookings/create_checkout_session`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', Cookie: authCookies},
      body: JSON.stringify({
        draftId: `mesh-${Date.now()}`,
        services: [{serviceId: 'srv-001', quantity: 1, addOns: []}],
        appointment: {
          date: '2026-11-12',
          startTime: '10:00',
          endTime: '11:15',
          providerId: 'prv-001',
          totalDurationMinutes: 75,
        },
        client: {
          firstName: 'Mesh',
          lastName: 'Verify',
          email: 'mesh-verify@skintwin.ai',
          phone: '+2348012345678',
          consentAccepted: true,
          intakeCompleted: true,
        },
      }),
    });
    const checkoutBody = await checkout.json();
    if (!checkoutBody.checkoutUrl) throw new Error(JSON.stringify(checkoutBody));
    const sessionId = checkoutBody.sessionId || checkoutBody.checkoutUrl.split('/').pop();
    const pay = await fetch(`${BASE.connect}/api/payments/local/confirm`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({sessionId}),
    });
    const paid = await pay.json();
    const status = paid.payment_status || paid.paymentStatus;
    if (status !== 'paid') throw new Error(JSON.stringify(paid));
    await ok('connect_local_checkout', {sessionId, payment_status: status});
  } catch (e) {
    fail('connect_local_checkout', e);
  }

  try {
    const res = await fetch(`${BASE.connect}/api/platform/health`);
    const body = await res.json();
    if (!body.ok) throw new Error(JSON.stringify(body));
    if (!body.meshReady) throw new Error(`mesh peers not reachable: ${JSON.stringify(body.peers)}`);
    await ok('connect_health', {
      meshReady: body.meshReady,
      integrations: body.integrations,
      peers: body.peers,
    });
    report.liveRails = {
      available: Boolean(body.integrations?.stripe),
      stripeMode: body.integrations?.stripeMode || 'local',
      note: body.integrations?.stripe
        ? 'Live Stripe secret configured on Connect'
        : 'Bind Stripe, Paystack, and Shopify secrets to exercise live settlement',
    };
  } catch (e) {
    fail('connect_health', e);
    report.liveRails = {
      available: false,
      note: 'Connect health check failed before rail classification',
    };
  }

  try {
    const res = await fetch(BASE.salonGatsby);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    await ok('salon_gatsby_http', {status: res.status});
  } catch (e) {
    fail('salon_gatsby_http', e);
  }

  if (!report.liveRails) {
    report.liveRails = {
      available: false,
      note: 'No live rail classification recorded',
    };
  }

  report.overall = Object.values(report.checks).every((c) => c.ok);
  write();
}

function write() {
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.overall ? 0 : 1);
}

main();
