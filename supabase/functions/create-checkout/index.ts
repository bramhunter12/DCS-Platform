import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { listingId } = await req.json();
    if (!listingId) throw new Error("Listing ID is required");
    logStep("Listing ID received", { listingId });

    // Fetch listing details
    const { data: listing, error: listingError } = await supabaseClient
      .from("listings")
      .select(`
        id,
        model,
        reference_number,
        asking_price,
        currency,
        seller_id,
        status,
        brand_id
      `)
      .eq("id", listingId)
      .eq("status", "approved")
      .maybeSingle();

    if (listingError) throw new Error(`Failed to fetch listing: ${listingError.message}`);
    if (!listing) throw new Error("Listing not found or not available for purchase");
    logStep("Listing fetched", { model: listing.model, price: listing.asking_price });

    // Fetch brand name separately
    let brandName = "Watch";
    if (listing.brand_id) {
      const { data: brandData } = await supabaseClient
        .from("brands")
        .select("name")
        .eq("id", listing.brand_id)
        .maybeSingle();
      if (brandData) brandName = brandData.name;
    }
    logStep("Brand fetched", { brandName });

    // Prevent buyer from purchasing their own listing
    if (listing.seller_id === user.id) {
      throw new Error("You cannot purchase your own listing");
    }

    // Get seller's commission rate
    const { data: commissionData } = await supabaseClient.rpc("get_commission_rate", {
      _user_id: listing.seller_id,
    });
    const commissionRate = commissionData || 0.035; // Default to 3.5%
    const commissionAmount = Math.round(listing.asking_price * commissionRate * 100) / 100;
    logStep("Commission calculated", { rate: commissionRate, amount: commissionAmount });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing Stripe customer found", { customerId });
    }

    const productName = `${brandName} ${listing.model}`;
    const origin = req.headers.get("origin") || "https://luxe-keeper-platform.lovable.app";

    // Create checkout session with dynamic price
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: listing.currency.toLowerCase(),
            product_data: {
              name: productName,
              description: `Ref. ${listing.reference_number}`,
              metadata: {
                listing_id: listing.id,
                seller_id: listing.seller_id,
              },
            },
            unit_amount: Math.round(listing.asking_price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&listing_id=${listing.id}`,
      cancel_url: `${origin}/listing/${listing.id}?checkout=cancelled`,
      metadata: {
        listing_id: listing.id,
        buyer_id: user.id,
        seller_id: listing.seller_id,
        commission_amount: commissionAmount.toString(),
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
