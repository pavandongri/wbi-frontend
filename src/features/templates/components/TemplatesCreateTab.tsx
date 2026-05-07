"use client";

import { useToast } from "@/components/ui";
import { ADMINS_CONTROL_RADIUS_PX } from "@/features/admins/adminsUiTokens";
import TemplateMessagePreview from "@/features/templates/components/TemplateMessagePreview";
import {
  insertSnippetAtCaret,
  wrapSelectionWithDelimiter
} from "@/features/templates/lib/insertIntoField";
import {
  countVariablePlaceholders,
  extractTemplateVariableKeys,
  mergeVariableKeys
} from "@/features/templates/lib/templateText";
import {
  isE164Phone,
  isValidTemplateName,
  sanitizeTemplateVarName,
  TEMPLATE_VAR_NAME_PATTERN
} from "@/features/templates/lib/templateValidation";
import { ApiError } from "@/lib/apiClient";
import { createTemplate } from "@/services/templates/templates.api";
import type {
  CreateTemplateBody,
  TemplateButton,
  TemplateButtonFormRow,
  TemplateCategory,
  TemplateHeaderType
} from "@/types/templates.types";
import AddIcon from "@mui/icons-material/Add";
import CodeIcon from "@mui/icons-material/Code";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MoodIcon from "@mui/icons-material/Mood";
import StrikethroughSIcon from "@mui/icons-material/StrikethroughS";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { RefObject } from "react";
import { useMemo, useRef, useState } from "react";

const R = `${ADMINS_CONTROL_RADIUS_PX}px`;
const CONTROL_SX = {
  "& .MuiOutlinedInput-root": { borderRadius: R }
} as const;

const EMOJI_INSERTS = ["😀", "😊", "👍", "✅", "❤️", "🙏", "📅", "✨", "🎉", "🔔"];

const CATEGORIES: TemplateCategory[] = ["marketing", "utility"];
const HEADER_TYPES: TemplateHeaderType[] = [
  "none",
  "text",
  "image",
  "video",
  "document",
  "location"
];

function emptyButton(type: TemplateButtonFormRow["type"]): TemplateButtonFormRow {
  if (type === "url") return { type: "url", text: "", url: "", url_type: "static" };
  if (type === "phone_number") return { type: "phone_number", text: "", phone_number: "" };
  return { type: "quick_reply", text: "" };
}

function canAddButton(
  buttons: TemplateButtonFormRow[],
  type: TemplateButtonFormRow["type"]
): boolean {
  const qr = buttons.filter((b) => b.type === "quick_reply").length;
  const url = buttons.filter((b) => b.type === "url").length;
  const ph = buttons.filter((b) => b.type === "phone_number").length;
  if (type === "quick_reply") return qr < 3;
  if (type === "url") return url < 2;
  return ph < 1;
}

type Props = {
  companyScoped: boolean;
  onCreated?: () => void;
};

type VarTarget = "header" | "body";

export default function TemplatesCreateTab({ companyScoped, onCreated }: Props) {
  const qc = useQueryClient();
  const toast = useToast();
  const headerInputRef = useRef<HTMLInputElement | null>(null);
  const bodyInputRef = useRef<HTMLTextAreaElement | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<TemplateCategory>("marketing");
  const [headerType, setHeaderType] = useState<TemplateHeaderType>("none");
  const [headerText, setHeaderText] = useState("");
  const [headerMediaUrl, setHeaderMediaUrl] = useState("");
  const [body, setBody] = useState("");
  const [footer, setFooter] = useState("");
  const [buttons, setButtons] = useState<TemplateButtonFormRow[]>([]);
  const [varSamples, setVarSamples] = useState<Record<string, string>>({});
  const [localError, setLocalError] = useState<string | null>(null);

  const [varDialogTarget, setVarDialogTarget] = useState<VarTarget | null>(null);
  const [varNameDraft, setVarNameDraft] = useState("");

  const [emojiAnchor, setEmojiAnchor] = useState<null | HTMLElement>(null);

  const headerVarCount = useMemo(() => countVariablePlaceholders(headerText), [headerText]);
  const headerVarFull = headerVarCount >= 1;

  const varKeys = useMemo(
    () => mergeVariableKeys(headerType === "text" ? headerText : null, body),
    [headerText, body, headerType]
  );

  const previewValues = useMemo(() => {
    const m: Record<string, string> = { ...varSamples };
    for (const k of varKeys) if (m[k] === undefined) m[k] = "";
    return m;
  }, [varKeys, varSamples]);

  const openVarDialog = (target: VarTarget) => {
    if (target === "header" && headerVarFull) {
      toast.showToast({
        message: "Text header allows only one variable. Remove it before adding another.",
        severity: "warning"
      });
      return;
    }
    setVarNameDraft("");
    setVarDialogTarget(target);
  };

  const confirmVarDialog = () => {
    const key = sanitizeTemplateVarName(varNameDraft);
    if (!key || !TEMPLATE_VAR_NAME_PATTERN.test(key)) {
      toast.showToast({
        message:
          "Use a variable name that starts with a letter and contains only letters, digits, and underscores.",
        severity: "warning"
      });
      return;
    }
    const snippet = `{{${key}}}`;
    if (varDialogTarget === "header") {
      if (countVariablePlaceholders(headerText + snippet) > 1) {
        toast.showToast({ message: "Text header allows only one variable.", severity: "warning" });
        return;
      }
      insertSnippetAtCaret(
        headerInputRef as RefObject<HTMLInputElement | null>,
        headerText,
        setHeaderText,
        snippet
      );
    } else {
      insertSnippetAtCaret(
        bodyInputRef as RefObject<HTMLTextAreaElement | null>,
        body,
        setBody,
        snippet
      );
    }
    setVarDialogTarget(null);
    setVarNameDraft("");
  };

  const createMut = useMutation({
    mutationFn: async () => {
      setLocalError(null);
      const trimmed = name.trim().toLowerCase();
      if (!isValidTemplateName(trimmed)) {
        throw new Error(
          "Template name may only use lowercase letters and underscores (e.g. welcome_template)."
        );
      }
      if (!body.trim()) throw new Error("Body is required.");

      if (headerType === "text" && countVariablePlaceholders(headerText) > 1) {
        throw new Error("Text header may include at most one variable (one {{…}} placeholder).");
      }

      for (const b of buttons) {
        if (!b.text.trim()) continue;
        if (b.type === "phone_number") {
          const ph = b.phone_number?.trim() ?? "";
          if (!ph) {
            throw new Error(
              `Phone button "${b.text.trim()}" needs a phone number in E.164 (e.g. +14155552671).`
            );
          }
          if (!isE164Phone(ph)) {
            throw new Error(
              `Phone button "${b.text.trim()}": use international E.164 format starting with + (e.g. +14155552671).`
            );
          }
        }
        if (b.type === "url" && !String(b.url ?? "").trim()) {
          throw new Error(`URL button "${b.text.trim()}" needs a website URL.`);
        }
      }

      const headerKeys = extractTemplateVariableKeys(headerType === "text" ? headerText : "");
      const bodyKeys = extractTemplateVariableKeys(body);
      const headerExample =
        headerKeys.length > 0 ? headerKeys.map((k) => varSamples[k]?.trim() ?? "") : undefined;
      const bodyExample =
        bodyKeys.length > 0 ? [bodyKeys.map((k) => varSamples[k]?.trim() ?? "")] : undefined;

      const cleanedButtons: TemplateButton[] = buttons
        .filter((b) => b.text.trim())
        .map((b) => {
          if (b.type === "url") {
            const url = String(b.url ?? "").trim();
            return {
              type: "url" as const,
              text: b.text.trim(),
              url,
              url_type: "static" as const
            };
          }
          if (b.type === "phone_number") {
            const phone_number = String(b.phone_number ?? "").trim();
            return {
              type: "phone_number" as const,
              text: b.text.trim(),
              phone_number
            };
          }
          return { type: "quick_reply" as const, text: b.text.trim() };
        });

      const payload: CreateTemplateBody = {
        name: trimmed,
        language: "en",
        category,
        headerType,
        body: body.trim(),
        footer: footer.trim() || undefined,
        buttons: cleanedButtons.length ? cleanedButtons : undefined,
        headerExample,
        bodyExample
      };
      if (headerType === "text" && headerText.trim()) payload.headerText = headerText.trim();
      if (headerType !== "text" && headerType !== "none" && headerMediaUrl.trim()) {
        payload.headerMediaUrl = headerMediaUrl.trim();
      }
      return createTemplate(payload);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["templates", "list"] });
      setName("");
      setBody("");
      setFooter("");
      setHeaderText("");
      setHeaderMediaUrl("");
      setButtons([]);
      setVarSamples({});
      onCreated?.();
    },
    onError: (err) => {
      const msg =
        err instanceof ApiError || err instanceof Error
          ? err.message
          : "Could not create template.";
      setLocalError(msg);
    }
  });

  if (!companyScoped) {
    return (
      <Alert severity="warning" sx={{ borderRadius: R }}>
        Your session has no company scope. Sign in with a company user to create templates.
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "1fr minmax(280px, 340px)" },
        gap: 3,
        alignItems: "start"
      }}
    >
      <Box component="form" noValidate onSubmit={(e) => e.preventDefault()}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
          Draft a WhatsApp-style template. Variables use {"{{name}}"} syntax.
        </Typography>
        {localError ? (
          <Alert severity="error" sx={{ mb: 2, borderRadius: R }}>
            {localError}
          </Alert>
        ) : null}

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          <TextField
            label="Template name"
            value={name}
            onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z_]/g, ""))}
            required
            fullWidth
            sx={{ flex: "1 1 240px", ...CONTROL_SX }}
            helperText="Lowercase letters and underscores only (e.g. welcome_template)."
            inputProps={{ maxLength: 512 }}
          />
          <FormControl sx={{ flex: "1 1 200px", ...CONTROL_SX }}>
            <InputLabel id="tpl-cat">Category</InputLabel>
            <Select
              labelId="tpl-cat"
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value as TemplateCategory)}
            >
              {CATEGORIES.map((c) => (
                <MenuItem key={c} value={c} sx={{ borderRadius: R }}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ flex: "1 1 200px", ...CONTROL_SX }}>
            <InputLabel id="tpl-hdr">Header type</InputLabel>
            <Select
              labelId="tpl-hdr"
              label="Header type"
              value={headerType}
              onChange={(e) => setHeaderType(e.target.value as TemplateHeaderType)}
            >
              {HEADER_TYPES.map((h) => (
                <MenuItem key={h} value={h} sx={{ borderRadius: R }}>
                  {h}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {headerType === "text" ? (
          <Box sx={{ mt: 2.5 }}>
            <Box sx={{ position: "relative" }}>
              <TextField
                label="Header · Optional"
                value={headerText}
                onChange={(e) => setHeaderText(e.target.value)}
                fullWidth
                inputRef={headerInputRef}
                sx={CONTROL_SX}
                inputProps={{ maxLength: 60 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end" sx={{ alignSelf: "center", mt: 0 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ userSelect: "none" }}
                      >
                        {headerText.length}/60
                      </Typography>
                    </InputAdornment>
                  )
                }}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 1,
                mt: 1
              }}
            >
              <Button
                variant="text"
                size="small"
                disabled={headerVarFull}
                onClick={() => openVarDialog("header")}
                sx={{ borderRadius: R, textTransform: "none", fontWeight: 600 }}
              >
                + Add variable
              </Button>
              <Tooltip title="Text headers support at most one placeholder such as {{company_name}}.">
                <IconButton size="small" aria-label="Header help" sx={{ borderRadius: R }}>
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        ) : null}

        {headerType !== "none" && headerType !== "text" ? (
          <TextField
            label="Header media URL (optional)"
            value={headerMediaUrl}
            onChange={(e) => setHeaderMediaUrl(e.target.value)}
            fullWidth
            sx={{ mt: 2.5, ...CONTROL_SX }}
            placeholder="https://…"
          />
        ) : null}

        <Box sx={{ mt: 2.5 }}>
          <Box sx={{ position: "relative" }}>
            <TextField
              label="Body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              fullWidth
              multiline
              minRows={6}
              inputRef={bodyInputRef}
              sx={{
                ...CONTROL_SX,
                "& .MuiInputBase-inputMultiline": { pr: 5, pb: 5 }
              }}
              inputProps={{ maxLength: 1024 }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                position: "absolute",
                right: 14,
                top: 14,
                pointerEvents: "none",
                userSelect: "none"
              }}
            >
              {body.length}/1024
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 0.5,
              mt: 1.25,
              px: 1,
              py: 1,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: R,
              bgcolor: "background.paper"
            }}
          >
            <Tooltip title="Emoji">
              <IconButton
                size="small"
                aria-label="Insert emoji"
                onClick={(e) => setEmojiAnchor(e.currentTarget)}
                sx={{ borderRadius: R }}
              >
                <MoodIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={emojiAnchor}
              open={Boolean(emojiAnchor)}
              onClose={() => setEmojiAnchor(null)}
            >
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, maxWidth: 220, p: 1 }}>
                {EMOJI_INSERTS.map((em) => (
                  <MenuItem
                    key={em}
                    dense
                    onClick={() => {
                      insertSnippetAtCaret(
                        bodyInputRef as RefObject<HTMLTextAreaElement | null>,
                        body,
                        setBody,
                        em
                      );
                      setEmojiAnchor(null);
                    }}
                    sx={{
                      borderRadius: R,
                      fontSize: "1.25rem",
                      minWidth: 40,
                      justifyContent: "center"
                    }}
                  >
                    {em}
                  </MenuItem>
                ))}
              </Box>
            </Menu>
            <Tooltip title="Bold">
              <IconButton
                size="small"
                aria-label="Bold"
                onClick={() =>
                  wrapSelectionWithDelimiter(
                    bodyInputRef as RefObject<HTMLTextAreaElement | null>,
                    body,
                    setBody,
                    "*"
                  )
                }
                sx={{ borderRadius: R }}
              >
                <FormatBoldIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Italic">
              <IconButton
                size="small"
                aria-label="Italic"
                onClick={() =>
                  wrapSelectionWithDelimiter(
                    bodyInputRef as RefObject<HTMLTextAreaElement | null>,
                    body,
                    setBody,
                    "_"
                  )
                }
                sx={{ borderRadius: R }}
              >
                <FormatItalicIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Strikethrough">
              <IconButton
                size="small"
                aria-label="Strikethrough"
                onClick={() =>
                  wrapSelectionWithDelimiter(
                    bodyInputRef as RefObject<HTMLTextAreaElement | null>,
                    body,
                    setBody,
                    "~"
                  )
                }
                sx={{ borderRadius: R }}
              >
                <StrikethroughSIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Monospace">
              <IconButton
                size="small"
                aria-label="Monospace"
                onClick={() =>
                  wrapSelectionWithDelimiter(
                    bodyInputRef as RefObject<HTMLTextAreaElement | null>,
                    body,
                    setBody,
                    "```"
                  )
                }
                sx={{ borderRadius: R }}
              >
                <CodeIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Button
              variant="text"
              size="small"
              onClick={() => openVarDialog("body")}
              sx={{ ml: 0.5, borderRadius: R, textTransform: "none", fontWeight: 600 }}
            >
              + Add variable
            </Button>
            <Box sx={{ flex: 1 }} />
            <Tooltip title="Use the toolbar to insert WhatsApp formatting markers.">
              <IconButton size="small" aria-label="Body formatting help" sx={{ borderRadius: R }}>
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <TextField
          label="Footer (optional)"
          value={footer}
          onChange={(e) => setFooter(e.target.value)}
          fullWidth
          sx={{ mt: 2.5, ...CONTROL_SX }}
          inputProps={{ maxLength: 60 }}
          helperText={`${footer.length}/60`}
        />

        {varKeys.length > 0 ? (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Variable samples
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
              Example values are sent to Meta for review and used in the preview.
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {varKeys.map((key) => (
                <TextField
                  key={key}
                  label={`{{${key}}}`}
                  value={varSamples[key] ?? ""}
                  onChange={(e) => setVarSamples((prev) => ({ ...prev, [key]: e.target.value }))}
                  fullWidth
                  size="small"
                  sx={CONTROL_SX}
                />
              ))}
            </Box>
          </Box>
        ) : null}

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
          Buttons (optional)
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.25, mb: 2.5 }}>
          {(["quick_reply", "url", "phone_number"] as const).map((t) => (
            <Button
              key={t}
              size="small"
              variant="outlined"
              startIcon={<AddIcon />}
              disabled={!canAddButton(buttons, t)}
              onClick={() => setButtons((prev) => [...prev, emptyButton(t)])}
              sx={{ borderRadius: R, textTransform: "none", fontWeight: 600 }}
            >
              {t === "quick_reply" ? "Quick reply" : t === "url" ? "URL" : "Phone"}
            </Button>
          ))}
        </Box>

        {buttons.map((b, idx) => (
          <Box
            key={idx}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: R,
              p: 2,
              mb: 2.5,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              bgcolor: "background.paper"
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography
                variant="caption"
                color="text.secondary"
                textTransform="uppercase"
                letterSpacing={0.04}
              >
                {b.type.replace("_", " ")}
              </Typography>
              <Button
                size="small"
                color="inherit"
                onClick={() => setButtons((p) => p.filter((_, i) => i !== idx))}
                startIcon={<DeleteOutlineIcon fontSize="small" />}
                sx={{ borderRadius: R, textTransform: "none" }}
              >
                Remove
              </Button>
            </Box>
            <TextField
              size="small"
              label="Button text"
              value={b.text}
              onChange={(e) => {
                const v = e.target.value;
                setButtons((p) => p.map((x, i) => (i === idx ? { ...x, text: v } : x)));
              }}
              sx={CONTROL_SX}
            />
            {b.type === "url" ? (
              <TextField
                size="small"
                label="Website URL (static)"
                value={b.url ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setButtons((p) => p.map((x, i) => (i === idx ? { ...x, url: v } : x)));
                }}
                sx={CONTROL_SX}
                placeholder="https://…"
              />
            ) : null}
            {b.type === "phone_number" ? (
              <TextField
                size="small"
                label="Phone number (E.164)"
                value={b.phone_number ?? ""}
                onChange={(e) => {
                  const v = e.target.value.replace(/\s/g, "");
                  setButtons((p) => p.map((x, i) => (i === idx ? { ...x, phone_number: v } : x)));
                }}
                sx={CONTROL_SX}
                placeholder="+14155552671"
                helperText="Include country code with + (max 15 digits after +)."
                error={Boolean(b.phone_number?.trim() && !isE164Phone(b.phone_number))}
              />
            ) : null}
          </Box>
        ))}

        <Box sx={{ display: "flex", justifyContent: "center", width: "100%", mt: 1 }}>
          <Button
            variant="contained"
            disabled={createMut.isPending}
            onClick={() => createMut.mutate()}
            sx={{
              minWidth: 200,
              borderRadius: R,
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              py: 1.25
            }}
          >
            Submit template
          </Button>
        </Box>
      </Box>

      <Box sx={{ position: { lg: "sticky" }, top: { lg: 16 } }}>
        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
          Preview
        </Typography>
        <TemplateMessagePreview
          headerText={headerType === "text" ? headerText : null}
          body={body || " "}
          footer={footer || null}
          buttons={buttons.length ? buttons : null}
          variableValues={previewValues}
        />
      </Box>

      <Dialog
        open={varDialogTarget !== null}
        onClose={() => setVarDialogTarget(null)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: R } }}
      >
        <DialogTitle>Add variable</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Variable name"
            fullWidth
            value={varNameDraft}
            onChange={(e) => setVarNameDraft(e.target.value)}
            placeholder="company_name"
            sx={{ mt: 0.5, ...CONTROL_SX }}
            helperText="Start with a letter; then letters, digits, or underscores."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setVarDialogTarget(null)}
            sx={{ borderRadius: R, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={confirmVarDialog}
            sx={{ borderRadius: R, textTransform: "none" }}
          >
            Insert
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
