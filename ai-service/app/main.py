from fastapi import FastAPI, Depends
from langchain_google_genai import ChatGoogleGenerativeAI
from app.config import settings
from app.security import verify_internal_key

app = FastAPI(title="Sarkari Yojana Finder - AI Service")


def extract_text(content) -> str:
    """
    Newer langchain-google-genai versions sometimes return content as a
    string, and sometimes as a list of content blocks like
    [{"type": "text", "text": "..."}]. This normalizes both to plain text.
    """
    if isinstance(content, str):
        return content

    if isinstance(content, list):
        parts = []
        for block in content:
            if isinstance(block, dict) and block.get("type") == "text":
                parts.append(block.get("text", ""))
            elif isinstance(block, str):
                parts.append(block)
        return "".join(parts)

    return str(content)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/llm-test", dependencies=[Depends(verify_internal_key)])
async def llm_test():
    llm = ChatGoogleGenerativeAI(
        model=settings.gemini_model,
        google_api_key=settings.gemini_api_key,
    )
    response = await llm.ainvoke("Say hello in one short sentence, mentioning India.")
    return {"reply": extract_text(response.content)}