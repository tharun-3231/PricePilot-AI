import os
import shutil
import hashlib
import json
import traceback
import pandas as pd
import numpy as np
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks, Depends, Query
from pydantic import BaseModel

from database import (
    UPLOAD_FOLDER,
    DATASET_FOLDER
)
import database_mongo
from routes.auth import get_current_user
from utils.column_mapper import normalize_dataframe
from utils.cleaner import clean_dataset
from utils.feature_engineering import engineer_features
from ai.price_prediction import train_price_model
from ai.demand_forecasting import train_demand_model
from ai.recommendation import generate_recommendations as generate_recommendations_vectorized
from ai.anomaly_detection import detect_anomalies

class ProductRequest(BaseModel):
    product: str
    category: str
    price: float
    stock: float
    sales: float
    revenue: float | None = None
    profit: float | None = None
    margin: float | None = None
    brand: str | None = "Unknown"
    sku: str | None = ""
    description: str | None = ""
    costPrice: float | None = 0.0
    competitorPrice: float | None = 0.0
    image: str | None = ""
    month: str | None = "Jan"

class BulkDeleteRequest(BaseModel):
    ids: list[float]

router = APIRouter()

def get_file_hash(filepath):
    sha256 = hashlib.sha256()
    with open(filepath, "rb") as f:
        while True:
            chunk = f.read(65536)
            if not chunk:
                break
            sha256.update(chunk)
    return sha256.hexdigest()

def sync_csv_from_db_background(user_id: str, file_hash: str):
    """Regenerates the legacy latest_dataset.csv file from MongoDB products collection in the background."""
    try:
        db = database_mongo.get_db()
        rows = list(db.products.find({"user_id": user_id, "dataset_hash": file_hash}))
        
        if rows:
            for r in rows:
                r.pop("_id", None)
                r.pop("user_id", None)
                r.pop("dataset_hash", None)
            df = pd.DataFrame(rows)
            
            user_dataset_dir = os.path.join(DATASET_FOLDER, user_id)
            os.makedirs(user_dataset_dir, exist_ok=True)
            user_latest_dataset = os.path.join(user_dataset_dir, "latest_dataset.csv")
            
            df.to_csv(user_latest_dataset, index=False)
            print(f"[Sync] Saved MongoDB dataset back to {user_latest_dataset} ({len(df)} rows)")
    except Exception as e:
        print(f"[Sync Error] {e}")

def process_dataset_background(user_id: str, file_hash: str, filepath: str, filename: str):
    try:
        # Phase 2: Cleaning Data...
        database_mongo.update_dataset_status(user_id, file_hash, "Cleaning Data...", 25)
        
        # Load and clean CSV in chunks if it's large, then concat
        chunks = []
        chunk_idx = 0
        chunksize = 20000
        
        for chunk in pd.read_csv(filepath, chunksize=chunksize):
            chunk = normalize_dataframe(chunk)
            chunk, report = clean_dataset(chunk)
            chunk = engineer_features(chunk)
            
            # Ensure ID column
            if "id" not in chunk.columns:
                chunk.insert(0, "id", range(chunk_idx * chunksize + 1, chunk_idx * chunksize + len(chunk) + 1))
            
            if "month" not in chunk.columns:
                chunk["month"] = "Jan"
                
            chunks.append(chunk)
            chunk_idx += 1
            
        df = pd.concat(chunks, ignore_index=True)
        
        # Save products to MongoDB
        database_mongo.clear_dataset_products(user_id, file_hash)
        products_list = df.to_dict(orient="records")
        database_mongo.bulk_insert_products(user_id, products_list, file_hash)
        
        # Phase 3: Training AI Model...
        database_mongo.update_dataset_status(user_id, file_hash, "Training AI Model...", 50)
        
        # Subsample for model training to prevent CPU lockups/time-outs
        train_df = df
        if len(df) > 10000:
            train_df = df.sample(n=10000, random_state=42)
            
        try:
            train_price_model(train_df, user_id)
            train_demand_model(train_df, user_id)
        except Exception as e:
            print(f"[ML Pipeline Error] {e}")
            
        # Phase 4: Generating Predictions...
        database_mongo.update_dataset_status(user_id, file_hash, "Generating Predictions...", 75)
        
        # Vectorized recommendations
        try:
            recs_df = generate_recommendations_vectorized(df)
            recs_list = recs_df.to_dict(orient="records")
            database_mongo.bulk_insert_recommendations(user_id, recs_list, file_hash)
        except Exception as e:
            print(f"[Rec Generation Error] {e}")
            
        # Anomalies
        try:
            anoms_list = detect_anomalies(df)
            database_mongo.bulk_insert_anomalies(user_id, anoms_list, file_hash)
        except Exception as e:
            print(f"[Anomaly Generation Error] {e}")
            
        # Phase 5: Updating Dashboard...
        database_mongo.update_dataset_status(user_id, file_hash, "Updating Dashboard...", 90)
        
        stats = database_mongo.calculate_database_stats(user_id, file_hash)
        
        # Final status updates
        _, final_report = clean_dataset(df.head(1000))
        final_report["rows_before"] = len(df)
        final_report["rows_after"] = len(df)
        
        database_mongo.update_dataset_status(
            user_id=user_id,
            file_hash=file_hash,
            status="Completed",
            progress=100,
            rows_count=len(df),
            columns_list=list(df.columns),
            cleaning_report=final_report,
            stats=stats
        )
        
        # Update active pointer
        database_mongo.set_user_active_dataset(user_id, file_hash)
        
        # Legacy writeback
        user_dataset_dir = os.path.join(DATASET_FOLDER, user_id)
        os.makedirs(user_dataset_dir, exist_ok=True)
        user_latest_dataset = os.path.join(user_dataset_dir, "latest_dataset.csv")
        df.to_csv(user_latest_dataset, index=False)
        
    except Exception as e:
        err_msg = f"Error processing: {str(e)}\n{traceback.format_exc()}"
        print(err_msg)
        database_mongo.update_dataset_status(
            user_id=user_id,
            file_hash=file_hash,
            status="Failed",
            progress=100,
            error_message=err_msg
        )

@router.post("/upload")
async def upload_dataset(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a CSV file."
        )

    user_id = str(current_user["_id"])
    user_upload_dir = os.path.join(UPLOAD_FOLDER, user_id)
    os.makedirs(user_upload_dir, exist_ok=True)
    upload_path = os.path.join(user_upload_dir, file.filename)
    
    with open(upload_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        file_hash = get_file_hash(upload_path)
    except Exception:
        raise HTTPException(status_code=500, detail="Could not compute file hash.")

    metadata = database_mongo.get_dataset_metadata(user_id, file_hash)
    
    if metadata and metadata.get("status") == "Completed":
        # Cache Hit: Set active hash and return immediately
        database_mongo.set_user_active_dataset(user_id, file_hash)
        
        # Legacy sync in background just in case dataset was removed
        background_tasks.add_task(sync_csv_from_db_background, user_id, file_hash)
        
        # Prepare preview (limit to 20)
        db = database_mongo.get_db()
        preview_rows = list(db.products.find({"user_id": user_id, "dataset_hash": file_hash}).limit(20))
        for r in preview_rows:
            r.pop("_id", None)
            r.pop("user_id", None)
            r.pop("dataset_hash", None)
        
        return {
            "status": "success",
            "filename": file.filename,
            "file_hash": file_hash,
            "rows": metadata["rows_count"],
            "columns": metadata["columns_list"],
            "preview": preview_rows,
            "stats": metadata["stats"],
            "cleaningReport": metadata["cleaning_report"]
        }
    
    # Initialize background process
    database_mongo.update_dataset_status(
        user_id=user_id,
        file_hash=file_hash,
        status="Uploading...",
        progress=10,
        filename=file.filename
    )
    database_mongo.set_user_active_dataset(user_id, file_hash)
    
    background_tasks.add_task(process_dataset_background, user_id, file_hash, upload_path, file.filename)
    
    return {
        "status": "processing",
        "file_hash": file_hash,
        "filename": file.filename
    }

@router.get("/upload-status")
def get_upload_status(file_hash: str, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    metadata = database_mongo.get_dataset_metadata(user_id, file_hash)
    if not metadata:
        raise HTTPException(status_code=404, detail="Dataset process not found.")
        
    if metadata["status"] == "Completed":
        db = database_mongo.get_db()
        preview_rows = list(db.products.find({"user_id": user_id, "dataset_hash": file_hash}).limit(20))
        for r in preview_rows:
            r.pop("_id", None)
            r.pop("user_id", None)
            r.pop("dataset_hash", None)
            
        return {
            "status": "Completed",
            "progress": 100,
            "filename": metadata["filename"],
            "rows": metadata["rows_count"],
            "columns": metadata["columns_list"],
            "preview": preview_rows,
            "stats": metadata["stats"],
            "cleaningReport": metadata["cleaning_report"]
        }
    
    return {
        "status": metadata["status"],
        "progress": metadata["progress"],
        "error_message": metadata.get("error_message")
    }

@router.get("/products")
def get_products(
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1),
    search: str = Query(""),
    category: str = Query("All"),
    sort: str = Query("default"),
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])
    active_hash = database_mongo.get_user_active_dataset(user_id)
    if not active_hash:
        raise HTTPException(status_code=404, detail="Please upload a dataset first.")
        
    if active_hash == "all":
        metadata = None
        stats = database_mongo.calculate_database_stats(user_id, "all")
        filename = "All Datasets"
    else:
        metadata = database_mongo.get_dataset_metadata(user_id, active_hash)
        stats = metadata.get("stats") if metadata else {}
        filename = metadata.get("filename") if metadata else "latest_dataset.csv"

    db = database_mongo.get_db()
    
    cat_filter = {"user_id": user_id}
    if active_hash != "all":
        cat_filter["dataset_hash"] = active_hash
    categories = db.products.distinct("category", cat_filter)
    categories = [c for c in categories if c]

    query_filter = {"user_id": user_id}
    if active_hash != "all":
        query_filter["dataset_hash"] = active_hash

    if search:
        query_filter["$or"] = [
            {"product": {"$regex": search, "$options": "i"}},
            {"sku": {"$regex": search, "$options": "i"}}
        ]

    if category != "All":
        query_filter["category"] = category
    
    total_count = db.products.count_documents(query_filter)

    sort_fields = []
    if sort == "price-low":
        sort_fields = [("price", 1)]
    elif sort == "price-high":
        sort_fields = [("price", -1)]
    elif sort == "name":
        sort_fields = [("product", 1)]
    else:
        sort_fields = [("id", 1)]

    offset = (page - 1) * limit
    product_rows = list(db.products.find(query_filter).sort(sort_fields).skip(offset).limit(limit))
    for r in product_rows:
        r.pop("_id", None)
        r.pop("user_id", None)
        r.pop("dataset_hash", None)
    
    preview_rows = list(db.products.find(query_filter).limit(20))
    preview = []
    for r in preview_rows:
        r.pop("_id", None)
        r.pop("user_id", None)
        r.pop("dataset_hash", None)
        preview.append(r)

    return {
        "status": "success",
        "filename": filename,
        "rows": total_count,
        "preview": preview,
        "products": product_rows,
        "categories": sorted(categories),
        "stats": stats,
        "totalCount": total_count
    }

@router.get("/products/names")
def get_product_names(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    active_hash = database_mongo.get_user_active_dataset(user_id)
    if not active_hash:
        return []
    
    db = database_mongo.get_db()
    cat_filter = {"user_id": user_id}
    if active_hash != "all":
        cat_filter["dataset_hash"] = active_hash
    names = db.products.distinct("product", cat_filter)
    return sorted([n for n in names if n])

@router.get("/products/by-name")
def get_product_by_name(name: str, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    active_hash = database_mongo.get_user_active_dataset(user_id)
    if not active_hash:
        raise HTTPException(status_code=404, detail="Dataset not loaded.")
        
    db = database_mongo.get_db()
    q = {"user_id": user_id, "product": name}
    if active_hash != "all":
        q["dataset_hash"] = active_hash
    row = db.products.find_one(q)
    
    if not row:
        raise HTTPException(status_code=404, detail="Product not found.")
    row.pop("_id", None)
    row.pop("user_id", None)
    row.pop("dataset_hash", None)
    return row

@router.get("/products/history")
def get_product_history_api(name: str, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    active_hash = database_mongo.get_user_active_dataset(user_id)
    if not active_hash:
        return []
        
    db = database_mongo.get_db()
    q = {"user_id": user_id, "product": name}
    if active_hash != "all":
        q["dataset_hash"] = active_hash
    rows = list(db.products.find(q))
    for r in rows:
        r.pop("_id", None)
        r.pop("user_id", None)
        r.pop("dataset_hash", None)
    return rows
    
    # Fallback to category if too few
    if len(rows) < 3:
        cat_row = db.products.find_one({"user_id": user_id, "dataset_hash": active_hash, "product": name}, projection={"category": 1})
        if cat_row and cat_row.get("category"):
            rows = list(db.products.find({"user_id": user_id, "dataset_hash": active_hash, "category": cat_row["category"]}).limit(12))
            
    for r in rows:
        r.pop("_id", None)
        r.pop("user_id", None)
        r.pop("dataset_hash", None)
    return rows

@router.post("/products")
def add_product(req: ProductRequest, background_tasks: BackgroundTasks, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    active_hash = database_mongo.get_user_active_dataset(user_id)
    if not active_hash:
        raise HTTPException(status_code=404, detail="Please upload a dataset first.")
        
    db = database_mongo.get_db()
    
    # Generate new ID
    max_doc = db.products.find_one({"user_id": user_id, "dataset_hash": active_hash}, sort=[("id", -1)])
    new_id = float(max_doc["id"] + 1) if max_doc and max_doc.get("id") is not None else 1.0

    revenue = req.revenue if req.revenue is not None else req.price * req.sales
    profit = req.profit if req.profit is not None else revenue * 0.3
    margin = req.margin if req.margin is not None else 30.0

    new_product = {
        "user_id": user_id,
        "dataset_hash": active_hash,
        "id": new_id,
        "product": req.product,
        "category": req.category,
        "price": req.price,
        "stock": req.stock,
        "sales": req.sales,
        "revenue": revenue,
        "profit": profit,
        "margin": margin,
        "brand": req.brand or "Unknown",
        "sku": req.sku or "",
        "description": req.description or "",
        "costPrice": req.costPrice or 0.0,
        "competitorPrice": req.competitorPrice or 0.0,
        "image": req.image or "",
        "month": req.month or "Jan"
    }

    db.products.insert_one(new_product)

    # Recalculate stats
    new_stats = database_mongo.calculate_database_stats(user_id, active_hash)
    database_mongo.update_dataset_status(user_id, active_hash, status=None, progress=None, stats=new_stats)
    
    # Sync in background
    background_tasks.add_task(sync_csv_from_db_background, user_id, active_hash)

    # Return get_products response structure
    return get_products(page=1, limit=25, current_user=current_user)

@router.put("/products/{product_id}")
def update_product(product_id: float, req: ProductRequest, background_tasks: BackgroundTasks, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    active_hash = database_mongo.get_user_active_dataset(user_id)
    if not active_hash:
        raise HTTPException(status_code=404, detail="Please upload a dataset first.")
        
    db = database_mongo.get_db()
    row = db.products.find_one({"user_id": user_id, "dataset_hash": active_hash, "id": product_id})
    if not row:
        raise HTTPException(status_code=404, detail="Product not found.")

    revenue = req.revenue if req.revenue is not None else req.price * req.sales
    profit = req.profit if req.profit is not None else revenue * 0.3
    margin = req.margin if req.margin is not None else 30.0

    update_fields = {
        "product": req.product,
        "category": req.category,
        "price": req.price,
        "stock": req.stock,
        "sales": req.sales,
        "revenue": revenue,
        "profit": profit,
        "margin": margin,
        "brand": req.brand or "Unknown",
        "sku": req.sku or "",
        "description": req.description or "",
        "costPrice": req.costPrice or 0.0,
        "competitorPrice": req.competitorPrice or 0.0,
        "image": req.image or "",
        "month": req.month or "Jan"
    }

    db.products.update_one(
        {"user_id": user_id, "dataset_hash": active_hash, "id": product_id},
        {"$set": update_fields}
    )

    new_stats = database_mongo.calculate_database_stats(user_id, active_hash)
    database_mongo.update_dataset_status(user_id, active_hash, status=None, progress=None, stats=new_stats)
    
    background_tasks.add_task(sync_csv_from_db_background, user_id, active_hash)

    return get_products(page=1, limit=25, current_user=current_user)

@router.delete("/products/{product_id}")
def delete_product(product_id: float, background_tasks: BackgroundTasks, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    active_hash = database_mongo.get_user_active_dataset(user_id)
    if not active_hash:
        raise HTTPException(status_code=404, detail="Please upload a dataset first.")
        
    db = database_mongo.get_db()
    row = db.products.find_one({"user_id": user_id, "dataset_hash": active_hash, "id": product_id})
    if not row:
        raise HTTPException(status_code=404, detail="Product not found.")

    db.products.delete_one({"user_id": user_id, "dataset_hash": active_hash, "id": product_id})

    new_stats = database_mongo.calculate_database_stats(user_id, active_hash)
    database_mongo.update_dataset_status(user_id, active_hash, status=None, progress=None, stats=new_stats)
    
    background_tasks.add_task(sync_csv_from_db_background, user_id, active_hash)

    return get_products(page=1, limit=25, current_user=current_user)

@router.post("/products/bulk-delete")
def bulk_delete_products(req: BulkDeleteRequest, background_tasks: BackgroundTasks, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    active_hash = database_mongo.get_user_active_dataset(user_id)
    if not active_hash:
        raise HTTPException(status_code=404, detail="Please upload a dataset first.")
        
    db = database_mongo.get_db()
    db.products.delete_many({"user_id": user_id, "dataset_hash": active_hash, "id": {"$in": req.ids}})

    new_stats = database_mongo.calculate_database_stats(user_id, active_hash)
    database_mongo.update_dataset_status(user_id, active_hash, status=None, progress=None, stats=new_stats)
    
    background_tasks.add_task(sync_csv_from_db_background, user_id, active_hash)

    return get_products(page=1, limit=25, current_user=current_user)

class SelectDatasetRequest(BaseModel):
    file_hash: str | None = None

@router.get("/datasets")
def get_datasets(current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    db = database_mongo.get_db()
    datasets = list(db.datasets.find({"user_id": user_id}))
    for d in datasets:
        d["_id"] = str(d["_id"])
    return datasets

@router.post("/datasets/select")
def select_dataset(req: SelectDatasetRequest, current_user: dict = Depends(get_current_user)):
    user_id = str(current_user["_id"])
    db = database_mongo.get_db()
    
    if req.file_hash and req.file_hash != "all":
        ds = db.datasets.find_one({"user_id": user_id, "file_hash": req.file_hash})
        if not ds:
            raise HTTPException(status_code=400, detail="Dataset not found.")
            
    db.users.update_one(
        {"_id": database_mongo.ObjectId(user_id)},
        {"$set": {"active_dataset_hash": req.file_hash}}
    )
    
    dataset_name = "All Datasets"
    if req.file_hash and req.file_hash != "all":
        ds = db.datasets.find_one({"user_id": user_id, "file_hash": req.file_hash})
        if ds:
            dataset_name = ds.get("filename", "Unknown Dataset")
            
    database_mongo.log_activity(user_id, "Switch Workspace", f"Switched active workspace to: {dataset_name}")
    return {"status": "success", "message": f"Workspace switched to {dataset_name}", "active_dataset_hash": req.file_hash}