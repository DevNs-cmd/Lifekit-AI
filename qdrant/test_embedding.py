import os
import sys
from dotenv import load_dotenv
from openai import OpenAI, AuthenticationError

load_dotenv()

api_key = os.getenv("AI_SERVICE_OPENAI_API_KEY")

if not api_key or not api_key.strip():
    print("Error: AI_SERVICE_OPENAI_API_KEY environment variable is missing or empty in .env")
    sys.exit(1)

print("AI_SERVICE_OPENAI_API_KEY loaded successfully.")

client = OpenAI(api_key=api_key)

text = "LifeKit test embedding"

try:
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    embedding = response.data[0].embedding
    print("Embedding created successfully!")
    print("Vector length:", len(embedding))
    print("First 5 values:", embedding[:5])
except AuthenticationError as e:
    print("OpenAI AuthenticationError (401): The provided API key in AI_SERVICE_OPENAI_API_KEY is invalid, expired, or incorrect.")
    sys.exit(401)
except Exception as e:
    print(f"Error generating embedding: {e}")
    sys.exit(1)