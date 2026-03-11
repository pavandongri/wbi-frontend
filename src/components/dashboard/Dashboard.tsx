"use client";

import { Box, Card, CardContent, Grid, Stack, Typography } from "@mui/material";

const stats = [
  { title: "Users", value: "1,245" },
  { title: "Projects", value: "87" },
  { title: "Tasks", value: "342" },
  { title: "Revenue", value: "$12,430" }
];

export default function Dashboard() {
  return (
    <Box>
      <Typography variant="h4" fontWeight={600} mb={3}>
        Dashboard
      </Typography>

      {/* Stats */}
      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.title}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>

                  <Typography variant="h5" fontWeight={600}>
                    {stat.value}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Activity */}
      <Card sx={{ mt: 4, borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Recent Activity
          </Typography>

          <Stack spacing={1}>
            <Typography color="text.secondary">• New user registered</Typography>

            <Typography color="text.secondary">• {`Project "Website Redesign" created`}</Typography>

            <Typography color="text.secondary">• Task assigned to John</Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
