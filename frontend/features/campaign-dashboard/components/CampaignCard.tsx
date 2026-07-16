import Link from "next/link";

import EditRoundedIcon from "@mui/icons-material/EditRounded";

import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";

import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Stack,
  Typography,
} from "@mui/material";
import type { CampaignListItem } from "../types/campaignDashboard";

interface CampaignCardProps {
  campaign: CampaignListItem;
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
  const editUrl = `/admin/campaign-editor?slug=${encodeURIComponent(
    campaign.slug,
  )}`;
  const liveUrl = `/pages/${encodeURIComponent(campaign.slug)}`;

  return (
    <Card
      elevation={3}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        overflow: "hidden",

        transition: "transform 180ms ease, box-shadow 180ms ease",

        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 8,
        },
      }}
    >
      <CardMedia
        component="img"
        height="210"
        image={campaign.mainImageUrl}
        alt={`${campaign.campaignName} hero image`}
        onError={(event) => {
          event.currentTarget.src = "/images/campaign-placeholder.svg";
        }}
        sx={{
          objectFit: "cover",
          bgcolor: "grey.100",
        }}
      />

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography
          variant="h6"
          component="h2"
          gutterBottom
          sx={{
            fontWeight: 700,
            overflowWrap: "anywhere",
          }}
        >
          {campaign.campaignName}
        </Typography>

        <Stack
          direction="row"
          spacing={1}
          sx={{  alignItems: "center",
            color: "text.secondary", }}
        >
          <LinkRoundedIcon fontSize="small" />

          <Typography
            variant="body2"
            sx={{
              overflowWrap: "anywhere",
            }}
          >
            /{campaign.slug}
          </Typography>
        </Stack>
      </CardContent>

      <CardActions
        sx={{
          p: 2,
          pt: 0,
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        <Button
          component={Link}
          href={editUrl}
          variant="outlined"
          startIcon={<EditRoundedIcon />}
        >
          Edit
        </Button>

        <Button
          component="a"
          href={liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          variant="contained"
          endIcon={<LaunchRoundedIcon />}
        >
          View Live
        </Button>
      </CardActions>
    </Card>
  );
}
