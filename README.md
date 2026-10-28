# UMD Scheduling Chatbot 2.0

## Overview

The UMD Scheduling Chatbot answers University of Maryland students' questions about courses, sections, instructors, seats, prerequisites, and gen eds. It is live at <https://umd-chatbot.vercel.app/>.

It is a Next.js app. Course data comes from Qdrant collections that the [UMD-Scheduling-Chat-Bot](https://github.com/aluthra23/UMD-Scheduling-Chat-Bot) pipeline scrapes from UMD's websites and keeps up to date. Gemini writes the answers.

## How a question is answered

1. **Choose a term.** `/api/collections` lists the term collections in Qdrant (`YYYY01` spring, `YYYY08` fall), newest first, along with when the pipeline last synced each one. The chat page shows that sync time for the selected term.
2. **Embed the question in the browser.** Transformers.js runs `sentence-transformers/all-MiniLM-L6-v2` (FP32, mean pooling, normalized, 384 dimensions). The pipeline embeds documents with the same model, so query and document vectors match exactly. The first visit downloads the model, about 90 MB, which the browser then caches.
3. **Retrieve course data** (`src/app/QdrantManager.ts`):
   - When the question names course codes (`CMSC131`, `cmsc 131`, up to four), every document for each course is fetched, using one filtered query per course.
   - Otherwise, it runs a semantic search for the 30 closest documents. For follow-ups like "who teaches it?", documents for courses named in the student's last two messages are added.
   - If a "course code" matches nothing (for example "with 300"), it falls back to semantic search.
4. **Generate the answer.** Gemini 2.5 Flash gets a system instruction naming the selected term and telling it to answer only from the retrieved data. It also gets the recent conversation as proper user and model turns, with error replies left out. The answer streams back to the browser.

`/api/chat` validates every request: message count and length, the embedding's size and contents, and the term ID. It also applies a best-effort rate limit of 20 messages per minute per client, held in each server instance's memory.

## Development

Create `.env.local` with:

```env
QDRANT_LINK=https://...
QDRANT_API_KEY=...
GOOGLE_API_KEY=...
```

Then:

```bash
npm install
npm run dev
```

## Tests

```bash
npm test             # unit tests for retrieval, history, and request validation
npm run build        # type-check, lint, and production build
npm run smoke-test   # end-to-end questions against a running app (needs all three env vars)
```

## Changing the embedding model

Document and query embeddings must use the same model artifact, precision, pooling, normalization, and dimensions. Don't change only the browser side. To switch models, for example to a quantized MiniLM that downloads in about 20–30 MB:

1. Configure both FastEmbed (in the pipeline) and Transformers.js (in `src/app/embeddings.ts`) to use the same model.
2. Re-sync every Qdrant collection the app uses.
3. Test course-code and natural-language questions before deploying.

## Contributions

Contributions are welcome! Fork the repository and open a pull request. Please include tests for your changes.

## License

This project is licensed under the [MIT License](LICENSE).
