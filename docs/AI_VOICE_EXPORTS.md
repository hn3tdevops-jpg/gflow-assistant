# AI Voice Exports

## Overview

The gflow lyrics module supports five export formats, each targeting a different downstream use case — from human vocalist sheets to AI TTS engines.

---

## Export Formats

### 1. Pronunciation Sheet (`pronunciation_sheet`)

Human-readable text document pairing each word with its pronunciation spelling.

**Use case:** Print-ready sheet for vocalists, session singers, or voice actors.

**Example output:**
```
PRONUNCIATION SHEET: My Song

[ Verse 1 ]
Hello (HEH-loh)  world (WURLD)  I (AY)  love (LUV)  you (YOO)

[ Chorus ]
Dream (DREEM)  the (DHUH)  dream (DREEM)  with (WITH)  me (MEE)
```

---

### 2. ARPAbet Text (`arpabet_text`)

Phoneme sequences per line using ARPAbet notation, words separated by `|`.

**Use case:** Input for speech synthesis engines, phoneme alignment tools, or custom TTS pipelines.

**Example output:**
```
# Verse 1
HH AH0 L OW1 | W ER1 L D | AY1 | L AH1 V | Y UW1

# Chorus
D R IY1 M | DH AH0 | D R IY1 M | W IH1 DH | M IY1
```

---

### 3. JSON (`json`)

Full structured export of the `LyricProject` object including all performance annotations.

**Use case:** Programmatic processing, backup, import into other tools, or API submission.

**Example output:**
```json
{
  "id": "abc-123",
  "title": "My Song",
  "displayMode": "simple",
  "sections": [
    {
      "id": "...",
      "label": "Verse 1",
      "lines": [
        {
          "id": "...",
          "words": [
            {
              "id": "...",
              "original": "hello",
              "pronunciationSpelling": "HEH-loh",
              "phonemes": [
                { "token": "HH", "displayMode": "arpabet" },
                { "token": "AH0", "displayMode": "arpabet" },
                { "token": "L", "displayMode": "arpabet" },
                { "token": "OW1", "displayMode": "arpabet" }
              ],
              "syllables": [...],
              "stress": "primary",
              "vowelStretch": 1.2,
              "breathBefore": false,
              "pauseAfter": 0
            }
          ]
        }
      ]
    }
  ]
}
```

---

### 4. AI Voice Prompt (`ai_voice_prompt`)

Natural-language instructions suitable for pasting into AI voice generation tools (e.g., ElevenLabs, Play.ht, Speechify Studio, ChatGPT voice customization).

**Use case:** Prompt engineering for AI voice actors.

**Example output:**
```
Voiceover prompt for: "My Song"
Speak the following lyrics with the indicated pronunciation and performance notes:

=== Verse 1 ===
"hello" → [HEH-loh] stress:primary, "world" → [WURLD] stress:primary

=== Chorus ===
"dream" → [DREEM] stress:primary (breath before), "the" → [DHUH] stress:unstressed
```

---

### 5. SSML (`ssml`)

Speech Synthesis Markup Language — the W3C standard for annotating text-to-speech output. Compatible with AWS Polly, Google Cloud TTS, Azure Cognitive Services, and web `SpeechSynthesisUtterance`.

**Use case:** Direct input to SSML-compatible TTS APIs.

**Example output:**
```xml
<speak>
  <!-- Verse 1 -->
  <phoneme alphabet="ipa" ph="HEH-loh">hello</phoneme> <phoneme alphabet="ipa" ph="WURLD">world</phoneme>
  <break strength="medium"/>
  <!-- Chorus -->
  <break strength="weak"/><phoneme alphabet="ipa" ph="DREEM">dream</phoneme>
  <break strength="medium"/>
</speak>
```

> **Note:** The current SSML implementation uses `pronunciationSpelling` as the `ph` attribute value. For production use with strict IPA-based engines, replace with true IPA tokens when available.

---

## Download Filename Convention

```
{project_title}_{format}.{ext}
```

| Format | Extension |
|--------|-----------|
| pronunciation_sheet | `.txt` |
| arpabet_text | `.txt` |
| json | `.json` |
| ai_voice_prompt | `.txt` |
| ssml | `.xml` |

---

## Extending Exports

To add a new export format:

1. Add the format literal to `VoiceExportFormat` in `src/types/lyrics.ts`.
2. Implement `exportMyFormat(project: LyricProject): string` in `src/utils/lyricExports.ts`.
3. Add the format + label to the `FORMAT_LABELS` maps in `LyricsDetailPage.tsx` and `ExportsPage.tsx`.
4. Add a case to the `runExport()` switch in both pages.
