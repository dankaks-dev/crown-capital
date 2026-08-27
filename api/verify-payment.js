import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const TIERS = {
  [process.env.STRIPE_PRICE_PRO]: 'pro',
  [process.env.STRIPE_PRICE_PORTFOLIO]: 'portfolio',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId } = req.body || {};
  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID required' });
  }

  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Not signed in' });
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user) {
    return res.status(401).json({ error: 'Not signed in' });
  }
  const user = userData.user;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    });

    if (session.client_reference_id !== user.id) {
      return res.status(403).json({ error: 'Session does not belong to this account' });
    }

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    const priceId = session.line_items?.data?.[0]?.price?.id;
    const tier = TIERS[priceId];
    if (!tier) {
      return res.status(400).json({ error: 'Unrecognised plan' });
    }

    const { error: writeError } = await supabase.from('subscriptions').upsert({
      user_id: user.id,
      tier,
      stripe_customer_id: typeof session.customer === 'string' ? session.customer : null,
      stripe_subscription_id: typeof session.subscription === 'string' ? session.subscription : null,
      status: 'active',
      updated_at: new Date().toISOString(),
    });

    if (writeError) {
      console.error('Subscription write error:', writeError);
      return res.status(500).json({ error: 'Could not record subscription' });
    }

    return res.status(200).json({ success: true, tier });
  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).json({ error: 'Verification failed' });
  }
}
