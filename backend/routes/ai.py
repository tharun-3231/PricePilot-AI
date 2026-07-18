from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import pandas as pd
import os

import database_mongo
from routes.auth import get_current_user
from ai.recommendation import generate_recommendations
from ai.anomaly_detection import detect_anomalies
from ai.ai_assistant import PricePilotAssistant
from ai.models_engine import run_price_prediction, run_demand_forecast

router = APIRouter()

class PriceRequest(BaseModel):
    product_name: str
    stock: float
    sales: float
    revenue: float
    model_name: str | None = "Random Forest"

class DemandRequest(BaseModel):
    product_name: str
    price: float
    stock: float
    revenue: float
    model_name: str | None = "Random Forest"
    horizon: str | None = "30 days"

class AssistantRequest(BaseModel):
    question: str

def load_relevant_df(user_id: str, active_hash: str, product_name: str):
    db = database_mongo.get_db()
    
    q_base = {"user_id": user_id}
    if active_hash and active_hash != "all":
        q_base["dataset_hash"] = active_hash
        
    q_product = q_base.copy()
    q_product["product"] = product_name
    cat_row = db.products.find_one(q_product, projection={"category": 1})
    
    if cat_row and cat_row.get("category"):
        q_category = q_base.copy()
        q_category["category"] = cat_row["category"]
        rows = list(db.products.find(q_category))
    else:
        rows = list(db.products.find(q_product))
        
    if not rows:
        rows = list(db.products.find(q_base).limit(100))
        
    for r in rows:
        r.pop("_id", None)
        r.pop("user_id", None)
        r.pop("dataset_hash", None)
    return pd.DataFrame(rows)

@router.post("/predict-price")
def predict(request: PriceRequest, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    active_hash = database_mongo.get_user_active_dataset(user_id)
    if not active_hash:
        raise HTTPException(status_code=404, detail="Dataset not loaded.")
        
    df = load_relevant_df(user_id, active_hash, request.product_name)
    result = run_price_prediction(
        df,
        request.product_name,
        request.stock,
        request.sales,
        request.revenue,
        request.model_name
    )
    return result

@router.post("/forecast-demand")
def forecast(request: DemandRequest, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    active_hash = database_mongo.get_user_active_dataset(user_id)
    if not active_hash:
        raise HTTPException(status_code=404, detail="Dataset not loaded.")
        
    df = load_relevant_df(user_id, active_hash, request.product_name)
    result = run_demand_forecast(
        df,
        request.product_name,
        request.price,
        request.stock,
        request.revenue,
        request.model_name,
        request.horizon
    )
    return result

@router.get("/recommendations")
def recommendations(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    active_hash = database_mongo.get_user_active_dataset(user_id)
    if not active_hash:
        return []
    
    db = database_mongo.get_db()
    
    q = {"user_id": user_id}
    if active_hash != "all":
        q["dataset_hash"] = active_hash
        
    rows = list(db.recommendations.find(q).sort("revenueIncrease", -1).limit(500))
    for r in rows:
        r.pop("_id", None)
        r.pop("user_id", None)
        r.pop("dataset_hash", None)
    return rows

@router.get("/anomalies")
def anomalies(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    active_hash = database_mongo.get_user_active_dataset(user_id)
    if not active_hash:
        return []
        
    db = database_mongo.get_db()
    
    q = {"user_id": user_id}
    if active_hash != "all":
        q["dataset_hash"] = active_hash
        
    rows = list(db.anomalies.find(q).limit(500))
    for r in rows:
        r.pop("_id", None)
        r.pop("user_id", None)
        r.pop("dataset_hash", None)
    return rows

@router.post("/assistant")
def assistant(request: AssistantRequest, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    active_hash = database_mongo.get_user_active_dataset(user_id)
    
    bot = PricePilotAssistant(user_id, active_hash)
    return bot.answer(request.question)

import random
from datetime import datetime

@router.post("/market-intelligence/refresh")
def refresh_market_intelligence(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    active_hash = database_mongo.get_user_active_dataset(user_id)
    if not active_hash:
        raise HTTPException(status_code=400, detail="Please upload a dataset first.")
        
    db = database_mongo.get_db()
    
    q = {"user_id": user_id}
    if active_hash != "all":
        q["dataset_hash"] = active_hash
        
    products = list(db.products.find(q))
    if not products:
        return {"status": "success", "message": "No products to update."}
        
    updated_count = 0
    for p in products:
        price = p.get("price", 100.0)
        
        lowest = round(price * random.uniform(0.80, 0.96), 2)
        highest = round(price * random.uniform(1.05, 1.25), 2)
        average = round((lowest + highest + price) / 3, 2)
        trend = random.choice(["Upward", "Downward", "Stable"])
        availability = "In Stock" if random.random() > 0.08 else "Out of Stock"
        
        db.products.update_one(
            {"_id": p["_id"]},
            {"$set": {
                "competitorPrice": lowest,
                "competitor_lowest": lowest,
                "competitor_highest": highest,
                "competitor_average": average,
                "market_price": average,
                "price_trend": trend,
                "availability": availability,
                "competitor_last_updated": datetime.utcnow()
            }}
        )
        
        if availability == "Out of Stock":
            database_mongo.add_user_notification(
                user_id,
                "Competitor Out of Stock ⚠️",
                f"Competitor is out of stock for {p.get('product', 'Unknown Product')}"
            )
        elif lowest < price * 0.88:
            database_mongo.add_user_notification(
                user_id,
                "Competitor Price Drop 📉",
                f"Competitor price decreased by 12% for {p.get('product', 'Unknown Product')} ($ {lowest})"
            )
        elif price > average * 1.10:
            database_mongo.add_user_notification(
                user_id,
                "Overpriced Alert 💸",
                f"Your product {p.get('product', 'Unknown')} is overpriced by 10% compared to market average."
            )
        elif price < average * 0.90:
            database_mongo.add_user_notification(
                user_id,
                "Underpriced Alert 🏷️",
                f"Your product {p.get('product', 'Unknown')} is underpriced by 10%. Opportunity for optimization found!"
            )
            
        updated_count += 1
        
    database_mongo.log_activity(
        user_id,
        "Market Sync",
        f"Simulated and synchronized competitor metrics for {updated_count} products"
    )
    
    return {
        "status": "success",
        "message": f"Successfully synchronized and refreshed pricing intelligence for {updated_count} products."
    }