import Link from "next/link";

import { Box, Button, Typography } from "@mui/material";

export default function LandingPageNotFound() {
  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        p: 3,

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        textAlign: "center",
        bgcolor: "#f5f5f5",
      }}
    >
      <Box>
        <Typography
          variant="h2"
          component="h1"
          sx={{
            mb: 2,
            fontWeight: 800,
          }}
        >
          Campaign not found
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 3 }}>
          This landing page does not exist or may have been removed.
        </Typography>

        <Button component={Link} href="/dashboard" variant="contained">
          Return to Dashboard
        </Button>
      </Box>
    </Box>
  );
}
