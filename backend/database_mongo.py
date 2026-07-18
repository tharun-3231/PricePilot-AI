import os
from datetime import datetime
from pymongo import MongoClient, ASCENDING, DESCENDING
from bson import ObjectId
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/pricepilot")
DB_NAME = "pricepilot"

_client = None

def get_mongo_client():
    global _client
    if _client is None:
        _client = MongoClient(MONGODB_URI)
    return _client

def get_db():
    client = get_mongo_client()
    return client[DB_NAME]

def init_db():
    db = get_db()
    
    # Create indexes
    db.users.create_index("email", unique=True)
    db.datasets.create_index([("user_id", ASCENDING), ("file_hash", ASCENDING)])
    
    # Compound indexes for fast multi-tenant queries
    db.products.create_index([("user_id", ASCENDING), ("dataset_hash", ASCENDING)])
    db.products.create_index([("user_id", ASCENDING), ("dataset_hash", ASCENDING), ("product", ASCENDING)])
    db.products.create_index([("user_id", ASCENDING), ("dataset_hash", ASCENDING), ("category", ASCENDING)])
    db.products.create_index([("user_id", ASCENDING), ("dataset_hash", ASCENDING), ("price", ASCENDING)])
    
    db.recommendations.create_index([("user_id", ASCENDING), ("dataset_hash", ASCENDING)])
    db.anomalies.create_index([("user_id", ASCENDING), ("dataset_hash", ASCENDING)])
    
    db.notifications.create_index([("user_id", ASCENDING), ("created_at", DESCENDING)])
    db.activity_logs.create_index([("user_id", ASCENDING), ("timestamp", DESCENDING)])
    
    db.predictions.create_index([("user_id", ASCENDING), ("dataset_id", ASCENDING)])
    db.forecasts.create_index([("user_id", ASCENDING), ("dataset_id", ASCENDING)])
    db.reports.create_index([("user_id", ASCENDING), ("dataset_id", ASCENDING)])
    
    print("[MongoDB] Database initialized and indexes created.")

# Initialize indexes on load
init_db()

# --- HELPER FUNCTIONS ---

def get_user_active_dataset(user_id):
    db = get_db()
    user = db.users.find_one({"_id": ObjectId(user_id)})
    return user.get("active_dataset_hash") if user else None

def set_user_active_dataset(user_id, file_hash):
    db = get_db()
    db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"active_dataset_hash": file_hash}}
    )

def update_dataset_status(user_id, file_hash, status, progress, error_message=None, rows_count=0, columns_list=None, cleaning_report=None, stats=None, filename=None):
    db = get_db()
    dataset = db.datasets.find_one({"user_id": str(user_id), "file_hash": file_hash})
    
    if dataset:
        update_fields = {}
        if status is not None:
            update_fields["status"] = status
        if progress is not None:
            update_fields["progress"] = progress
        if error_message is not None:
            update_fields["error_message"] = error_message
        if rows_count:
            update_fields["rows_count"] = rows_count
        if columns_list is not None:
            update_fields["columns_list"] = columns_list
        if cleaning_report is not None:
            update_fields["cleaning_report"] = cleaning_report
        if stats is not None:
            update_fields["stats"] = stats
        if filename is not None:
            update_fields["filename"] = filename
            
        update_fields["updated_at"] = datetime.utcnow()
        
        db.datasets.update_one(
            {"_id": dataset["_id"]},
            {"$set": update_fields}
        )
    else:
        new_doc = {
            "user_id": str(user_id),
            "file_hash": file_hash,
            "filename": filename or "dataset.csv",
            "status": status,
            "progress": progress,
            "error_message": error_message,
            "rows_count": rows_count,
            "columns_list": columns_list or [],
            "cleaning_report": cleaning_report or {},
            "stats": stats or {},
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        db.datasets.insert_one(new_doc)

def get_dataset_metadata(user_id, file_hash):
    db = get_db()
    doc = db.datasets.find_one({"user_id": str(user_id), "file_hash": file_hash})
    if doc:
        doc["_id"] = str(doc["_id"])
    return doc

def clear_dataset_products(user_id, file_hash):
    db = get_db()
    db.products.delete_many({"user_id": str(user_id), "dataset_hash": file_hash})
    db.recommendations.delete_many({"user_id": str(user_id), "dataset_hash": file_hash})
    db.anomalies.delete_many({"user_id": str(user_id), "dataset_hash": file_hash})

def bulk_insert_products(user_id, products_list, dataset_hash):
    if not products_list:
        return
    db = get_db()
    docs = []
    for p in products_list:
        docs.append({
            "user_id": str(user_id),
            "dataset_hash": dataset_hash,
            "id": p.get("id"),
            "product": p.get("product", "Unknown"),
            "category": p.get("category", "General"),
            "price": float(p.get("price", 0.0) or 0.0),
            "stock": float(p.get("stock", 0.0) or 0.0),
            "sales": float(p.get("sales", 0.0) or 0.0),
            "revenue": float(p.get("revenue", 0.0) or 0.0),
            "profit": float(p.get("profit", 0.0) or 0.0),
            "margin": float(p.get("margin", 30.0) or 30.0),
            "brand": p.get("brand", "Unknown"),
            "sku": p.get("sku", ""),
            "description": p.get("description", ""),
            "costPrice": float(p.get("costPrice", 0.0) or 0.0),
            "competitorPrice": float(p.get("competitorPrice", 0.0) or 0.0),
            "image": p.get("image", ""),
            "month": p.get("month", "Jan")
        })
    # Perform batch insert
    db.products.insert_many(docs)

def bulk_insert_recommendations(user_id, recs_list, dataset_hash):
    if not recs_list:
        return
    db = get_db()
    docs = []
    for r in recs_list:
        docs.append({
            "user_id": str(user_id),
            "dataset_hash": dataset_hash,
            "product": r.get("product"),
            "price": float(r.get("price", 0.0) or 0.0),
            "suggestedPrice": float(r.get("suggestedPrice", 0.0) or 0.0),
            "recommendation": r.get("recommendation", "Maintain Price"),
            "revenueIncrease": float(r.get("revenueIncrease", 0.0) or 0.0),
            "expectedProfit": float(r.get("expectedProfit", 0.0) or 0.0),
            "confidence": int(r.get("confidence", 80) or 80),
            "reason": r.get("reason", ""),
            "risk": r.get("risk", "Low"),
            "priority": r.get("priority", "Low")
        })
    db.recommendations.insert_many(docs)

def bulk_insert_anomalies(user_id, anoms_list, dataset_hash):
    if not anoms_list:
        return
    db = get_db()
    docs = []
    for p in anoms_list:
        docs.append({
            "user_id": str(user_id),
            "dataset_hash": dataset_hash,
            "id": p.get("id"),
            "product": p.get("product", "Unknown"),
            "category": p.get("category", "General"),
            "price": float(p.get("price", 0.0) or 0.0),
            "stock": float(p.get("stock", 0.0) or 0.0),
            "sales": float(p.get("sales", 0.0) or 0.0),
            "revenue": float(p.get("revenue", 0.0) or 0.0),
            "profit": float(p.get("profit", 0.0) or 0.0),
            "margin": float(p.get("margin", 30.0) or 30.0),
            "brand": p.get("brand", "Unknown"),
            "sku": p.get("sku", ""),
            "description": p.get("description", ""),
            "costPrice": float(p.get("costPrice", 0.0) or 0.0),
            "competitorPrice": float(p.get("competitorPrice", 0.0) or 0.0),
            "image": p.get("image", ""),
            "month": p.get("month", "Jan")
        })
    db.anomalies.insert_many(docs)

def calculate_database_stats(user_id, file_hash):
    db = get_db()
    
    match_criteria = {"user_id": str(user_id)}
    if file_hash and file_hash != "all":
        match_criteria["dataset_hash"] = file_hash
        
    pipeline = [
        {"$match": match_criteria},
        {"$group": {
            "_id": None,
            "totalProducts": {"$sum": 1},
            "totalRevenue": {"$sum": "$revenue"},
            "totalSales": {"$sum": "$sales"},
            "averagePrice": {"$avg": "$price"},
            "highestPrice": {"$max": "$price"},
            "lowestPrice": {"$min": "$price"},
            "averageRevenue": {"$avg": "$revenue"},
            "profit": {"$sum": "$profit"},
            "inventoryValue": {"$sum": {"$multiply": ["$price", "$stock"]}},
            "lowStock": {"$sum": {"$cond": [{"$lt": ["$stock", 20]}, 1, 0]}},
            "competitorAlerts": {"$sum": {"$cond": [{"$lt": ["$competitorPrice", "$price"]}, 1, 0]}}
        }}
    ]
    
    results = list(db.products.aggregate(pipeline))
    if not results:
        return {}
        
    stats = results[0]
    stats.pop("_id", None)
    
    # Round float fields
    for k in ["averagePrice", "highestPrice", "lowestPrice", "averageRevenue", "totalRevenue", "profit", "inventoryValue"]:
        if stats.get(k) is not None:
            stats[k] = round(float(stats[k]), 2)
        else:
            stats[k] = 0.0
            
    for k in ["totalProducts", "totalSales", "lowStock", "competitorAlerts"]:
        if stats.get(k) is not None:
            stats[k] = int(stats[k])
        else:
            stats[k] = 0
            
    # Calculate price changes simulation metric (duplicate products/categories)
    # Simply count categories with more than 1 item
    cat_pipeline = [
        {"$match": match_criteria},
        {"$group": {"_id": "$category", "count": {"$sum": 1}}}
    ]
    cats = list(db.products.aggregate(cat_pipeline))
    dups = sum(max(0, c["count"] - 1) for c in cats)
    stats["priceChanges"] = dups
    
    stats["predictionAccuracy"] = 92
    stats["forecastAccuracy"] = 89
    
    # Monthly Analytics
    month_pipeline = [
        {"$match": match_criteria},
        {"$group": {
            "_id": "$month",
            "Revenue": {"$sum": "$revenue"},
            "Sales": {"$sum": "$sales"},
            "Profit": {"$sum": "$profit"}
        }}
    ]
    monthly_rows = list(db.products.aggregate(month_pipeline))
    
    # Map months order
    months_order = {"Jan":1, "Feb":2, "Mar":3, "Apr":4, "May":5, "Jun":6, "Jul":7, "Aug":8, "Sep":9, "Oct":10, "Nov":11, "Dec":12}
    
    monthly_analytics = []
    for mr in monthly_rows:
        month = mr["_id"] or "Jan"
        rev = round(float(mr["Revenue"] or 0.0), 2)
        monthly_analytics.append({
            "month": month,
            "Revenue": rev,
            "Sales": int(mr["Sales"] or 0),
            "Profit": round(float(mr["Profit"] or 0.0), 2),
            "Forecast": round(rev * 1.15, 2)
        })
        
    # Sort monthly analytics by month order
    monthly_analytics.sort(key=lambda x: months_order.get(x["month"][:3], 99))
    stats["monthlyAnalytics"] = monthly_analytics
    
    return stats

def log_activity(user_id, action, details):
    db = get_db()
    db.activity_logs.insert_one({
        "user_id": str(user_id),
        "action": action,
        "details": details,
        "timestamp": datetime.utcnow()
    })

def add_user_notification(user_id, title, message):
    db = get_db()
    db.notifications.insert_one({
        "user_id": str(user_id),
        "title": title,
        "message": message,
        "read": False,
        "time": "Just now",
        "created_at": datetime.utcnow()
    })
