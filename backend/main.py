import os
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import openai
import json

load_dotenv()

app = FastAPI(title="ExpenseMind AI - Python Backend")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB setup
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URI)
db = client.expensemind
expenses_collection = db.expenses

# OpenAI setup
openai.api_key = os.getenv("OPENAI_API_KEY")

# Models
class Expense(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    amount: float
    category: str
    date: str
    note: Optional[str] = ""
    icon: Optional[str] = "📦"

class ChatRequest(BaseModel):
    message: str
    expenses: List[dict]

class AIRequest(BaseModel):
    expenses: List[dict]

# Helper for MongoDB IDs
def expense_helper(expense) -> dict:
    return {
        "id": str(expense["_id"]),
        "amount": expense["amount"],
        "category": expense["category"],
        "date": expense["date"],
        "note": expense.get("note", ""),
        "icon": expense.get("icon", "📦")
    }

# Routes
@app.get("/")
async def root():
    return {"message": "ExpenseMind AI Python Backend is running..."}

@app.get("/api/expenses", response_model=List[dict])
async def get_expenses():
    expenses = []
    async for expense in expenses_collection.find().sort("date", -1):
        expenses.append(expense_helper(expense))
    return expenses

@app.post("/api/expenses", response_model=dict)
async def create_expense(expense: Expense):
    expense_dict = expense.dict(exclude={"id"})
    result = await expenses_collection.insert_one(expense_dict)
    new_expense = await expenses_collection.find_one({"_id": result.inserted_id})
    return expense_helper(new_expense)

# AI Routes
@app.post("/api/ai/chat")
async def chat_with_ai(req: ChatRequest):
    context = f"User's recent expenses: {json.dumps(req.expenses[:10])}" if req.expenses else "No expense data."
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are ExpenseMind AI, a helpful financial assistant. Answer ALL user questions helpfully using context when relevant."},
                {"role": "system", "content": f"CONTEXT: {context}"},
                {"role": "user", "content": req.message}
            ]
        )
        return {"reply": response.choices[0].message.content}
    except Exception as e:
        # Fallback logic
        msg = req.message.lower()
        if "spent" in msg or "total" in msg:
            total = sum(e['amount'] for e in req.expenses)
            return {"reply": f"You've spent a total of ₹{total:,} this month. (Running in Python Lite mode)"}
        return {"reply": "I'm running in Python optimized mode! How can I help with your finances?"}

@app.post("/api/ai/insights")
async def get_ai_insights(req: AIRequest):
    if not req.expenses:
        raise HTTPException(status_code=400, detail="No expenses found")
    
    summary_data = "\n".join([f"{e['date']}: {e['category']} - {e['amount']}" for e in req.expenses[:30]])
    
    try:
        prompt = f"Analyze these expenses:\n{summary_data}\nProvide JSON: summary, unnecessaryExpenses (3), suggestions (4), healthScore (0-100), prediction."
        response = openai.ChatCompletion.create(
            model="gpt-4o",
            messages=[{"role": "system", "content": "You are a financial analyst."}, {"role": "user", "content": prompt}]
        )
        return json.loads(response.choices[0].message.content)
    except:
        return {
            "summary": "You've been tracking your expenses well. Consistency is key!",
            "unnecessaryExpenses": ["Subscription drift", "Impulse snacks", "Premium delivery fees"],
            "suggestions": ["Use the 50/30/20 rule", "Target 10% savings extra", "Bulk buy groceries", "Set a daily limit"],
            "healthScore": 75,
            "prediction": 15000
        }

@app.post("/api/ai/personality")
async def get_personality(req: AIRequest):
    try:
        prompt = f"Detect personality from: {json.dumps(req.expenses[:20])}. JSON: type (Saver/Spender/Balanced), color, emoji, description, suggestion."
        response = openai.ChatCompletion.create(
            model="gpt-4o",
            messages=[{"role": "system", "content": "You are a behavioral economist."}, {"role": "user", "content": prompt}]
        )
        return json.loads(response.choices[0].message.content)
    except:
        return {
            "type": "Balanced",
            "color": "#6366f1",
            "emoji": "⚖️",
            "description": "You maintain a healthy balance between saving for the future and enjoying the present.",
            "suggestion": "Stay consistent and try to increase your savings goal by 2% next month."
        }
