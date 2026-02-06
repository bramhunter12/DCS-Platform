import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-IDENTITY-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    // For now, we'll parse the event directly
    // In production, you should verify the webhook signature
    const event = JSON.parse(body) as Stripe.Event;
    
    logStep("Event received", { type: event.type });

    // Handle identity verification events
    if (event.type === "identity.verification_session.verified") {
      const session = event.data.object as Stripe.Identity.VerificationSession;
      const userId = session.metadata?.user_id;

      if (!userId) {
        logStep("No user_id in session metadata");
        return new Response(JSON.stringify({ received: true, error: "No user_id" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      logStep("Verification successful", { userId, sessionId: session.id });

      // Update profile to verified status
      const { error: updateError } = await supabaseClient
        .from("profiles")
        .update({ 
          kyc_status: "verified",
          kyc_verified_at: new Date().toISOString()
        })
        .eq("user_id", userId);

      if (updateError) {
        logStep("Error updating profile", { error: updateError.message });
        throw new Error(`Failed to update profile: ${updateError.message}`);
      }

      logStep("Profile updated to verified");
    } 
    else if (event.type === "identity.verification_session.requires_input") {
      const session = event.data.object as Stripe.Identity.VerificationSession;
      const userId = session.metadata?.user_id;

      if (userId) {
        logStep("Verification requires input", { userId, sessionId: session.id });
        
        // Keep status as pending - user needs to retry
        await supabaseClient
          .from("profiles")
          .update({ kyc_status: "pending" })
          .eq("user_id", userId);
      }
    }
    else if (event.type === "identity.verification_session.canceled") {
      const session = event.data.object as Stripe.Identity.VerificationSession;
      const userId = session.metadata?.user_id;

      if (userId) {
        logStep("Verification canceled", { userId, sessionId: session.id });
        
        // Reset to not_started so user can try again
        await supabaseClient
          .from("profiles")
          .update({ kyc_status: "not_started" })
          .eq("user_id", userId);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
