// app/api/auth/[...nextauth]/route.js
import { handlers } from "@/auth" // Path to the auth.js file you created in Step 3

export const { GET, POST } = handlers