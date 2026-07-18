import database_mongo

class PricePilotAssistant:
    def __init__(self, user_id, active_hash):
        self.user_id = user_id
        self.active_hash = active_hash

    def answer(self, question):
        if not self.active_hash:
            return {"answer": "No dataset loaded. Please upload a dataset first."}

        question = question.lower()
        db = database_mongo.get_db()

        try:
            if "highest revenue" in question:
                row = db.products.find_one({"user_id": self.user_id, "dataset_hash": self.active_hash}, sort=[("revenue", -1)])
                if row:
                    return {"answer": f'{row["product"]} generated the highest revenue (₹{row["revenue"]:,.2f}).'}
                return {"answer": "No product records found."}

            elif "highest sales" in question:
                row = db.products.find_one({"user_id": self.user_id, "dataset_hash": self.active_hash}, sort=[("sales", -1)])
                if row:
                    return {"answer": f'{row["product"]} recorded the highest sales ({int(row["sales"]):,} units).'}
                return {"answer": "No product records found."}

            elif "lowest stock" in question:
                row = db.products.find_one({"user_id": self.user_id, "dataset_hash": self.active_hash}, sort=[("stock", 1)])
                if row:
                    return {"answer": f'{row["product"]} has the lowest stock ({int(row["stock"])} left).'}
                return {"answer": "No product records found."}

            elif "average price" in question:
                agg = list(db.products.aggregate([
                    {"$match": {"user_id": self.user_id, "dataset_hash": self.active_hash}},
                    {"$group": {"_id": None, "val": {"$avg": "$price"}}}
                ]))
                val = agg[0]["val"] if agg else 0.0
                return {"answer": f'Average price is ₹{val:,.2f}'}

            elif "total revenue" in question:
                agg = list(db.products.aggregate([
                    {"$match": {"user_id": self.user_id, "dataset_hash": self.active_hash}},
                    {"$group": {"_id": None, "val": {"$sum": "$revenue"}}}
                ]))
                val = agg[0]["val"] if agg else 0.0
                return {"answer": f'Total revenue is ₹{val:,.2f}'}

            else:
                return {
                    "answer": "Sorry, I couldn't understand your question. Try asking about 'highest revenue', 'highest sales', 'lowest stock', 'average price', or 'total revenue'."
                }
        except Exception as e:
            return {"answer": f"Error answering question: {str(e)}"}