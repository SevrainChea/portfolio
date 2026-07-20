# System Prompt + Context Filtering Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Improve LLM precision by using proper system prompts and filtering context by relevance score, resulting in more concise, structured answers that stay within the knowledge base.

**Architecture:** RAG service filters docs by similarity score (≥0.65) and returns relevance metadata. LLM service accepts a system_prompt parameter, formats context with relevance indicators, and sends system role separately (not embedded in user message). All three LLM providers (Ollama, Gemini, Groq) support the new signature. Chat router passes the system prompt.

**Tech Stack:** FastAPI, ChromaDB (similarity scoring), Ollama/Gemini/Groq SDKs (system role support)

---

### Task 1: Update RAG Service to Filter by Similarity Score

**Files:**

- Modify: `chatbot-backend/app/services/rag_service.py:55-83`

**Step 1: Read current retrieve method and understand ChromaDB query response**

Current: `retrieve(query: str, k: int = 3)` returns list of dicts with 'text' and 'source'

ChromaDB query response includes `distances` (similarity scores). We need to filter by threshold.

**Step 2: Add similarity threshold constant and update retrieve method**

```python
RELEVANCE_THRESHOLD = 0.65  # Only include docs with similarity >= this

def retrieve(self, query: str, k: int = 5) -> List[Dict[str, str]]:
    """
    Retrieve relevant documents for a query

    Args:
        query: Search query
        k: Number of results to retrieve (before filtering)

    Returns:
        List of dicts with 'text', 'source', and 'relevance' keys
    """
    if self.collection.count() == 0:
        return []

    results = self.collection.query(
        query_texts=[query],
        n_results=min(k, self.collection.count())
    )

    # Format results with relevance scores
    documents = []
    if results["documents"] and results["documents"][0]:
        distances = results["distances"][0] if results.get("distances") else []
        for i, doc in enumerate(results["documents"][0]):
            # Convert distance to similarity (1 - distance for L2 norm)
            relevance = 1 - distances[i] if i < len(distances) else 1.0

            # Filter by threshold
            if relevance >= RELEVANCE_THRESHOLD:
                documents.append({
                    "text": doc,
                    "source": results["metadatas"][0][i]["source"] if results["metadatas"] else "unknown",
                    "relevance": round(relevance, 2)
                })

    return documents
```

**Step 3: Edit the file with this change**

Replace lines 55-83 in rag_service.py

---

### Task 2: Update LLMProvider Base Class with System Prompt Support

**Files:**

- Modify: `chatbot-backend/app/services/llm_service.py:1-39`

**Step 1: Add system prompt constant and update \_build_prompt method**

```python
SYSTEM_PROMPT = """You are a helpful AI assistant representing Sevrain CHEA's portfolio.

**Guidelines:**
- ONLY use the provided context to answer questions
- If information is not in the context, clearly say so
- Format answers with structure: use short paragraphs and bullet points for key details
- Be concise—avoid verbose explanations
- When listing items (skills, projects, etc.), use bullets with brief descriptions"""


class LLMProvider(ABC):
    """Abstract base class for LLM providers"""

    def _build_prompt(self, prompt: str, context: List[Dict[str, str]]) -> str:
        """Build the user message with formatted context (system prompt handled separately)"""
        context_text = "\n\n".join([
            f"Context {i+1} [relevance: {ctx.get('relevance', 'N/A')} | from: {ctx.get('source', 'unknown')}]:\n{ctx['text']}"
            for i, ctx in enumerate(context)
        ])
        return f"""{context_text}

Question: {prompt}"""

    @abstractmethod
    def generate(self, prompt: str, context: List[Dict[str, str]]) -> str:
        """Generate a response given a prompt and context"""
        pass

    @abstractmethod
    async def generate_stream(self, prompt: str, context: List[Dict[str, str]]) -> AsyncGenerator[str, None]:
        """Stream tokens as an async generator"""
        pass

    @abstractmethod
    def get_model_name(self) -> str:
        """Return the model name being used"""
        pass
```

**Step 2: Edit llm_service.py lines 1-39**

Update the LLMProvider class with the new system prompt constant and updated \_build_prompt method. Note: context parameter type changes from `List[str]` to `List[Dict[str, str]]`.

---

### Task 3: Update OllamaProvider

**Files:**

- Modify: `chatbot-backend/app/services/llm_service.py:42-81`

**Step 1: Add system role to generate and generate_stream methods**

```python
class OllamaProvider(LLMProvider):
    """Ollama LLM provider for local development"""

    def __init__(self, model: str = None, base_url: str = None):
        self.model = model or settings.ollama_model
        self.base_url = base_url or settings.ollama_base_url

    def generate(self, prompt: str, context: List[Dict[str, str]]) -> str:
        """Generate response using Ollama"""
        full_prompt = self._build_prompt(prompt, context)

        try:
            response = ollama.chat(
                model=self.model,
                messages=[
                    {'role': 'system', 'content': SYSTEM_PROMPT},
                    {'role': 'user', 'content': full_prompt}
                ]
            )
            return response['message']['content']
        except Exception as e:
            logger.exception("Ollama generation failed")
            raise Exception(f"Ollama generation failed: {str(e)}")

    async def generate_stream(self, prompt: str, context: List[Dict[str, str]]) -> AsyncGenerator[str, None]:
        full_prompt = self._build_prompt(prompt, context)

        try:
            client = ollama.AsyncClient(host=self.base_url)
            async for chunk in await client.chat(
                model=self.model,
                messages=[
                    {'role': 'system', 'content': SYSTEM_PROMPT},
                    {'role': 'user', 'content': full_prompt}
                ],
                stream=True
            ):
                content = chunk['message']['content']
                if content:
                    yield content
        except Exception as e:
            logger.exception("Ollama streaming failed")
            raise Exception(f"Ollama streaming failed: {str(e)}")

    def get_model_name(self) -> str:
        return f"ollama/{self.model}"
```

**Step 2: Edit llm_service.py lines 42-81**

---

### Task 4: Update GeminiProvider

**Files:**

- Modify: `chatbot-backend/app/services/llm_service.py:84-121`

**Step 1: Add system instruction to Gemini provider**

```python
class GeminiProvider(LLMProvider):
    """Google Gemini LLM provider for production"""

    def __init__(self, api_key: str = None, model: str = None):
        self.api_key = api_key or settings.gemini_api_key
        self.model_name = model or settings.gemini_model

        if not self.api_key:
            raise ValueError("Gemini API key is required")

        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel(
            self.model_name,
            system_instruction=SYSTEM_PROMPT
        )

    def generate(self, prompt: str, context: List[Dict[str, str]]) -> str:
        """Generate response using Gemini"""
        full_prompt = self._build_prompt(prompt, context)

        try:
            response = self.model.generate_content(full_prompt)
            return response.text
        except Exception as e:
            logger.exception("Gemini generation failed")
            raise Exception(f"Gemini generation failed: {str(e)}")

    async def generate_stream(self, prompt: str, context: List[Dict[str, str]]) -> AsyncGenerator[str, None]:
        full_prompt = self._build_prompt(prompt, context)

        try:
            response = await self.model.generate_content_async(full_prompt, stream=True)
            async for chunk in response:
                if chunk.text:
                    yield chunk.text
        except Exception as e:
            logger.exception("Gemini streaming failed")
            raise Exception(f"Gemini streaming failed: {str(e)}")

    def get_model_name(self) -> str:
        return f"gemini/{self.model_name}"
```

**Step 2: Edit llm_service.py lines 84-121**

---

### Task 5: Update GroqProvider

**Files:**

- Modify: `chatbot-backend/app/services/llm_service.py:124-169`

**Step 1: Add system role to Groq provider**

```python
class GroqProvider(LLMProvider):
    """Groq LLM provider — free tier with 14,400 RPD"""

    def __init__(self, api_key: str = None, model: str = None):
        self.api_key = api_key or settings.groq_api_key
        self.model_name = model or settings.groq_model

        if not self.api_key:
            raise ValueError("Groq API key is required")

        self.client = Groq(api_key=self.api_key)
        self.async_client = AsyncGroq(api_key=self.api_key)

    def generate(self, prompt: str, context: List[Dict[str, str]]) -> str:
        """Generate response using Groq"""
        full_prompt = self._build_prompt(prompt, context)

        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": full_prompt}
                ]
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.exception("Groq generation failed")
            raise Exception(f"Groq generation failed: {str(e)}")

    async def generate_stream(self, prompt: str, context: List[Dict[str, str]]) -> AsyncGenerator[str, None]:
        full_prompt = self._build_prompt(prompt, context)

        try:
            stream = await self.async_client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": full_prompt}
                ],
                stream=True
            )
            async for chunk in stream:
                content = chunk.choices[0].delta.content
                if content:
                    yield content
        except Exception as e:
            logger.exception("Groq streaming failed")
            raise Exception(f"Groq streaming failed: {str(e)}")

    def get_model_name(self) -> str:
        return f"groq/{self.model_name}"
```

**Step 2: Edit llm_service.py lines 124-169**

---

### Task 6: Update Chat Router to Pass Filtered Context

**Files:**

- Modify: `chatbot-backend/app/routers/chat.py:15-47` (non-streaming)
- Modify: `chatbot-backend/app/routers/chat.py:50-94` (streaming)

**Step 1: Update non-streaming endpoint**

```python
@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat endpoint that uses RAG to answer questions about the portfolio
    """
    try:
        # Retrieve relevant context from vector store (filtered by relevance)
        context_docs = rag_service.retrieve(request.message, k=5)

        # Extract sources (relevance filtering may result in fewer docs)
        sources = [doc["source"] for doc in context_docs]

        # Generate response using LLM
        result = llm_service.generate_response(
            prompt=request.message,
            context=context_docs  # Pass full dicts with relevance scores
        )

        # Generate or use existing conversation ID
        conversation_id = request.conversation_id or str(uuid.uuid4())

        return ChatResponse(
            response=result["response"],
            conversation_id=conversation_id,
            sources=list(set(sources)),  # Remove duplicates
            model_used=result["model_used"]
        )

    except Exception as e:
        logger.exception("Chat endpoint failed")
        logger.error(e)
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")
```

**Step 2: Update streaming endpoint**

```python
@router.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    """
    Streaming chat endpoint using Server-Sent Events
    Yields chunk events for each token, then a done event with metadata.
    """
    async def event_generator():
        try:
            # Retrieve context in a thread to avoid blocking the event loop
            context_docs = await asyncio.to_thread(
                rag_service.retrieve, request.message, 5
            )
            sources = list(set(doc["source"] for doc in context_docs))
            conversation_id = request.conversation_id or str(uuid.uuid4())
            model_used = llm_service.provider.get_model_name()

            async for token in llm_service.generate_response_stream(
                prompt=request.message,
                context=context_docs  # Pass full dicts with relevance scores
            ):
                event = json.dumps({"type": "chunk", "content": token})
                yield f"data: {event}\n\n"

            done_event = json.dumps({
                "type": "done",
                "conversation_id": conversation_id,
                "sources": sources,
                "model_used": model_used
            })
            yield f"data: {done_event}\n\n"

        except Exception as e:
            logger.exception("Streaming chat failed")
            error_event = json.dumps({"type": "error", "message": str(e)})
            yield f"data: {error_event}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
    )
```

**Step 3: Edit chat.py with both updates**

---

### Task 7: Update LLMService to Accept Context Dicts

**Files:**

- Modify: `chatbot-backend/app/services/llm_service.py:193-206`

**Step 1: Update service method signatures**

```python
class LLMService:
    """Service to manage LLM provider selection"""

    def __init__(self):
        self.provider = self._initialize_provider()

    def _initialize_provider(self) -> LLMProvider:
        """Initialize the appropriate LLM provider based on settings"""

        if settings.llm_provider == "ollama":
            logger.info("Using Ollama with model: {}", settings.ollama_model)
            return OllamaProvider()
        elif settings.llm_provider == "gemini":
            logger.info("Using Gemini with model: {}", settings.gemini_model)
            return GeminiProvider()
        elif settings.llm_provider == "groq":
            logger.info("Using Groq with model: {}", settings.groq_model)
            return GroqProvider()
        else:
            raise ValueError(f"Unknown LLM provider: {settings.llm_provider}")

    def generate_response(self, prompt: str, context: List[Dict[str, str]]) -> Dict[str, str]:
        """Generate a response using the configured provider"""

        response = self.provider.generate(prompt, context)

        return {
            "response": response,
            "model_used": self.provider.get_model_name()
        }

    async def generate_response_stream(self, prompt: str, context: List[Dict[str, str]]) -> AsyncGenerator[str, None]:
        """Stream tokens from the configured provider"""
        async for token in self.provider.generate_stream(prompt, context):
            yield token


# Global LLM service instance
llm_service = LLMService()
```

**Step 2: Edit llm_service.py lines 172-210**

---

## Plan Summary

**Key Changes:**

1. RAG service: Filter by similarity ≥0.65, include relevance scores
2. LLM service: Add system prompt constant, format context with relevance metadata
3. All 3 providers: Add system role (separate from user message)
4. Chat router: Retrieve k=5 (instead of k=3), pass context dicts with relevance

**Expected Outcome:** LLM receives explicit system instructions separately, sees relevance scores as hints, uses only portfolio context, produces concise/structured answers.
