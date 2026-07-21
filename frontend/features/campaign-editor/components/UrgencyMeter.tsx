"use client";

import { useEffect, useState } from "react";

import { Box, LinearProgress, Stack, Typography } from "@mui/material";

import { scoreHeadlineUrgency } from "../api/aiApi";

interface UrgencyMeterProps {
  headline: string;
}

type MeterStatus = "idle" | "waiting" | "loading" | "success" | "error";

type MeterColor = "inherit" | "error" | "warning" | "success";

const DEBOUNCE_DELAY_MS = 1000;
const MINIMUM_HEADLINE_LENGTH = 3;

function getMeterColor(score: number | null): MeterColor {
  if (score === null) {
    return "inherit";
  }

  if (score < 40) {
    return "error";
  }

  if (score < 70) {
    return "warning";
  }

  return "success";
}

function getStatusMessage(
  status: MeterStatus,
  score: number | null,
  level: string,
  errorMessage: string | null,
): string {
  if (status === "waiting") {
    return "Waiting for you to stop typing…";
  }

  if (status === "loading") {
    return "Analyzing headline…";
  }

  if (status === "error") {
    return errorMessage ?? "Urgency analysis unavailable.";
  }

  if (status === "success" && score !== null) {
    return level;
  }

  return "Enter a headline to receive an AI score.";
}

export default function UrgencyMeter({ headline }: UrgencyMeterProps) {
  const [score, setScore] = useState<number | null>(null);

  const [level, setLevel] = useState("");
  const [status, setStatus] = useState<MeterStatus>("idle");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const cleanedHeadline = headline.trim();

    if (cleanedHeadline.length < MINIMUM_HEADLINE_LENGTH) {
      setScore(null);
      setLevel("");
      setStatus("idle");
      setErrorMessage(null);

      return;
    }

    setStatus("waiting");
    setErrorMessage(null);

    const abortController = new AbortController();

    const timeoutId = window.setTimeout(async () => {
      setStatus("loading");

      try {
        const result = await scoreHeadlineUrgency(
          cleanedHeadline,
          abortController.signal,
        );

        setScore(result.score);
        setLevel(result.level);
        setStatus("success");
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setStatus("error");

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Urgency analysis unavailable.",
        );
      }
    }, DEBOUNCE_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
      abortController.abort();
    };
  }, [headline]);

  const meterColor = getMeterColor(score);

  const statusMessage = getStatusMessage(status, score, level, errorMessage);

  return (
    <Box
      sx={{
        mt: 1,
        p: 1.5,
        borderRadius: 2,
        bgcolor: "action.hover",
      }}
    >
      <Stack
        sx={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mb: 1,
        }}
      >
        <Typography sx={{ variant: "caption", fontWeight: 700 }}>
          Conversion Urgency of the Headline.
        </Typography>

        <Typography sx={{ variant: "caption", fontWeight: 700 }}>
          {score === null ? "—" : `${score}/100`}
        </Typography>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={score ?? 0}
        color={meterColor}
        aria-label="Conversion urgency score"
        sx={{
          height: 10,
          borderRadius: 999,
          "& .MuiLinearProgress-bar": {
            borderRadius: 999,
            transition: "transform 400ms ease-in-out",
          },
        }}
      />

      <Typography
        variant="caption"
        color={status === "error" ? "error.main" : "text.secondary"}
        sx={{
          display: "block",
          mt: 0.75,
        }}
      >
        {statusMessage}
      </Typography>
    </Box>
  );
}
