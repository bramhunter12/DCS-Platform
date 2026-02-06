import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-VERIFICATION-STATUS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Get current profile status
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("kyc_status, kyc_verified_at")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      throw new Error("Profile not found");
    }

    // If already verified, just return current status
    if (profile.kyc_status === "verified") {
      logStep("Already verified", { verifiedAt: profile.kyc_verified_at });
      return new Response(JSON.stringify({
        status: "verified",
        verified_at: profile.kyc_verified_at
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // If pending, check with Stripe for latest status
    if (profile.kyc_status === "pending") {
      const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

      // List recent verification sessions for this user
      const sessions = await stripe.identity.verificationSessions.list({
        limit: 1,
      });

      // Find session for this user
      const userSession = sessions.data.find(
        (session: Stripe.Identity.VerificationSession) => session.metadata?.user_id === user.id
      );

      if (userSession) {
        logStep("Found session", { 
          sessionId: userSession.id, 
          status: userSession.status 
        });

        if (userSession.status === "verified") {
          // Update profile to verified
          await supabaseClient
            .from("profiles")
            .update({ 
              kyc_status: "verified",
              kyc_verified_at: new Date().toISOString()
            })
            .eq("user_id", user.id);

          return new Response(JSON.stringify({
            status: "verified",
            verified_at: new Date().toISOString()
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }

        if (userSession.status === "canceled") {
          // Reset to not_started
          await supabaseClient
            .from("profiles")
            .update({ kyc_status: "not_started" })
            .eq("user_id", user.id);

          return new Response(JSON.stringify({
            status: "not_started"
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
      }
    }

    logStep("Returning current status", { status: profile.kyc_status });
    return new Response(JSON.stringify({
      status: profile.kyc_status
    }), {
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
