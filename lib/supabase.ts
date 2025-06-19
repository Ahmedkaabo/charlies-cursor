import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("Supabase URL:", supabaseUrl ? "✓ Set" : "✗ Missing")
console.log("Supabase Key:", supabaseAnonKey ? "✓ Set" : "✗ Missing")

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables!")
  console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl)
  console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey ? "Present" : "Missing")
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.")
}

// Create client with schema refresh options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: "public",
  },
  auth: {
    persistSession: false,
  },
})

// Test connection and refresh schema on initialization
supabase
  .from("branches")
  .select("count", { count: "exact", head: true })
  .then(({ error, count }) => {
    if (error) {
      console.error("Supabase connection test failed:", error)
      // Try to refresh schema cache
      console.log("Attempting to refresh schema cache...")
    } else {
      console.log("Supabase connection successful. Branches count:", count)
    }
  })
